import test, { before } from "node:test";
import assert from "node:assert/strict";
import { getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import {
  getFirestore,
  connectFirestoreEmulator,
  getDoc,
  getDocs,
  doc,
  collection,
} from "firebase/firestore";

// Run after `node functions/set-test-claims.js`, with the emulators running.
// Use `node --test --test-concurrency=1 tests/` so files do not interleave.

const firebaseConfig = {
  projectId: "demo-medilink",
  apiKey: "demo-api-key",
  authDomain: "demo-medilink.firebaseapp.com",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");
const firestore = getFirestore(app);

connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const PASSWORD = "TestPass123!";

const call = (name) => httpsCallable(functions, name);

async function as(email, fn) {
  await signInWithEmailAndPassword(auth, email, PASSWORD);
  try {
    return await fn();
  } finally {
    await signOut(auth);
  }
}

const isCode = (code) => (error) => error.code === `functions/${code}`;

before(async () => {
  // Fail fast with a clear message if the seed script has not been run.
  await signInWithEmailAndPassword(auth, "admin1@test.local", PASSWORD);
  await signOut(auth);
});

// ---------------------------------------------------------------------------
// Registration, access grants, patient search
// ---------------------------------------------------------------------------

test("new user can register as a patient and read their own patient document", async () => {
  const email = `newpatient${Date.now()}@test.local`;
  await createUserWithEmailAndPassword(auth, email, PASSWORD);

  const result = await call("registerPatient")({
    displayName: "Registered Patient",
    dateOfBirth: "1990-05-17",
    phone: "0820000000",
  });

  assert.equal(result.data.role, "patient");
  assert.ok(result.data.patientId);
  assert.match(result.data.mediCareId, /^ML-\d{8}$/);

  // Claims only appear after a forced token refresh.
  const token = await auth.currentUser.getIdTokenResult(true);
  assert.equal(token.claims.role, "patient");
  assert.equal(token.claims.pid, result.data.patientId);

  const snap = await getDoc(doc(firestore, "Patients", result.data.patientId));
  assert.equal(snap.exists(), true);

  // A second registration is refused.
  await assert.rejects(
    () => call("registerPatient")({ displayName: "Again" }),
    isCode("already-exists"),
  );

  globalThis.__registered = {
    email,
    patientId: result.data.patientId,
    mediCareId: result.data.mediCareId,
  };

  await signOut(auth);
});

test("registration cannot choose a role", async () => {
  const email = `rolegrab${Date.now()}@test.local`;
  await createUserWithEmailAndPassword(auth, email, PASSWORD);

  await assert.rejects(
    () => call("registerPatient")({ displayName: "X", role: "admin" }),
    isCode("invalid-argument"),
  );

  await signOut(auth);
});

test("patient cannot create an access grant", async () => {
  const { patientId } = globalThis.__registered;

  await as(globalThis.__registered.email, async () => {
    await assert.rejects(
      () =>
        call("createAccessGrant")({
          patientId,
          clinicianAccountId: "clinician-account1",
        }),
      isCode("permission-denied"),
    );
  });
});

test("clinician cannot find a patient without a grant, then can after an admin grants access, and loses access after the patient revokes it", async () => {
  const { patientId, mediCareId, email } = globalThis.__registered;

  await as("clinician1@test.local", async () => {
    await assert.rejects(
      () => call("findPatient")({ mediCareId }),
      isCode("permission-denied"),
    );
  });

  await as("admin1@test.local", async () => {
    const grant = await call("createAccessGrant")({
      mediCareId,
      clinicianAccountId: "clinician-account1",
      expiresInHours: 2,
    });
    assert.equal(grant.data.state, "active");
  });

  await as("clinician1@test.local", async () => {
    const found = await call("findPatient")({ mediCareId });
    assert.equal(found.data.patientId, patientId);
    assert.equal(found.data.displayName, "Registered Patient");
  });

  await as(email, async () => {
    await call("revokeAccessGrant")({
      patientId,
      clinicianAccountId: "clinician-account1",
    });
  });

  await as("clinician1@test.local", async () => {
    await assert.rejects(
      () => call("findPatient")({ mediCareId }),
      isCode("permission-denied"),
    );
  });
});

// ---------------------------------------------------------------------------
// Initial history review
// ---------------------------------------------------------------------------

test("clinician approves the initial history and the patient can read the locked items", async () => {
  await as("patient1@test.local", async () => {
    await call("submitInitialClinicalHistory")({
      conditions: [{ name: "Hypertension" }],
      allergies: [{ name: "Penicillin", reaction: "Rash" }],
      medications: [],
      familyHistory: [{ relative: "Mother", condition: "Type 2 diabetes" }],
    });
  });

  await as("clinician1@test.local", async () => {
    const reviewed = await call("reviewInitialSubmission")({
      patientId: "patient1",
      decision: "approved",
    });
    assert.equal(reviewed.data.status, "approved");
    assert.equal(reviewed.data.itemCount, 3);

    await assert.rejects(
      () =>
        call("reviewInitialSubmission")({
          patientId: "patient1",
          decision: "approved",
        }),
      isCode("failed-precondition"),
    );
  });

  await as("patient1@test.local", async () => {
    const conditions = await getDocs(
      collection(firestore, "Patients", "patient1", "Conditions"),
    );
    assert.ok(conditions.size >= 1);

    const item = conditions.docs[0];
    const version = await getDoc(
      doc(firestore, "Patients", "patient1", "Conditions", item.id, "Versions", "v1"),
    );
    assert.equal(version.get("approvalLabel"), "clinician-approved");
    assert.equal(version.get("source"), "patient-stated");
  });
});

// ---------------------------------------------------------------------------
// Consultation -> patient sees it -> correction creates v2, v1 preserved
// ---------------------------------------------------------------------------

test("consultation is visible to the patient, and an approved correction adds v2 while v1 is preserved", async () => {
  let encounterId;
  let requestId;
  let grantId;

  await as("clinician1@test.local", async () => {
    const draft = await call("createConsultationDraft")({
      patientId: "patient1",
      presentingConcern: "Follow-up",
      assessment: "Original assessment",
    });

    const submitted = await call("submitConsultation")({
      draftId: draft.data.draftId,
    });
    encounterId = submitted.data.encounterId;
  });

  // The patient can read the new encounter (this is what the path fix enables).
  await as("patient1@test.local", async () => {
    const v1 = await getDoc(
      doc(firestore, "Patients", "patient1", "Encounters", encounterId, "Versions", "v1"),
    );
    assert.equal(v1.get("assessment"), "Original assessment");

    const created = await call("createCorrectionRequest")({
      targetCollection: "Encounters",
      targetItemId: encounterId,
      targetVersionId: "v1",
      targetField: "assessment",
      reason: "Wrong assessment recorded.",
    });
    requestId = created.data.requestId;

    // Provenance fields cannot be targeted.
    await assert.rejects(
      () =>
        call("createCorrectionRequest")({
          targetCollection: "Encounters",
          targetItemId: encounterId,
          targetVersionId: "v1",
          targetField: "authorAccountId",
          reason: "Trying to rewrite the author.",
        }),
      isCode("invalid-argument"),
    );
  });

  await as("clinician1@test.local", async () => {
    await call("reviewCorrectionRequest")({ requestId, decision: "approved" });

    const grant = await call("createEditGrant")({
      patientId: "patient1",
      requestId,
      targetCollection: "Encounters",
      targetItemId: encounterId,
      targetField: "assessment",
      targetVersionId: "v1",
      expiresInMinutes: 30,
    });
    grantId = grant.data.grantId;
  });

  await as("patient1@test.local", async () => {
    await call("submitCorrectionProposal")({
      grantId,
      proposedValue: "Corrected assessment",
      evidence: "Clinic letter dated today",
    });

    // Submitting a proposal must not change the approved record.
    const stillV1 = await getDoc(
      doc(firestore, "Patients", "patient1", "Encounters", encounterId),
    );
    assert.equal(stillV1.get("currentVersionId"), "v1");
  });

  await as("clinician1@test.local", async () => {
    const reviewed = await call("reviewCorrectionProposal")({
      requestId,
      decision: "approved",
      reason: "Evidence accepted",
    });
    assert.equal(reviewed.data.state, "applied");
    assert.equal(reviewed.data.versionId, "v2");

    // Cannot be applied twice.
    await assert.rejects(
      () => call("reviewCorrectionProposal")({ requestId, decision: "approved" }),
      isCode("failed-precondition"),
    );
  });

  await as("patient1@test.local", async () => {
    const item = await getDoc(
      doc(firestore, "Patients", "patient1", "Encounters", encounterId),
    );
    assert.equal(item.get("currentVersionId"), "v2");

    const v1 = await getDoc(
      doc(firestore, "Patients", "patient1", "Encounters", encounterId, "Versions", "v1"),
    );
    const v2 = await getDoc(
      doc(firestore, "Patients", "patient1", "Encounters", encounterId, "Versions", "v2"),
    );

    assert.equal(v1.get("assessment"), "Original assessment");
    assert.equal(v2.get("assessment"), "Corrected assessment");
    assert.equal(v2.get("supersedesVersionId"), "v1");
    assert.equal(v2.get("authorAccountId"), v1.get("authorAccountId"));
  });

  // Another patient cannot read it.
  await as("patient2@test.local", async () => {
    await assert.rejects(() =>
      getDoc(
        doc(firestore, "Patients", "patient1", "Encounters", encounterId, "Versions", "v2"),
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Audited summary
// ---------------------------------------------------------------------------

test("getPatientSummary returns current versions for a granted clinician and refuses others", async () => {
  await as("clinician1@test.local", async () => {
    const result = await call("getPatientSummary")({
      patientId: "patient1",
      facilityId: "facility-a",
    });

    assert.equal(result.data.patientId, "patient1");
    assert.ok(Array.isArray(result.data.summary.Encounters));
    assert.ok(result.data.summary.Encounters.length >= 1);
    assert.ok(result.data.summary.Conditions.length >= 1);

    await assert.rejects(
      () => call("getPatientSummary")({ patientId: "patient2" }),
      isCode("permission-denied"),
    );
  });

  await as("patient1@test.local", async () => {
    await assert.rejects(
      () => call("getPatientSummary")({ patientId: "patient1" }),
      isCode("permission-denied"),
    );
  });
});