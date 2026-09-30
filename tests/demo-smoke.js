// Runs the main demo story against the seeded emulators, without a UI:
//   Dr Mokoena finds Nomsa, sees the allergy, adds a consultation,
//   then Nomsa logs in and sees it.
//
// Usage (emulators running and `npm run seed` done):  node tests/demo-smoke.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import {
  getFirestore,
  connectFirestoreEmulator,
  getDocs,
  getDoc,
  doc,
  collection,
} from "firebase/firestore";

const app = initializeApp({
  projectId: "demo-medilink",
  apiKey: "demo-api-key",
  authDomain: "demo-medilink.firebaseapp.com",
});

const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");
const db = getFirestore(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const PASSWORD = "DemoPass123!";
const call = (name) => httpsCallable(functions, name);

function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    process.exitCode = 1;
  }
}

async function main() {
  // 1. Doctor finds Nomsa and reads her summary.
  await signInWithEmailAndPassword(auth, "dr.mokoena@medilink.demo", PASSWORD);

  const found = await call("findPatient")({ mediCareId: "ML-10000001" });
  check("Dr Mokoena finds Nomsa by MediCare ID", found.data.displayName === "Nomsa Dlamini");

  const summary = await call("getPatientSummary")({
    patientId: found.data.patientId,
    facilityId: "hospital-b",
  });
  const allergies = summary.data.summary.Allergies.map((a) => a.name);
  check("Penicillin allergy is visible", allergies.includes("Penicillin"));
  check(
    "Hypertension is visible",
    summary.data.summary.Conditions.some((c) => c.name === "Hypertension")
  );
  check(
    "Family history is visible",
    summary.data.summary.FamilyHistory.length === 3
  );

  // 2. Doctor adds a consultation.
  const draft = await call("createConsultationDraft")({
    patientId: found.data.patientId,
    presentingConcern: "Routine blood pressure review",
    assessment: "Blood pressure controlled on current medication",
    followUp: "Review in 3 months",
  });
  const submitted = await call("submitConsultation")({
    draftId: draft.data.draftId,
  });
  check("Consultation submitted and locked as v1", submitted.data.versionId === "v1");

  // Doctor cannot open a patient with no grant.
  let blocked = false;
  try {
    await call("findPatient")({ mediCareId: "ML-99999999" });
  } catch {
    blocked = true;
  }
  check("Unknown or ungranted patient is refused", blocked);

  await signOut(auth);

  // 3. Nomsa logs in and sees the new consultation.
  await signInWithEmailAndPassword(auth, "nomsa@medilink.demo", PASSWORD);

  const encounters = await getDocs(
    collection(db, "Patients", "pat-nomsa", "Encounters")
  );
  check("Nomsa sees the consultation", encounters.size >= 1);

  const version = await getDoc(
    doc(
      db,
      "Patients",
      "pat-nomsa",
      "Encounters",
      submitted.data.encounterId,
      "Versions",
      "v1"
    )
  );
  check(
    "Consultation is attributed to Dr Mokoena",
    version.exists() && version.get("authorAccountId") === "acct-dr-mokoena"
  );

  // Nomsa cannot ask for another patient's summary.
  let patientBlocked = false;
  try {
    await call("getPatientSummary")({ patientId: "pat-nomsa" });
  } catch {
    patientBlocked = true;
  }
  check("Patient cannot use the clinician summary function", patientBlocked);

  await signOut(auth);

  console.log(process.exitCode ? "\nSome checks FAILED." : "\nDemo story works end to end.");
  process.exit(process.exitCode || 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});