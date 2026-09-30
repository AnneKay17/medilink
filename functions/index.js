const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { randomInt } = require("node:crypto");

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function writeAuditLog({
  actorUid,
  actorAccountId,
  actorRole,
  patientId,
  itemId = null,
  action,
  outcome,
  facilityId = null,
  details = {},
}) {
  const auditRef = db.collection("AuditLogs").doc();

  await auditRef.set({
    actorUid,
    actorAccountId,
    actorRole,
    patientId,
    itemId,
    action,
    outcome,
    facilityId,
    details,
    occurredAt: FieldValue.serverTimestamp(),
  });
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", `${label} must be an object.`);
  }
  return value;
}

function requireString(value, name, maxLength = 2000) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      `${name} must be a non-empty string.`,
    );
  }
  if (value.length > maxLength) {
    throw new HttpsError("invalid-argument", `${name} is too long.`);
  }
  return value;
}

// Converts Firestore Timestamps to ISO strings so results are JSON-safe.
function toPlain(value) {
  if (value === null || value === undefined) {
    return value ?? null;
  }
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(toPlain);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toPlain(v);
    }
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const ENTRY_SCHEMAS = {
  conditions: ["name", "diagnosisDate", "notes"],
  allergies: ["name", "reaction", "severity", "notes"],
  medications: ["name", "dosage", "frequency", "notes"],
  familyHistory: ["relative", "condition", "notes"],
};

const REQUIRED_FIELDS = {
  conditions: ["name"],
  allergies: ["name"],
  medications: ["name"],
  familyHistory: ["relative", "condition"],
};

// Submission category -> Firestore collection under Patients/{patientId}.
// These names must match isClinicalCollection() in firestore.rules.
const CATEGORY_COLLECTIONS = {
  conditions: "Conditions",
  allergies: "Allergies",
  medications: "Medications",
  familyHistory: "FamilyHistory",
};

// Fields that may be corrected through the correction workflow.
// System-assigned fields (IDs, authors, timestamps, approvals) are excluded,
// so a correction can never rewrite provenance.
const CORRECTABLE_FIELDS = {
  Encounters: [
    "presentingConcern",
    "history",
    "observations",
    "assessment",
    "treatment",
    "medicationDecisions",
    "investigations",
    "referrals",
    "followUp",
  ],
  Conditions: ["name", "diagnosisDate", "notes"],
  Allergies: ["name", "reaction", "severity", "notes"],
  Medications: ["name", "dosage", "frequency", "notes"],
  FamilyHistory: ["relative", "condition", "notes"],
};

const REQUIRED_CORRECTION_FIELDS = {
  Conditions: ["name"],
  Allergies: ["name"],
  Medications: ["name"],
  FamilyHistory: ["relative", "condition"],
  Encounters: [],
};

const SUMMARY_COLLECTIONS = [
  "Conditions",
  "Allergies",
  "Medications",
  "FamilyHistory",
  "Encounters",
];

// 4 collections x 2 documents per entry must stay inside the 500-write
// transaction limit when a clinician approves a submission.
const MAX_TOTAL_ENTRIES = 200;

function validateEntries(data) {
  const validated = {};
  let total = 0;

  for (const [category, allowedFields] of Object.entries(ENTRY_SCHEMAS)) {
    const entries = Object.hasOwn(data, category)
      ? data[category]
      : [];

    if (!Array.isArray(entries)) {
      throw new HttpsError(
        "invalid-argument",
        `${category} must be a list.`,
      );
    }

    if (entries.length > 100) {
      throw new HttpsError(
        "invalid-argument",
        `${category} contains too many entries.`,
      );
    }

    total += entries.length;

    validated[category] = entries.map((entry) => {
      if (
        entry === null ||
        typeof entry !== "object" ||
        Array.isArray(entry)
      ) {
        throw new HttpsError(
          "invalid-argument",
          `Each ${category} entry must be an object.`,
        );
      }

      const suppliedFields = Object.keys(entry);

      if (suppliedFields.some((field) => !allowedFields.includes(field))) {
        throw new HttpsError(
          "invalid-argument",
          `An entry in ${category} contains an unsupported field.`,
        );
      }

      const missingFields = REQUIRED_FIELDS[category].filter(
        (field) =>
          typeof entry[field] !== "string" ||
          entry[field].trim().length === 0
      );

      if (missingFields.length > 0) {
        throw new HttpsError(
          "invalid-argument",
          `Each ${category} entry must include: ${missingFields.join(", ")}.`,
        );
      }

      for (const [field, value] of Object.entries(entry)) {
        if (typeof value !== "string" || value.length > 500) {
          throw new HttpsError(
            "invalid-argument",
            `${category}.${field} must be text of at most 500 characters.`,
          );
        }
      }

      const cleanEntry = {};

      for (const field of allowedFields) {
        if (Object.hasOwn(entry, field)) {
          cleanEntry[field] = entry[field];
        }
      }

      return cleanEntry;
    });
  }

  if (total > MAX_TOTAL_ENTRIES) {
    throw new HttpsError(
      "invalid-argument",
      `A submission may contain at most ${MAX_TOTAL_ENTRIES} entries in total.`,
    );
  }

  return validated;
}

// ---------------------------------------------------------------------------
// Role / access helpers
// ---------------------------------------------------------------------------

function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { role, mid } = request.auth.token;

  if (role !== "admin" || !mid) {
    throw new HttpsError(
      "permission-denied",
      "Only administrators can perform this action.",
    );
  }

  return { adminAccountId: mid, adminUid: request.auth.uid };
}

function requireClinicianIdentity(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { role, mid } = request.auth.token;

  if (role !== "clinician" || !mid) {
    throw new HttpsError(
      "permission-denied",
      "Only authorized clinicians can perform this action.",
    );
  }

  return { clinicianAccountId: mid, clinicianUid: request.auth.uid };
}

