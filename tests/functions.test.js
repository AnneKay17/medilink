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

} from "firebase/firestore";
const firebaseConfig = {
  projectId: "demo-medilink",
  apiKey: "demo-api-key",
  authDomain: "demo-medilink.firebaseapp.com",
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");

const firestore = getFirestore(app);

connectFirestoreEmulator(firestore, "127.0.0.1", 8080);

connectAuthEmulator(auth, "http://127.0.0.1:9099", {
  disableWarnings: true,
});

connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const submitInitialClinicalHistory = httpsCallable(
  functions,
  "submitInitialClinicalHistory",
);

const createCorrectionRequest = httpsCallable(
  functions,
  "createCorrectionRequest",
);

const PASSWORD = "TestPass123!";

const users = [
  {
    email: "patient1@test.local",
    mid: "account1",
    pid: "patient1",
  },
  {
    email: "patient2@test.local",
    mid: "account2",
    pid: "patient2",
  },
  {
    email: "norole@test.local",
  },
];

async function ensureUser(user) {
  try {
    await signInWithEmailAndPassword(auth, user.email, PASSWORD);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    await createUserWithEmailAndPassword(auth, user.email, PASSWORD);
  }

  await signOut(auth);
}

before(async () => {
  for (const user of users) {
    await ensureUser(user);
  }
});

async function signIn(email) {
  await signInWithEmailAndPassword(auth, email, PASSWORD);
}

const validData = {
  conditions: [
    {
      name: "Asthma",
      diagnosisDate: "2020-01-01",
      notes: "Test condition",
    },
  ],
  allergies: [],
  medications: [],
  familyHistory: [],
};

test("valid patient can submit initial clinical history", async () => {
  await signIn("patient2@test.local");

  const result = await submitInitialClinicalHistory(validData);

  assert.equal(result.data.status, "pending");

  await signOut(auth);
});

test("duplicate initial submission is rejected", async () => {
  await signIn("patient2@test.local");

  await assert.rejects(
    () => submitInitialClinicalHistory(validData),
    (error) => error.code === "functions/already-exists",
  );

  await signOut(auth);
});

test("patient with mismatched account ownership is rejected", async () => {
  await signIn("ownership@test.local");

  await assert.rejects(
    () => submitInitialClinicalHistory(validData),
    (error) =>
      error.code === "functions/permission-denied" &&
      error.message.includes("patient profile"),
  );

  await signOut(auth);
});

test("unsupported top-level field is rejected", async () => {
  await signIn("patient1@test.local");

  await assert.rejects(
    () =>
      submitInitialClinicalHistory({
        ...validData,
        secretField: "should not be accepted",
      }),
    (error) => error.code === "functions/invalid-argument",
  );

  await signOut(auth);
});

test("invalid category type is rejected", async () => {
  await signIn("patient1@test.local");

  await assert.rejects(
    () =>
      submitInitialClinicalHistory({
        ...validData,
        conditions: "not-an-array",
      }),
    (error) => error.code === "functions/invalid-argument",
  );

  await signOut(auth);
});

test("missing required condition name is rejected", async () => {
  await signIn("patient1@test.local");

  await assert.rejects(
    () =>
      submitInitialClinicalHistory({
        ...validData,
        conditions: [{ notes: "Missing name" }],
      }),
    (error) => error.code === "functions/invalid-argument",
  );

  await signOut(auth);
});

test("unsupported nested field is rejected", async () => {
  await signIn("patient1@test.local");

  await assert.rejects(
    () =>
      submitInitialClinicalHistory({
        ...validData,
        conditions: [
          {
            name: "Asthma",
            unexpectedField: "not allowed",
          },
        ],
      }),
    (error) => error.code === "functions/invalid-argument",
  );

  await signOut(auth);
});

test("entry text longer than 500 characters is rejected", async () => {
  await signIn("patient1@test.local");

  await assert.rejects(
    () =>
      submitInitialClinicalHistory({
        ...validData,
        conditions: [
          {
            name: "A".repeat(501),
          },
        ],
      }),
    (error) => error.code === "functions/invalid-argument",
  );

  await signOut(auth);
});

test("patient without patient role is rejected", async () => {
  await signIn("norole@test.local");

  await assert.rejects(
    () => submitInitialClinicalHistory(validData),
    (error) => error.code === "functions/permission-denied",
  );

  await signOut(auth);
});

test("unauthenticated request is rejected", async () => {
  await signOut(auth);

  await assert.rejects(
    () => submitInitialClinicalHistory(validData),
    (error) => error.code === "functions/unauthenticated",
  );
});

test("clinician can create a consultation draft", async () => {
  await signIn("clinician1@test.local");

  const createConsultationDraft = httpsCallable(
    functions,
    "createConsultationDraft",
  );

  const result = await createConsultationDraft({
    patientId: "patient1",
    presentingConcern: "Routine follow-up",
    history: "Patient reports feeling well.",
    assessment: "No immediate concerns.",
    treatment: "Continue current care.",
    followUp: "Follow up in 3 months.",
  });

  assert.equal(result.data.status, "draft");
  assert.ok(result.data.draftId);

  await signOut(auth);
});


test("clinician can submit a consultation and create a locked version", async () => {
  await signIn("clinician1@test.local");

  const createConsultationDraft = httpsCallable(
    functions,
    "createConsultationDraft",
  );

  const draftResult = await createConsultationDraft({
    patientId: "patient1",
    presentingConcern: "Headache",
    history: "Patient reports occasional headaches.",
    assessment: "Assessment recorded by clinician.",
    treatment: "Hydration and monitoring.",
    followUp: "Review if symptoms continue.",
  });

  const submitConsultation = httpsCallable(
    functions,
    "submitConsultation",
  );

  const result = await submitConsultation({
    draftId: draftResult.data.draftId,
  });

  assert.equal(result.data.status, "approved");
  assert.ok(result.data.encounterId);
  assert.equal(result.data.versionId, "v1");

  await signOut(auth);
});


test("clinician cannot submit the same consultation twice", async () => {
  await signIn("clinician1@test.local");

  const createConsultationDraft = httpsCallable(
    functions,
    "createConsultationDraft",
  );

  const draftResult = await createConsultationDraft({
    patientId: "patient1",
    presentingConcern: "Repeat submission test",
  });

  const submitConsultation = httpsCallable(
    functions,
    "submitConsultation",
  );

  await submitConsultation({
    draftId: draftResult.data.draftId,
  });

  await assert.rejects(
    () =>
      submitConsultation({
        draftId: draftResult.data.draftId,
      }),
    (error) => error.code === "functions/failed-precondition",
  );

  await signOut(auth);
});


test("clinician without clinical access cannot create a consultation draft", async () => {
  await signIn("clinician1@test.local");

  const createConsultationDraft = httpsCallable(
    functions,
    "createConsultationDraft",
  );

  await assert.rejects(
    () =>
      createConsultationDraft({
        patientId: "patient2",
        presentingConcern: "Unauthorized consultation",
      }),
    (error) => error.code === "functions/permission-denied",
  );

  await signOut(auth);
});

test("approved correction can receive a temporary edit grant and patient proposal", async () => {
  // Patient creates a correction request.
  await signIn("patient1@test.local");

  const correctionResult = await createCorrectionRequest({
    targetCollection: "Conditions",
    targetItemId: "condition-test-1",
    targetVersionId: "v1",
    targetField: "name",
    reason: "The condition name is incorrect.",
  });

  const requestId = correctionResult.data.requestId;

  assert.equal(correctionResult.data.state, "submitted");
  assert.ok(requestId);

  await signOut(auth);

  // Clinician reviews the request.
  await signIn("clinician1@test.local");

  const reviewCorrectionRequest = httpsCallable(
    functions,
    "reviewCorrectionRequest",
  );

  const reviewResult = await reviewCorrectionRequest({
    requestId,
    decision: "approved",
    reason: "Correction can be submitted for review.",
  });

  assert.equal(reviewResult.data.state, "approved");

  // Clinician grants temporary access.
  const createEditGrant = httpsCallable(
    functions,
    "createEditGrant",
  );

  const grantResult = await createEditGrant({
    patientId: "patient1",
    requestId,
    targetCollection: "Conditions",
    targetItemId: "condition-test-1",
    targetField: "name",
    targetVersionId: "v1",
    expiresInMinutes: 30,
  });

  assert.equal(grantResult.data.state, "active");
  assert.ok(grantResult.data.grantId);

  const grantId = grantResult.data.grantId;

  await signOut(auth);

  // Patient uses the temporary grant.
  await signIn("patient1@test.local");

  const submitCorrectionProposal = httpsCallable(
    functions,
    "submitCorrectionProposal",
  );

  const proposalResult = await submitCorrectionProposal({
    grantId,
    proposedValue: "Asthma",
    evidence: "Patient confirmed the correction.",
  });

  assert.equal(
    proposalResult.data.state,
    "proposal_submitted",
  );

  await signOut(auth);
});

  