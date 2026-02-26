import { adminAuth } from "@/lib/server/firebase/admin";

function bearerToken(h: Headers) {
    const v = h.get("authorization") || h.get("Authorization");
    if (!v) return null;
    const parts = v.split(" ");
    if (parts.length < 2) return null;
    const type = parts[0];
    const token = parts.slice(1).join(" ").trim();
    if (type !== "Bearer" || !token) return null;
    return token;
}

function getAdminEmails() {
    const raw =
        process.env.ADMIN_EMAILS ||
        process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
        "";
    return raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

export async function requireAdmin(req: Request) {
    const token = bearerToken(req.headers);
    if (!token) throw new Error("UNAUTHENTICATED");

    const decoded = await adminAuth.verifyIdToken(token);

    const email = (decoded.email || "").toLowerCase();
    const allow = getAdminEmails();

    if (!email) throw new Error("FORBIDDEN");
    if (allow.length === 0) throw new Error("FORBIDDEN");
    if (!allow.includes(email)) throw new Error("FORBIDDEN");

    return { uid: decoded.uid, email };
}