// Checks the clinician's grant for a patient. Denied attempts are written to
// the audit log, so failed access is attributable too.
async function requireClinicianAccess(
  request,
  patientId,
  action = "clinical_access",
) {
  const { clinicianAccountId, clinicianUid } =
    requireClinicianIdentity(request);

  if (typeof patientId !== "string" || patientId.trim() === "") {
    throw new HttpsError("invalid-argument", "patientId is required.");
  }

  const deny = async (message) => {
    try {
      await writeAuditLog({
        actorUid: clinicianUid,
        actorAccountId: clinicianAccountId,
        actorRole: "clinician",
        patientId,
        action: "clinical_access_denied",
        outcome: "denied",
        details: { attemptedAction: action },
      });
    } catch (error) {
      logger.error("Failed to write denial audit log", error);
    }

    throw new HttpsError("permission-denied", message);
  };

  const grantId = `${patientId}_${clinicianAccountId}`;
  const grantSnap = await db.collection("AccessGrants").doc(grantId).get();

  if (!grantSnap.exists) {
    return deny("You do not have access to this patient's clinical record.");
  }

  const grant = grantSnap.data();
  const now = new Date();

  if (grant.state !== "active") {
    return deny("Your clinical access is not active.");
  }

  if (
    grant.startsAt &&
    grant.startsAt.toDate &&
    grant.startsAt.toDate() > now
  ) {
    return deny("Your clinical access has not started.");
  }

  if (
    grant.expiresAt &&
    grant.expiresAt.toDate &&
    grant.expiresAt.toDate() <= now
  ) {
    return deny("Your clinical access has expired.");
  }

  if (!grant.scope || grant.scope.clinical !== true) {
    return deny("Your access does not include clinical records.");
  }

  return {
    clinicianAccountId,
    clinicianUid,
    scope: grant.scope,
  };
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

exports.healthCheck = onCall(() => {
  logger.info("MediLink backend health check");

  return {
    status: "ok",
    message: "MediLink backend is running",
  };
});

// ---------------------------------------------------------------------------
// Registration and access management
// ---------------------------------------------------------------------------

// Self-service patient registration. The role is never chosen by the caller:
// this function only ever creates patients. Clinician and admin accounts are
// provisioned by an administrator script/console.
//
// After this returns the client MUST call getIdToken(true) so the new
// role/mid/pid custom claims appear in the token.
exports.registerPatient = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = request.auth.uid;

  if (request.auth.token.role) {
    throw new HttpsError(
      "already-exists",
      "This account already has a role.",
    );
  }

  const data = requireObject(request.data, "Registration data");
  const allowed = ["displayName", "dateOfBirth", "phone", "email"];

  if (Object.keys(data).some((field) => !allowed.includes(field))) {
    throw new HttpsError(
      "invalid-argument",
      "The registration contains an unsupported field.",
    );
  }

  const displayName = requireString(data.displayName, "displayName", 200);

  let dateOfBirth = null;
  if (data.dateOfBirth !== undefined) {
    dateOfBirth = requireString(data.dateOfBirth, "dateOfBirth", 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      throw new HttpsError(
        "invalid-argument",
        "dateOfBirth must use the format YYYY-MM-DD.",
      );
    }
  }

  const phone =
    data.phone === undefined ? null : requireString(data.phone, "phone", 50);
  const email =
    data.email === undefined ? null : requireString(data.email, "email", 200);

  const auth = getAuth();

  // Idempotent: if the account document already exists (for example the claims
  // step failed last time), repair the claims instead of creating duplicates.
  const existing = await db
    .collection("Users")
    .where("authUid", "==", uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    const user = doc.data();

    if (user.role !== "patient" || !user.patientId) {
      throw new HttpsError(
        "failed-precondition",
        "This account cannot be registered as a patient.",
      );
    }

    await auth.setCustomUserClaims(uid, {
      role: "patient",
      mid: doc.id,
      pid: user.patientId,
    });

    const patientSnap = await db
      .collection("Patients")
      .doc(user.patientId)
      .get();

    return {
      accountId: doc.id,
      patientId: user.patientId,
      mediCareId: patientSnap.get("mediCareId") || null,
      role: "patient",
    };
  }

  const accountId = db.collection("Users").doc().id;
  const patientId = db.collection("Patients").doc().id;

  let mediCareId = null;

  for (let attempt = 0; attempt < 5 && mediCareId === null; attempt += 1) {
    const candidate = `ML-${randomInt(10000000, 100000000)}`;
    const indexRef = db.collection("PatientIdIndex").doc(candidate);

    const created = await db.runTransaction(async (transaction) => {
      const indexSnap = await transaction.get(indexRef);

      if (indexSnap.exists) {
        return false;
      }

      const now = FieldValue.serverTimestamp();

      transaction.create(indexRef, { patientId, createdAt: now });

      transaction.create(db.collection("Users").doc(accountId), {
        authUid: uid,
        role: "patient",
        patientId,
        displayName,
        contact: { phone, email },
        createdAt: now,
      });

      transaction.create(db.collection("Patients").doc(patientId), {
        accountId,
        mediCareId: candidate,
        displayName,
        dateOfBirth,
        contact: { phone, email },
        createdAt: now,
      });

      return true;
    });

    if (created) {
      mediCareId = candidate;
    }
  }

  if (mediCareId === null) {
    throw new HttpsError(
      "internal",
      "Unable to allocate a MediCare ID. Please try again.",
    );
  }

  await auth.setCustomUserClaims(uid, {
    role: "patient",
    mid: accountId,
    pid: patientId,
  });

  await writeAuditLog({
    actorUid: uid,
    actorAccountId: accountId,
    actorRole: "patient",
    patientId,
    itemId: patientId,
    action: "patient_registered",
    outcome: "success",
  });

  return { accountId, patientId, mediCareId, role: "patient" };
});

