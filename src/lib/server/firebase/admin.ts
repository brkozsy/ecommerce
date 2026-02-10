import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function mustEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

export const adminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId: mustEnv("FIREBASE_ADMIN_PROJECT_ID"),
            clientEmail: mustEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
            privateKey: mustEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
        }),
    });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
