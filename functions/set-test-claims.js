const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

initializeApp({
  projectId: "demo-medilink"
});

const auth = getAuth();
const db = getFirestore();

const PASSWORD = "TestPass123!";

const TEST_USERS = [
  {
    email: "patient1@test.local",
    claims: { role: "patient", mid: "account1", pid: "patient1" }
  },
  {
    email: "patient2@test.local",
    claims: { role: "patient", mid: "account2", pid: "patient2" }
  },
  {
    email: "patient3@test.local",
    claims: { role: "patient", mid: "account3", pid: "patient3" }
  },
  {
    email: "norole@test.local",
    claims: null
  },
  {
    // Deliberately mismatched: account2 does not own patient3.
    email: "ownership@test.local",
    claims: { role: "patient", mid: "account2", pid: "patient3" }
  },
  {
    email: "clinician1@test.local",
    claims: { role: "clinician", mid: "clinician-account1" }
  },
  {
    email: "admin1@test.local",
    claims: { role: "admin", mid: "admin-account1" }
  }
];

async function getOrCreateUser(email) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: PASSWORD });
    return user;
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    return auth.createUser({
      email,
      password: PASSWORD,
      emailVerified: false
    });
  }
}

async function main() {
  const uids = {};

  for (const testUser of TEST_USERS) {
    const user = await getOrCreateUser(testUser.email);

    await auth.setCustomUserClaims(user.uid, testUser.claims);
    uids[testUser.email] = user.uid;

    console.log(`${testUser.email} -> UID: ${user.uid}`);
  }

  // Patient documents used by the ownership checks.
  for (const [patientId, accountId] of [
    ["patient1", "account1"],
    ["patient2", "account2"],
    ["patient3", "account3"]
  ]) {
    await db.collection("Patients").doc(patientId).set(
      {
        accountId,
        displayName: `Test ${patientId}`,
        mediCareId: `ML-0000000${patientId.slice(-1)}`
      },
      { merge: true }
    );

    await db.collection("PatientIdIndex").doc(`ML-0000000${patientId.slice(-1)}`).set(
      { patientId },
      { merge: true }
    );
  }

  // Account documents for staff (createAccessGrant checks the clinician exists).
  await db.collection("Users").doc("clinician-account1").set(
    {
      authUid: uids["clinician1@test.local"],
      role: "clinician",
      displayName: "Dr Test Clinician"
    },
    { merge: true }
  );

  await db.collection("Users").doc("admin-account1").set(
    {
      authUid: uids["admin1@test.local"],
      role: "admin",
      displayName: "Test Admin"
    },
    { merge: true }
  );

  // Standing grant so clinician1 can work with patient1 in every test run.
  await db.collection("AccessGrants").doc("patient1_clinician-account1").set({
    patientId: "patient1",
    accountId: "clinician-account1",
    state: "active",
    startsAt: new Date(Date.now() - 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    scope: { clinical: true, identity: true },
    createdAt: FieldValue.serverTimestamp()
  });

  // Clear submissions so the automated tests start clean.
  for (const patientId of ["patient1", "patient2", "patient3"]) {
    await db.collection("InitialClinicalSubmissions").doc(patientId).delete();
  }

  console.log("Patient documents prepared.");
  console.log("Staff accounts and clinician grant prepared.");
  console.log("Test submissions cleared.");
  console.log("Emulator test identities are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});