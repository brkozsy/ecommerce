import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snap = await adminDb.collection("products").limit(20).get();
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        return NextResponse.json({ ok: true, items });
    } catch (err) {
        console.error("GET /api/products error:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
