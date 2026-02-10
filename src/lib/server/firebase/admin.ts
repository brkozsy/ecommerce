import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function must(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function readPrivateKey() {
    return must("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");
}

// 1) önce adminApp'i oluştur
export const adminApp =
    getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            credential: cert({
                projectId: must("FIREBASE_ADMIN_PROJECT_ID"),
                clientEmail: must("FIREBASE_ADMIN_CLIENT_EMAIL"),
                privateKey: readPrivateKey(),
            }),
        });

// 2) sonra adminDb'yi üret
export const adminDb = getFirestore(adminApp);