// Administrator (registrar / facility admin) grants a clinician time-limited
// access after confirming the patient has arrived and been matched.
exports.createAccessGrant = onCall(async (request) => {
  const { adminAccountId, adminUid } = requireAdmin(request);

  const data = requireObject(request.data, "Grant data");
  const allowed = [
    "patientId",
    "mediCareId",
    "clinicianAccountId",
    "expiresInHours",
    "scope",
    "facilityId",
  ];

  if (Object.keys(data).some((field) => !allowed.includes(field))) {
    throw new HttpsError(
      "invalid-argument",
      "The grant contains an unsupported field.",
    );
  }

  const clinicianAccountId = requireString(
    data.clinicianAccountId,
    "clinicianAccountId",
    200,
  );

  let patientId;

  if (data.patientId !== undefined) {
    patientId = requireString(data.patientId, "patientId", 200);
  } else if (data.mediCareId !== undefined) {
    const mediCareId = requireString(
      data.mediCareId,
      "mediCareId",
      50,
    ).trim().toUpperCase();
    const indexSnap = await db
      .collection("PatientIdIndex")
      .doc(mediCareId)
      .get();

    if (!indexSnap.exists) {
      throw new HttpsError("not-found", "Patient was not found.");
    }

    patientId = indexSnap.get("patientId");
  } else {
    throw new HttpsError(
      "invalid-argument",
      "patientId or mediCareId is required.",
    );
  }

  const expiresInHours =
    data.expiresInHours === undefined ? 24 : data.expiresInHours;

  if (
    !Number.isInteger(expiresInHours) ||
    expiresInHours < 1 ||
    expiresInHours > 24 * 30
  ) {
    throw new HttpsError(
      "invalid-argument",
      "expiresInHours must be a whole number between 1 and 720.",
    );
  }

  let scope = { clinical: true, identity: true };

  if (data.scope !== undefined) {
    const supplied = requireObject(data.scope, "scope");

    if (
      Object.keys(supplied).some((key) => !["clinical", "identity"].includes(key)) ||
      Object.values(supplied).some((value) => typeof value !== "boolean")
    ) {
      throw new HttpsError(
        "invalid-argument",
        "scope may only contain boolean clinical and identity flags.",
      );
    }

    scope = {
      clinical: supplied.clinical === true,
      identity: supplied.identity === true,
    };
  }

  const facilityId =
    data.facilityId === undefined
      ? null
      : requireString(data.facilityId, "facilityId", 100);

  const [patientSnap, clinicianSnap] = await Promise.all([
    db.collection("Patients").doc(patientId).get(),
    db.collection("Users").doc(clinicianAccountId).get(),
  ]);

  if (!patientSnap.exists) {
    throw new HttpsError("not-found", "Patient was not found.");
  }

  if (!clinicianSnap.exists || clinicianSnap.get("role") !== "clinician") {
    throw new HttpsError("not-found", "Clinician account was not found.");
  }

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const grantRef = db
    .collection("AccessGrants")
    .doc(`${patientId}_${clinicianAccountId}`);

  await grantRef.set({
    patientId,
    accountId: clinicianAccountId,
    state: "active",
    startsAt: FieldValue.serverTimestamp(),
    expiresAt,
    scope,
    facilityId,
    grantedBy: adminAccountId,
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorUid: adminUid,
    actorAccountId: adminAccountId,
    actorRole: "admin",
    patientId,
    itemId: grantRef.id,
    action: "access_grant_created",
    outcome: "success",
    facilityId,
    details: { clinicianAccountId, expiresInHours, scope },
  });

  return {
    grantId: grantRef.id,
    state: "active",
    expiresAt: expiresAt.toISOString(),
  };
});

// An administrator, or the patient whose record it is, can revoke access.
exports.revokeAccessGrant = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { role, mid, pid } = request.auth.token;
  const data = requireObject(request.data, "Revocation data");
  const patientId = requireString(data.patientId, "patientId", 200);
  const clinicianAccountId = requireString(
    data.clinicianAccountId,
    "clinicianAccountId",
    200,
  );

  if (role === "admin" && mid) {
    // allowed
  } else if (role === "patient" && mid && pid === patientId) {
    const patientSnap = await db.collection("Patients").doc(pid).get();

    if (!patientSnap.exists || patientSnap.get("accountId") !== mid) {
      throw new HttpsError(
        "permission-denied",
        "Your patient profile could not be verified.",
      );
    }
  } else {
    throw new HttpsError(
      "permission-denied",
      "You cannot revoke access for this patient.",
    );
  }

  const grantRef = db
    .collection("AccessGrants")
    .doc(`${patientId}_${clinicianAccountId}`);
  const grantSnap = await grantRef.get();

  if (!grantSnap.exists) {
    throw new HttpsError("not-found", "Access grant was not found.");
  }

  await grantRef.update({
    state: "revoked",
    revokedAt: FieldValue.serverTimestamp(),
    revokedBy: mid,
  });

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorAccountId: mid,
    actorRole: role,
    patientId,
    itemId: grantRef.id,
    action: "access_grant_revoked",
    outcome: "success",
    details: { clinicianAccountId },
  });

  return { grantId: grantRef.id, state: "revoked" };
});

// ---------------------------------------------------------------------------
// Clinician patient lookup and record view (audited)
// ---------------------------------------------------------------------------

