import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Support both: full JSON blob OR individual vars
  const jsonEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  const hasJson = jsonEnv && jsonEnv !== '{"type":"service_account","project_id":"..."}';

  const credential = hasJson
    ? cert(JSON.parse(jsonEnv))
    : cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Next.js reads \n literally from .env — replace escaped newlines
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      });

  return initializeApp({ credential });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb   = getFirestore(getAdminApp());
