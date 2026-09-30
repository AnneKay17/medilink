// Seeds the demo story into the emulators:
//   Nomsa Dlamini (hypertension, penicillin allergy) has an approved record,
//   Dr Mokoena can open it, and an admin exists.
// Safe to run repeatedly: it uses fixed IDs and overwrites them.
//
// Usage (emulators running):  node functions/seed-demo.js

process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp({ projectId: "demo-medilink" });

const auth = getAuth();
const db = getFirestore();

const PASSWORD = "DemoPass123!";

const PATIENTS = [
  {
    email: "nomsa@medilink.demo",
    accountId: "acct-nomsa",
    patientId: "pat-nomsa",
    mediCareId: "ML-10000001",
    displayName: "Nomsa Dlamini",
    dateOfBirth: "1991-03-14",
    conditions: [{ name: "Hypertension", diagnosisDate: "2022-06-01" }],
    allergies: [{ name: "Penicillin", reaction: "Rash", severity: "Moderate" }],
    medications: [{ name: "Amlodipine", dosage: "5 mg", frequency: "Once daily" }],
    familyHistory: [
      { relative: "Mother", condition: "Type 2 diabetes" },
      { relative: "Father", condition: "Hypertension" },
      { relative: "Grandmother", condition: "Breast cancer" },
    ],
  },
  {
    email: "thabo@medilink.demo",
    accountId: "acct-thabo",
    patientId: "pat-thabo",
    mediCareId: "ML-10000002",
    displayName: "Thabo Mokoena",
    dateOfBirth: "1984-11-02",
    conditions: [{ name: "Type 2 diabetes", diagnosisDate: "2020-09-15" }],
    allergies: [],
    medications: [{ name: "Metformin", dosage: "500 mg", frequency: "Twice daily" }],
    familyHistory: [{ relative: "Father", condition: "Type 2 diabetes" }],
  },
];

const STAFF = [
  {
    email: "dr.mokoena@medilink.demo",
    accountId: "acct-dr-mokoena",
    displayName: "Dr Mokoena",
    role: "clinician",
  },
  {
    email: "admin@medilink.demo",
    accountId: "acct-admin",
    displayName: "MediLink Admin",
    role: "admin",
  },
];

const COLLECTIONS = {
  conditions: "Conditions",
  allergies: "Allergies",
  medications: "Medications",
  familyHistory: "FamilyHistory",
};

async function getOrCreateUser(email) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: PASSWORD });
    return user;
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
    return auth.createUser({ email, password: PASSWORD });
  }
}

async function main() {
  const now = FieldValue.serverTimestamp();
  const clinicianAccountId = STAFF.find((s) => s.role === "clinician").accountId;

  for (const person of STAFF) {
    const user = await getOrCreateUser(person.email);
    await auth.setCustomUserClaims(user.uid, {
      role: person.role,
      mid: person.accountId,
    });
    await db.collection("Users").doc(person.accountId).set({
      authUid: user.uid,
      role: person.role,
      displayName: person.displayName,
      contact: { email: person.email },
      createdAt: now,
    });
    console.log(`${person.role}: ${person.email}`);
  }

  for (const p of PATIENTS) {
    const user = await getOrCreateUser(p.email);
    await auth.setCustomUserClaims(user.uid, {
      role: "patient",
      mid: p.accountId,
      pid: p.patientId,
    });

    await db.collection("Users").doc(p.accountId).set({
      authUid: user.uid,
      role: "patient",
      patientId: p.patientId,
      displayName: p.displayName,
      contact: { email: p.email },
      createdAt: now,
    });

    await db.collection("Patients").doc(p.patientId).set({
      accountId: p.accountId,
      mediCareId: p.mediCareId,
      displayName: p.displayName,
      dateOfBirth: p.dateOfBirth,
      contact: { email: p.email },
      createdAt: now,
    });

    await db.collection("PatientIdIndex").doc(p.mediCareId).set({
      patientId: p.patientId,
      createdAt: now,
    });

    // Approved, locked v1 records, in the same shape the review function writes.
    for (const [category, collectionName] of Object.entries(COLLECTIONS)) {
      let index = 0;
      for (const entry of p[category]) {
        index += 1;
        const itemRef = db
          .collection("Patients")
          .doc(p.patientId)
          .collection(collectionName)
          .doc(`${category}-${index}`);

        await itemRef.set({
          patientId: p.patientId,
          currentVersionId: "v1",
          createdAt: now,
          updatedAt: now,
        });

        await itemRef.collection("Versions").doc("v1").set({
          ...entry,
          versionId: "v1",
          itemId: itemRef.id,
          patientId: p.patientId,
          source: "patient-stated",
          suppliedByAccountId: p.accountId,
          approvalLabel: "clinician-approved",
          reviewerAccountId: clinicianAccountId,
          approvedAt: now,
          createdAt: now,
        });
      }
    }

    // Standing 30-day grant so Dr Mokoena can open this patient in the demo.
    await db.collection("AccessGrants").doc(`${p.patientId}_${clinicianAccountId}`).set({
      patientId: p.patientId,
      accountId: clinicianAccountId,
      state: "active",
      startsAt: new Date(Date.now() - 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      scope: { clinical: true, identity: true },
      createdAt: now,
    });

    console.log(`patient: ${p.email} (${p.mediCareId})`);
  }

  console.log("\nDemo data ready. Password for every account:", PASSWORD);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});