exports.findPatient = onCall(async (request) => {
  const { clinicianAccountId, clinicianUid } =
    requireClinicianIdentity(request);

  const data = requireObject(request.data, "Search data");
  const mediCareId = requireString(data.mediCareId, "mediCareId", 50)
    .trim()
    .toUpperCase();

  const indexSnap = await db
    .collection("PatientIdIndex")
    .doc(mediCareId)
    .get();

  // Same error for "no such patient" and "no grant" so IDs cannot be probed.
  if (!indexSnap.exists) {
    await writeAuditLog({
      actorUid: clinicianUid,
      actorAccountId: clinicianAccountId,
      actorRole: "clinician",
      patientId: null,
      action: "patient_search",
      outcome: "not_found",
    });

    throw new HttpsError(
      "permission-denied",
      "You do not have access to this patient's clinical record.",
    );
  }

  const patientId = indexSnap.get("patientId");
  const access = await requireClinicianAccess(
    request,
    patientId,
    "patient_search",
  );

  const patientSnap = await db.collection("Patients").doc(patientId).get();
  const patient = patientSnap.exists ? patientSnap.data() : {};

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId,
    action: "patient_searched",
    outcome: "success",
  });

  const result = { patientId, mediCareId };

  if (access.scope.identity === true) {
    result.displayName = patient.displayName || null;
    result.dateOfBirth = patient.dateOfBirth || null;
  }

  return result;
});

// Current summary of a patient's record. Every call is written to the audit
// log, which is what makes "Dr X viewed Patient Y's record" enforceable.
exports.getPatientSummary = onCall(async (request) => {
  const data = requireObject(request.data, "Request data");
  const patientId = requireString(data.patientId, "patientId", 200);
  const facilityId =
    data.facilityId === undefined
      ? null
      : requireString(data.facilityId, "facilityId", 100);

  const access = await requireClinicianAccess(
    request,
    patientId,
    "patient_summary_view",
  );

  const patientRef = db.collection("Patients").doc(patientId);
  const patientSnap = await patientRef.get();

  if (!patientSnap.exists) {
    throw new HttpsError("not-found", "Patient was not found.");
  }

  const summary = {};

  for (const collectionName of SUMMARY_COLLECTIONS) {
    const itemsSnap = await patientRef
      .collection(collectionName)
      .limit(100)
      .get();

    const items = itemsSnap.docs.filter(
      (doc) => typeof doc.get("currentVersionId") === "string",
    );

    const versionRefs = items.map((doc) =>
      doc.ref.collection("Versions").doc(doc.get("currentVersionId")),
    );

    const versionSnaps =
      versionRefs.length > 0 ? await db.getAll(...versionRefs) : [];

    summary[collectionName] = versionSnaps
      .map((snap, index) =>
        snap.exists
          ? { itemId: items[index].id, ...toPlain(snap.data()) }
          : null,
      )
      .filter(Boolean);
  }

  const patient = patientSnap.data();
  const result = { patientId, summary };

  if (access.scope.identity === true) {
    result.patient = {
      displayName: patient.displayName || null,
      dateOfBirth: patient.dateOfBirth || null,
      mediCareId: patient.mediCareId || null,
    };
  }

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId,
    action: "patient_summary_viewed",
    outcome: "success",
    facilityId,
  });

  return result;
});

// ---------------------------------------------------------------------------
// Initial clinical history
// ---------------------------------------------------------------------------

// Patient's one-time initial clinical submission
exports.submitInitialClinicalHistory = onCall(async (request) => {
  // 1. Require an authenticated patient
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { role, mid, pid } = request.auth.token;

  if (role !== "patient" || !mid || !pid) {
    throw new HttpsError(
      "permission-denied",
      "Only authenticated patients can submit initial history.",
    );
  }

  // 2. Accept only the expected fields
  const allowedFields = [
    "conditions",
    "allergies",
    "medications",
    "familyHistory",
  ];

  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Submission data must be an object.",
    );
  }

  const suppliedFields = Object.keys(data);

  if (suppliedFields.some((field) => !allowedFields.includes(field))) {
    throw new HttpsError(
      "invalid-argument",
      "The submission contains an unsupported field.",
    );
  }

  const validatedData = validateEntries(data);

  // 3. Confirm the patient profile belongs to this account
  const patientRef = db.collection("Patients").doc(pid);
  const patientSnap = await patientRef.get();

  if (!patientSnap.exists || patientSnap.get("accountId") !== mid) {
    throw new HttpsError(
      "permission-denied",
      "Your patient profile could not be verified.",
    );
  }

  // 4. Use a fixed document ID to enforce one submission per patient
  const submissionRef = db.collection("InitialClinicalSubmissions").doc(pid);

  try {
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(submissionRef);

      if (existing.exists) {
        throw new HttpsError(
          "already-exists",
          "Your initial clinical history has already been submitted.",
        );
      }

      transaction.create(submissionRef, {
        patientId: pid,
        submittedBy: mid,
        status: "pending",
        submittedAt: FieldValue.serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        conditions: validatedData.conditions,
        allergies: validatedData.allergies,
        medications: validatedData.medications,
        familyHistory: validatedData.familyHistory,
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("Initial clinical submission failed", error);

    throw new HttpsError(
      "internal",
      "Unable to submit your initial clinical history.",
    );
  }

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorAccountId: mid,
    actorRole: "patient",
    patientId: pid,
    itemId: submissionRef.id,
    action: "initial_history_submitted",
    outcome: "success",
  });

  return {
    status: "pending",
    message: "Your initial clinical history was submitted for review.",
  };
});

