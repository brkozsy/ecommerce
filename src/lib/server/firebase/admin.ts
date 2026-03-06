import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;

const privateKeyRaw =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_PRIVATE_KEY;

const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin env variables (projectId/clientEmail/privateKey)");
}

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export const adminApp = app;