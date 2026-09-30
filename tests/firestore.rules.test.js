import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";

import { before, after, test } from "node:test";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-medilink",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });

  // Seed test records without applying client security rules.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "Patients/patient1"), {
      accountId: "account1",
    });

    await setDoc(doc(db, "Patients/patient2"), {
      accountId: "account2",
    });

    await setDoc(
      doc(db, "Patients/patient1/Conditions/condition1"),
      { name: "Test condition" }
    );
  });
});

after(async () => {
  await testEnv.cleanup();
});

test("patient can read their own patient document", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertSucceeds(
    getDoc(doc(db, "Patients/patient1"))
  );
});

test("patient cannot read another patient's document", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient2"))
  );
});

test("patient can read their own clinical record", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertSucceeds(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("patient cannot write directly to a clinical record", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    setDoc(
      doc(db, "Patients/patient1/Conditions/newCondition"),
      { name: "Unauthorised condition" }
    )
  );
});

test("unauthenticated user cannot read patient data", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient1"))
  );
});

test("clinician cannot read patient clinical data without a grant", async () => {
  const db = testEnv.authenticatedContext("clinicianUid", {
    role: "clinician",
    mid: "clinician1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("client cannot read audit logs", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "AuditLogs/log1"))
  );
});

test("patient cannot write a clinical version", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    setDoc(
      doc(db, "Patients/patient1/Conditions/condition1/Versions/v2"),
      { name: "Changed condition" }
    )
  );
});

test("patient cannot create an access grant", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    setDoc(
      doc(db, "AccessGrants/patient1_clinician1"),
      {
        patientId: "patient1",
        accountId: "clinician1",
        state: "active",
        scope: { clinical: true },
      }
    )
  );
});

test("clinician can read clinical data with an active grant", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(
      doc(db, "AccessGrants/patient1_clinician1"),
      {
        patientId: "patient1",
        accountId: "clinician1",
        state: "active",
        startsAt: new Date(Date.now() - 60000),
        expiresAt: new Date(Date.now() + 3600000),
        scope: { clinical: true },
      }
    );
  });

  const db = testEnv.authenticatedContext("clinicianUid", {
    role: "clinician",
    mid: "clinician1",
  }).firestore();

  await assertSucceeds(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("clinician cannot read clinical data with an expired grant", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "AccessGrants/patient1_clinician1"), {
      patientId: "patient1",
      accountId: "clinician1",
      state: "active",
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() - 60000),
      scope: { clinical: true },
    });
  });

  const db = testEnv.authenticatedContext("clinicianUid", {
    role: "clinician",
    mid: "clinician1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("clinician cannot read clinical data with a revoked grant", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "AccessGrants/patient1_clinician1"), {
      patientId: "patient1",
      accountId: "clinician1",
      state: "revoked",
      startsAt: new Date(Date.now() - 60000),
      scope: { clinical: true },
    });
  });

  const db = testEnv.authenticatedContext("clinicianUid", {
    role: "clinician",
    mid: "clinician1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("clinician cannot read clinical data when grant lacks clinical scope", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, "AccessGrants/patient1_clinician1"), {
      patientId: "patient1",
      accountId: "clinician1",
      state: "active",
      startsAt: new Date(Date.now() - 60000),
      scope: { clinical: false },
    });
  });

  const db = testEnv.authenticatedContext("clinicianUid", {
    role: "clinician",
    mid: "clinician1",
  }).firestore();

  await assertFails(
    getDoc(doc(db, "Patients/patient1/Conditions/condition1"))
  );
});

test("patient cannot create an active sharing permission without a verified family link", async () => {
  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    setDoc(doc(db, "SharingPermissions/permission1"), {
      sourceAccountId: "account1",
      sourcePatientId: "patient1",
      recipientPatientId: "patient2",
      familyLinkId: "does-not-exist",
      itemIds: [],
      sharingLevel: "summary",
      state: "active",
      grantedAt: serverTimestamp(),
    })
  );
});

test("patient cannot share over a family link that is still only invited", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "FamilyLinks/link-invited"), {
      inviterAccountId: "account1",
      inviterPatientId: "patient1",
      inviteeAccountId: "account2",
      inviteePatientId: "patient2",
      relationshipFromInviter: "sibling",
      state: "invited",
    });
  });

  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertFails(
    setDoc(doc(db, "SharingPermissions/permission-invited"), {
      sourceAccountId: "account1",
      sourcePatientId: "patient1",
      recipientPatientId: "patient2",
      familyLinkId: "link-invited",
      itemIds: [],
      sharingLevel: "summary",
      state: "active",
      grantedAt: serverTimestamp(),
    })
  );
});

test("patient can create a sharing permission over an accepted family link", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "FamilyLinks/link1"), {
      inviterAccountId: "account1",
      inviterPatientId: "patient1",
      inviteeAccountId: "account2",
      inviteePatientId: "patient2",
      relationshipFromInviter: "sibling",
      state: "accepted",
    });
  });

  const db = testEnv.authenticatedContext("uid1", {
    role: "patient",
    mid: "account1",
    pid: "patient1",
  }).firestore();

  await assertSucceeds(
    setDoc(doc(db, "SharingPermissions/permission2"), {
      sourceAccountId: "account1",
      sourcePatientId: "patient1",
      recipientPatientId: "patient2",
      familyLinkId: "link1",
      itemIds: [],
      sharingLevel: "summary",
      state: "active",
      grantedAt: serverTimestamp(),
    })
  );
});