// Clinician reviews the patient's initial submission. Approval turns each
// entry into a locked v1 item under Patients/{patientId}/..., labelled as
// patient-stated and clinician-approved. Rejection keeps everything out of
// the clinical record and records the reason.
exports.reviewInitialSubmission = onCall(async (request) => {
  const data = requireObject(request.data, "Review data");
  const patientId = requireString(data.patientId, "patientId", 200);
  const { decision, reason } = data;

  if (!["approved", "rejected"].includes(decision)) {
    throw new HttpsError(
      "invalid-argument",
      "Decision must be approved or rejected.",
    );
  }

  if (
    reason !== undefined &&
    (typeof reason !== "string" || reason.length > 2000)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "reason must be text of at most 2000 characters.",
    );
  }

  const access = await requireClinicianAccess(
    request,
    patientId,
    "initial_submission_review",
  );

  const submissionRef = db
    .collection("InitialClinicalSubmissions")
    .doc(patientId);
  const patientRef = db.collection("Patients").doc(patientId);

  let itemCount = 0;

  try {
    await db.runTransaction(async (transaction) => {
      itemCount = 0;

      const submissionSnap = await transaction.get(submissionRef);

      if (!submissionSnap.exists) {
        throw new HttpsError("not-found", "No submission was found.");
      }

      const submission = submissionSnap.data();

      if (submission.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          "This submission has already been reviewed.",
        );
      }

      const now = FieldValue.serverTimestamp();

      if (decision === "rejected") {
        transaction.update(submissionRef, {
          status: "rejected",
          reviewedBy: access.clinicianAccountId,
          reviewedAt: now,
          rejectionReason: reason || null,
        });
        return;
      }

      for (const [category, collectionName] of Object.entries(
        CATEGORY_COLLECTIONS,
      )) {
        const entries = Array.isArray(submission[category])
          ? submission[category]
          : [];

        for (const entry of entries) {
          const itemRef = patientRef.collection(collectionName).doc();
          const versionRef = itemRef.collection("Versions").doc("v1");

          transaction.create(itemRef, {
            patientId,
            currentVersionId: "v1",
            createdAt: now,
            updatedAt: now,
          });

          transaction.create(versionRef, {
            ...entry,
            versionId: "v1",
            itemId: itemRef.id,
            patientId,
            source: "patient-stated",
            suppliedByAccountId: submission.submittedBy,
            submittedAt: submission.submittedAt || null,
            approvalLabel: "clinician-approved",
            reviewerAccountId: access.clinicianAccountId,
            reviewerUid: access.clinicianUid,
            approvedAt: now,
            createdAt: now,
          });

          itemCount += 1;
        }
      }

      transaction.update(submissionRef, {
        status: "approved",
        reviewedBy: access.clinicianAccountId,
        reviewedAt: now,
        rejectionReason: null,
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("Initial submission review failed", error);

    throw new HttpsError(
      "internal",
      "Unable to review the initial clinical history.",
    );
  }

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId,
    itemId: submissionRef.id,
    action: "initial_history_reviewed",
    outcome: decision,
    details: { itemCount },
  });

  return { patientId, status: decision, itemCount };
});

// ---------------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------------

// Create a consultation draft
exports.createConsultationDraft = onCall(async (request) => {
  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Draft data must be an object.",
    );
  }

  const patientId = data.patientId;

  if (typeof patientId !== "string" || patientId.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      "patientId is required.",
    );
  }

  const access = await requireClinicianAccess(
    request,
    patientId,
    "consultation_draft_create",
  );

  const allowedFields = [
    "patientId",
    "presentingConcern",
    "history",
    "observations",
    "assessment",
    "treatment",
    "medicationDecisions",
    "investigations",
    "referrals",
    "followUp",
  ];

  if (Object.keys(data).some((field) => !allowedFields.includes(field))) {
    throw new HttpsError(
      "invalid-argument",
      "The consultation contains an unsupported field.",
    );
  }

  const textFields = [
    "presentingConcern",
    "history",
    "observations",
    "assessment",
    "treatment",
    "medicationDecisions",
    "investigations",
    "referrals",
    "followUp",
  ];

  const cleanData = {
    patientId,
  };

  for (const field of textFields) {
    if (Object.hasOwn(data, field)) {
      if (
        typeof data[field] !== "string" ||
        data[field].length > 5000
      ) {
        throw new HttpsError(
          "invalid-argument",
          `${field} must be text of at most 5000 characters.`,
        );
      }

      cleanData[field] = data[field];
    }
  }

  const draftRef = db.collection("ConsultationDrafts").doc();

  await draftRef.set({
    ...cleanData,
    status: "draft",
    authorAccountId: access.clinicianAccountId,
    authorUid: access.clinicianUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId,
    itemId: draftRef.id,
    action: "consultation_draft_created",
    outcome: "success",
  });

  return {
    draftId: draftRef.id,
    status: "draft",
  };
});


// Approve and submit a consultation.
// The encounter is stored under Patients/{patientId}/Encounters so that the
// Firestore rules let the patient and authorised clinicians read it.
exports.submitConsultation = onCall(async (request) => {
  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Submission data must be an object.",
    );
  }

  const { draftId } = data;

  if (typeof draftId !== "string" || draftId.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      "draftId is required.",
    );
  }

  const draftRef = db.collection("ConsultationDrafts").doc(draftId);
  const draftSnap = await draftRef.get();

  if (!draftSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Consultation draft was not found.",
    );
  }

  const draft = draftSnap.data();

  const access = await requireClinicianAccess(
    request,
    draft.patientId,
    "consultation_submit",
  );

  if (draft.status !== "draft") {
    throw new HttpsError(
      "failed-precondition",
      "This consultation has already been submitted.",
    );
  }

  const encounterRef = db
    .collection("Patients")
    .doc(draft.patientId)
    .collection("Encounters")
    .doc();

  const versionRef = encounterRef
    .collection("Versions")
    .doc("v1");

  try {
    await db.runTransaction(async (transaction) => {
      const currentDraft = await transaction.get(draftRef);

      if (!currentDraft.exists) {
        throw new HttpsError(
          "not-found",
          "Consultation draft was not found.",
        );
      }

      const currentData = currentDraft.data();

      if (currentData.status !== "draft") {
        throw new HttpsError(
          "failed-precondition",
          "This consultation has already been submitted.",
        );
      }

      const approvedAt = FieldValue.serverTimestamp();

      transaction.create(encounterRef, {
        patientId: currentData.patientId,
        status: "approved",
        authorAccountId: access.clinicianAccountId,
        authorUid: access.clinicianUid,
        approvalType: "clinician-approved",
        approvedAt,
        currentVersionId: "v1",
        createdAt: approvedAt,
        updatedAt: approvedAt,
      });

      transaction.create(versionRef, {
        versionId: "v1",
        patientId: currentData.patientId,
        encounterId: encounterRef.id,
        itemId: encounterRef.id,
        authorAccountId: access.clinicianAccountId,
        authorUid: access.clinicianUid,
        approvalLabel: "clinician-approved",
        approvedAt,
        createdAt: approvedAt,

        presentingConcern: currentData.presentingConcern || null,
        history: currentData.history || null,
        observations: currentData.observations || null,
        assessment: currentData.assessment || null,
        treatment: currentData.treatment || null,
        medicationDecisions:
          currentData.medicationDecisions || null,
        investigations: currentData.investigations || null,
        referrals: currentData.referrals || null,
        followUp: currentData.followUp || null,
      });

      transaction.update(draftRef, {
        status: "submitted",
        submittedAt: approvedAt,
        submittedBy: access.clinicianAccountId,
        encounterId: encounterRef.id,
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("Consultation submission failed", error);

    throw new HttpsError(
      "internal",
      "Unable to submit the consultation.",
    );
  }

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId: draft.patientId,
    itemId: encounterRef.id,
    action: "consultation_approved_and_submitted",
    outcome: "success",
  });

  return {
    encounterId: encounterRef.id,
    versionId: "v1",
    status: "approved",
  };
});

