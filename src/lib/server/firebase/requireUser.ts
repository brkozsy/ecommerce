import { adminAuth } from "@/lib/server/firebase/admin";

export async function requireUser(req: Request) {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;

    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded; // { uid, email, ... }
    } catch {
        return null;
    }
}
