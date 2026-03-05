import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        await requireAdmin(req);

        const snap = await adminDb
            .collection("orders")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const items = snap.docs.map((d) => {
            const data: any = d.data();
            return { id: d.id, ...data };
        });

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}