// ---------------------------------------------------------------------------
// Corrections (locked records, traceable amendments)
// ---------------------------------------------------------------------------

exports.createCorrectionRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const { role, mid, pid } = request.auth.token;

  if (role !== "patient" || !mid || !pid) {
    throw new HttpsError(
      "permission-denied",
      "Only the authenticated patient can create a correction request.",
    );
  }

  const data = request.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpsError("invalid-argument", "Request data must be an object.");
  }

  const {
    targetCollection,
    targetItemId,
    targetVersionId,
    targetField,
    reason,
  } = data;

  const allowedCollections = Object.keys(CORRECTABLE_FIELDS);

  if (!allowedCollections.includes(targetCollection)) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid target collection.",
    );
  }

  for (const [fieldName, value] of Object.entries({
    targetItemId,
    targetVersionId,
    targetField,
    reason,
  })) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new HttpsError(
        "invalid-argument",
        `${fieldName} must be a non-empty string.`,
      );
    }

    if (value.length > 2000) {
      throw new HttpsError(
        "invalid-argument",
        `${fieldName} is too long.`,
      );
    }
  }

  if (!CORRECTABLE_FIELDS[targetCollection].includes(targetField)) {
    throw new HttpsError(
      "invalid-argument",
      "That field cannot be corrected.",
    );
  }

  const patientRef = db.collection("Patients").doc(pid);
  const patientSnap = await patientRef.get();

  if (!patientSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Patient record was not found.",
    );
  }

  const patient = patientSnap.data();

  if (patient.accountId !== mid) {
    throw new HttpsError(
      "permission-denied",
      "You do not own this patient record.",
    );
  }

  const correctionRef = db.collection("CorrectionRequests").doc();

  await correctionRef.set({
    patientId: pid,
    requesterAccountId: mid,
    targetCollection,
    targetItemId,
    targetVersionId,
    targetField,
    reason,
    state: "submitted",
    createdAt: FieldValue.serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    decisionReason: null,
    proposedValue: null,
    evidence: null,
    proposalSubmittedAt: null,
  });

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorAccountId: mid,
    actorRole: role,
    patientId: pid,
    itemId: targetItemId,
    action: "correction_request_created",
    outcome: "submitted",
    details: {
      correctionRequestId: correctionRef.id,
      targetCollection,
      targetField,
      targetVersionId,
    },
  });

  return {
    requestId: correctionRef.id,
    state: "submitted",
  };
});

// Review a patient correction request.
// The clinician's decision does not directly overwrite the approved record.
exports.reviewCorrectionRequest = onCall(async (request) => {
  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Review data must be an object.",
    );
  }

  const {
    requestId,
    decision,
    reason,
  } = data;

  if (typeof requestId !== "string" || requestId.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      "requestId is required.",
    );
  }

  if (!["approved", "rejected"].includes(decision)) {
    throw new HttpsError(
      "invalid-argument",
      "Decision must be approved or rejected.",
    );
  }

  if (
    reason !== undefined &&
    (typeof reason !== "string" || reason.length > 2000)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "reason must be text of at most 2000 characters.",
    );
  }

  const requestRef = db.collection("CorrectionRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Correction request was not found.",
    );
  }

  const correction = requestSnap.data();

  const access = await requireClinicianAccess(
    request,
    correction.patientId,
    "correction_request_review",
  );

  if (correction.state !== "submitted") {
    throw new HttpsError(
      "failed-precondition",
      "This correction request has already been reviewed.",
    );
  }

  const finalReason = reason || null;

  await requestRef.update({
    state: decision,
    reviewedBy: access.clinicianAccountId,
    reviewedAt: FieldValue.serverTimestamp(),
    decisionReason: finalReason,
  });

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId: correction.patientId,
    itemId: correction.targetItemId,
    action: "correction_request_reviewed",
    outcome: decision,
    details: {
      requestId,
      targetCollection: correction.targetCollection,
      targetVersionId: correction.targetVersionId,
    },
  });

  return {
    requestId,
    state: decision,
  };
});


