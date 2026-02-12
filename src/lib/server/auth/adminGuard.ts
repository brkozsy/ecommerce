import { headers } from "next/headers";
import { adminAuth } from "@/lib/server/firebase/admin";

function bearerToken(h: Headers) {
    const v = h.get("authorization") || h.get("Authorization");
    if (!v) return null;
    const [type, token] = v.split(" ");
    if (type !== "Bearer" || !token) return null;
    return token;
}

export async function requireAdmin() {
    const h = await headers();
    const token = bearerToken(h);
    if (!token) throw new Error("UNAUTHENTICATED");

    const decoded = await adminAuth.verifyIdToken(token);

    const email = (decoded.email || "").toLowerCase();
    const allow = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    if (!email) throw new Error("FORBIDDEN");
    if (allow.length === 0) throw new Error("FORBIDDEN");
    if (!allow.includes(email)) throw new Error("FORBIDDEN");

    return { uid: decoded.uid, email };
}
