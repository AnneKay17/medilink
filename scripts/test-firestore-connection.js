import { existsSync } from "node:fs";
import process from "node:process";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "medilink-c76ff";

// Firestore rejects collection IDs that begin or end with "__".
const PROBE_COLLECTION = "connection_probe_do_not_create";
const QUERY_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} did not respond within ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function assertCredentialsAvailable() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set in this shell");
  }
  if (!existsSync(credentialsPath)) {
    throw new Error("the file GOOGLE_APPLICATION_CREDENTIALS points to was not found on disk");
  }
}

function likelyCause(error) {
  const detail = `${error?.code ?? ""} ${error?.message ?? ""}`;
  if (detail.includes("default credentials")) {
    return "Application Default Credentials were not found.";
  }
  if (detail.includes("unauthenticated")) {
    return "Credentials were rejected by Firestore.";
  }
  if (detail.includes("permission-denied")) {
    return "Authenticated, but the service account lacks Firestore access on this project.";
  }
  if (detail.includes("unavailable") || detail.includes("did not respond")) {
    return "Network or Firestore endpoint unreachable.";
  }
  return "Inspect the error code and message above.";
}

async function main() {
  console.log("MediLink | Firebase Admin SDK connectivity test (read-only)");
  console.log(`Project ID: ${PROJECT_ID}`);

  assertCredentialsAvailable();
  console.log("GOOGLE_APPLICATION_CREDENTIALS: set, file present");

  const app = initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
  const startedAt = Date.now();

  try {
    const snapshot = await withTimeout(
      getFirestore(app).collection(PROBE_COLLECTION).limit(1).get(),
      QUERY_TIMEOUT_MS,
      "Firestore"
    );

    console.log("Firestore reachable: yes");
    console.log(`Documents returned by probe query: ${snapshot.size} (0 expected)`);
    console.log(`Round trip: ${Date.now() - startedAt} ms`);
    console.log("Documents written: none | Patient data read: none");
    console.log("RESULT: PASS");
    return 0;
  } catch (error) {
    console.log("Firestore reachable: no");
    console.log(`Error code: ${error?.code ?? "n/a"}`);
    console.log(`Error message: ${error?.message ?? String(error)}`);
    console.log(`Likely cause: ${likelyCause(error)}`);
    console.log("RESULT: FAIL");
    return 1;
  } finally {
    await app.delete();
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.log(`Error message: ${error?.message ?? String(error)}`);
    console.log(`Likely cause: ${likelyCause(error)}`);
    console.log("RESULT: FAIL");
    process.exitCode = 1;
  });