// Clinician grants temporary, field/version-specific edit access.
exports.createEditGrant = onCall(async (request) => {
  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Edit grant data must be an object.",
    );
  }

  const {
    patientId,
    requestId,
    targetCollection,
    targetItemId,
    targetField,
    targetVersionId,
    expiresInMinutes,
  } = data;

  if (
    typeof patientId !== "string" ||
    patientId.trim() === ""
  ) {
    throw new HttpsError(
      "invalid-argument",
      "patientId is required.",
    );
  }

  const access = await requireClinicianAccess(
    request,
    patientId,
    "edit_grant_create",
  );

  const stringFields = {
    requestId,
    targetCollection,
    targetItemId,
    targetField,
    targetVersionId,
  };

  for (const [field, value] of Object.entries(stringFields)) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new HttpsError(
        "invalid-argument",
        `${field} is required.`,
      );
    }
  }

  if (!Object.keys(CORRECTABLE_FIELDS).includes(targetCollection)) {
    throw new HttpsError(
      "invalid-argument",
      "The target collection is not editable.",
    );
  }

  if (
    !Number.isInteger(expiresInMinutes) ||
    expiresInMinutes <= 0 ||
    expiresInMinutes > 24 * 60
  ) {
    throw new HttpsError(
      "invalid-argument",
      "expiresInMinutes must be between 1 and 1440.",
    );
  }

  const correctionRef = db
    .collection("CorrectionRequests")
    .doc(requestId);

  const correctionSnap = await correctionRef.get();

  if (!correctionSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Correction request was not found.",
    );
  }

  const correction = correctionSnap.data();

  if (correction.state !== "approved") {
    throw new HttpsError(
      "failed-precondition",
      "The correction request must be approved before an edit grant can be created.",
    );
  }

  if (
    correction.patientId !== patientId ||
    correction.targetCollection !== targetCollection ||
    correction.targetItemId !== targetItemId ||
    correction.targetField !== targetField ||
    correction.targetVersionId !== targetVersionId
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Edit grant does not match the correction request.",
    );
  }

  const grantRef = db.collection("EditGrants").doc();

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + expiresInMinutes * 60 * 1000,
  );

  await grantRef.set({
    patientId,
    requestId,
    granteeAccountId: correction.requesterAccountId,
    grantingClinicianAccountId: access.clinicianAccountId,
    grantingClinicianUid: access.clinicianUid,
    targetCollection,
    targetItemId,
    targetField,
    targetVersionId,
    state: "active",
    startsAt: FieldValue.serverTimestamp(),
    expiresAt,
    createdAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorUid: access.clinicianUid,
    actorAccountId: access.clinicianAccountId,
    actorRole: "clinician",
    patientId,
    itemId: targetItemId,
    action: "temporary_edit_grant_created",
    outcome: "success",
    details: {
      requestId,
      targetCollection,
      targetField,
      targetVersionId,
      expiresInMinutes,
    },
  });

  return {
    grantId: grantRef.id,
    state: "active",
    expiresAt: expiresAt.toISOString(),
  };
});


// Patient submits a proposed correction.
// This never directly changes the approved clinical record.
exports.submitCorrectionProposal = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in.",
    );
  }

  const { role, mid, pid } = request.auth.token;

  if (role !== "patient" || !mid || !pid) {
    throw new HttpsError(
      "permission-denied",
      "Only authenticated patients can submit corrections.",
    );
  }

  const data = request.data;

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Correction proposal must be an object.",
    );
  }

  const {
    grantId,
    proposedValue,
    evidence,
  } = data;

  if (typeof grantId !== "string" || grantId.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      "grantId is required.",
    );
  }

  if (
    typeof proposedValue !== "string" ||
    proposedValue.length > 5000
  ) {
    throw new HttpsError(
      "invalid-argument",
      "proposedValue must be text of at most 5000 characters.",
    );
  }

  if (
    evidence !== undefined &&
    (typeof evidence !== "string" || evidence.length > 5000)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "evidence must be text of at most 5000 characters.",
    );
  }

  const grantRef = db.collection("EditGrants").doc(grantId);
  const grantSnap = await grantRef.get();

  if (!grantSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Edit grant was not found.",
    );
  }

  const grant = grantSnap.data();

  if (grant.granteeAccountId !== mid || grant.patientId !== pid) {
    throw new HttpsError(
      "permission-denied",
      "This edit grant does not belong to you.",
    );
  }

  if (grant.state !== "active") {
    throw new HttpsError(
      "permission-denied",
      "This edit grant is no longer active.",
    );
  }

  const now = new Date();

  if (
    grant.expiresAt &&
    grant.expiresAt.toDate &&
    grant.expiresAt.toDate() <= now
  ) {
    throw new HttpsError(
      "permission-denied",
      "This edit grant has expired.",
    );
  }

  // Required fields (for example a condition name) cannot be blanked, and
  // clinical entries keep the same length limit as the original submission.
  const requiredFields =
    REQUIRED_CORRECTION_FIELDS[grant.targetCollection] || [];

  if (
    requiredFields.includes(grant.targetField) &&
    proposedValue.trim() === ""
  ) {
    throw new HttpsError(
      "invalid-argument",
      "proposedValue cannot be empty for this field.",
    );
  }

  if (grant.targetCollection !== "Encounters" && proposedValue.length > 500) {
    throw new HttpsError(
      "invalid-argument",
      "proposedValue must be text of at most 500 characters for this field.",
    );
  }

  const correctionRef = db
    .collection("CorrectionRequests")
    .doc(grant.requestId);

  const correctionSnap = await correctionRef.get();

  if (!correctionSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Correction request was not found.",
    );
  }

  const correction = correctionSnap.data();

  if (correction.state !== "approved") {
    throw new HttpsError(
      "failed-precondition",
      "The correction request has not been approved for editing.",
    );
  }

  await correctionRef.update({
    proposedValue,
    evidence: evidence || null,
    state: "proposal_submitted",
    proposalSubmittedAt: FieldValue.serverTimestamp(),
  });

  await grantRef.update({
    state: "submitted",
    submittedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorAccountId: mid,
    actorRole: "patient",
    patientId: pid,
    itemId: grant.targetItemId,
    action: "correction_proposal_submitted",
    outcome: "success",
    details: {
      requestId: grant.requestId,
      targetCollection: grant.targetCollection,
      targetField: grant.targetField,
      targetVersionId: grant.targetVersionId,
    },
  });

  return {
    requestId: grant.requestId,
    state: "proposal_submitted",
  };
});

// Clinician reviews the patient's proposed value.
//   rejected -> approved value stays current; proposal and outcome preserved.
//   approved -> a NEW version is created (v1 -> v2). The previous version,
//               its author and its approval stay untouched in history.
exports.reviewCorrectionProposal = onCall(async (request) => {
  requireClinicianIdentity(request);

  const data = request.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpsError(
      "invalid-argument",
      "Request data must be an object.",
    );
  }

  const { requestId, decision, reason } = data;

  if (
    typeof requestId !== "string" ||
    requestId.trim() === ""
  ) {
    throw new HttpsError(
      "invalid-argument",
      "requestId must be a non-empty string.",
    );
  }

  if (!["approved", "rejected"].includes(decision)) {
    throw new HttpsError(
      "invalid-argument",
      "decision must be approved or rejected.",
    );
  }

  if (
    reason !== undefined &&
    (typeof reason !== "string" || reason.length > 2000)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "reason must be a string no longer than 2000 characters.",
    );
  }

  const correctionRef = db
    .collection("CorrectionRequests")
    .doc(requestId);

  const correctionSnap = await correctionRef.get();

  if (!correctionSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Correction request was not found.",
    );
  }

  const correction = correctionSnap.data();

  const { clinicianAccountId, clinicianUid } =
    await requireClinicianAccess(
      request,
      correction.patientId,
      "correction_proposal_review",
    );

  if (correction.state !== "proposal_submitted") {
    throw new HttpsError(
      "failed-precondition",
      "The correction proposal is not awaiting review.",
    );
  }

  if (decision === "rejected") {
    await correctionRef.update({
      state: "rejected",
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: clinicianAccountId,
      decisionReason: reason || null,
    });

    await writeAuditLog({
      actorUid: clinicianUid,
      actorAccountId: clinicianAccountId,
      actorRole: "clinician",
      patientId: correction.patientId,
      itemId: correction.targetItemId,
      action: "correction_proposal_reviewed",
      outcome: "rejected",
      details: {
        correctionRequestId: requestId,
        targetCollection: correction.targetCollection,
        targetField: correction.targetField,
        targetVersionId: correction.targetVersionId,
      },
    });

    return {
      requestId,
      state: "rejected",
    };
  }

  // ---- approval: create a new version --------------------------------------

  const allowedFields = CORRECTABLE_FIELDS[correction.targetCollection];

  if (!allowedFields || !allowedFields.includes(correction.targetField)) {
    throw new HttpsError(
      "failed-precondition",
      "The target field cannot be amended.",
    );
  }

  if (typeof correction.proposedValue !== "string") {
    throw new HttpsError(
      "failed-precondition",
      "The correction has no proposed value.",
    );
  }

  const itemRef = db
    .collection("Patients")
    .doc(correction.patientId)
    .collection(correction.targetCollection)
    .doc(correction.targetItemId);

  let newVersionId = null;

  try {
    await db.runTransaction(async (transaction) => {
      const [itemSnap, requestSnap] = await Promise.all([
        transaction.get(itemRef),
        transaction.get(correctionRef),
      ]);

      if (!itemSnap.exists) {
        throw new HttpsError(
          "not-found",
          "The record being corrected was not found.",
        );
      }

      if (requestSnap.get("state") !== "proposal_submitted") {
        throw new HttpsError(
          "failed-precondition",
          "The correction proposal is not awaiting review.",
        );
      }

      const item = itemSnap.data();

      // If the record changed since the request was made, the proposal was
      // written against an out-of-date value and needs a fresh review.
      if (item.currentVersionId !== correction.targetVersionId) {
        throw new HttpsError(
          "failed-precondition",
          "The record has changed since this correction was requested. A fresh review is required.",
        );
      }

      const match = /^v(\d+)$/.exec(item.currentVersionId);

      if (!match) {
        throw new HttpsError(
          "internal",
          "The record has an unexpected version identifier.",
        );
      }

      const currentVersionRef = itemRef
        .collection("Versions")
        .doc(item.currentVersionId);
      const currentVersionSnap = await transaction.get(currentVersionRef);

      if (!currentVersionSnap.exists) {
        throw new HttpsError(
          "not-found",
          "The current version of the record was not found.",
        );
      }

      const current = currentVersionSnap.data();
      newVersionId = `v${Number(match[1]) + 1}`;

      const now = FieldValue.serverTimestamp();

      // The previous author fields are carried over unchanged so an amendment
      // can never rewrite who originally wrote the entry.
      transaction.create(itemRef.collection("Versions").doc(newVersionId), {
        ...current,
        [correction.targetField]: correction.proposedValue,
        versionId: newVersionId,
        supersedesVersionId: current.versionId,
        amendmentRequestId: requestId,
        amendmentEvidence: correction.evidence || null,
        proposedByAccountId: correction.requesterAccountId,
        approvalLabel: "clinician-approved",
        reviewerAccountId: clinicianAccountId,
        reviewerUid: clinicianUid,
        approvedAt: now,
        createdAt: now,
      });

      transaction.update(itemRef, {
        currentVersionId: newVersionId,
        updatedAt: now,
      });

      transaction.update(correctionRef, {
        state: "applied",
        reviewedAt: now,
        reviewedBy: clinicianAccountId,
        decisionReason: reason || null,
        appliedVersionId: newVersionId,
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error("Correction proposal approval failed", error);

    throw new HttpsError(
      "internal",
      "Unable to apply the approved correction.",
    );
  }

  await writeAuditLog({
    actorUid: clinicianUid,
    actorAccountId: clinicianAccountId,
    actorRole: "clinician",
    patientId: correction.patientId,
    itemId: correction.targetItemId,
    action: "correction_proposal_reviewed",
    outcome: "approved",
    details: {
      correctionRequestId: requestId,
      targetCollection: correction.targetCollection,
      targetField: correction.targetField,
      previousVersionId: correction.targetVersionId,
      newVersionId,
    },
  });

  return {
    requestId,
    state: "applied",
    versionId: newVersionId,
  };
});