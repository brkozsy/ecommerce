import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

function num(v: any, fallback = 0) {
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
    try {
        await requireAdmin();

        const snap = await adminDb
            .collection("products")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}

export async function POST(req: Request) {
    try {
        await requireAdmin();

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

        const title = String(body.title || "").trim();
        const description = String(body.description || "").trim();
        const imageUrl = String(body.imageUrl || "").trim();
        const price = num(body.price, NaN);
        const stock = num(body.stock, 0);
        const isActive = body.isActive !== false; // default true

        if (!title) return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
        if (!Number.isFinite(price)) return NextResponse.json({ ok: false, error: "price must be number" }, { status: 400 });

        const now = new Date();

        const ref = await adminDb.collection("products").add({
            title,
            description: description || null,
            imageUrl: imageUrl || null,
            price,
            stock,
            isActive,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ ok: true, id: ref.id });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}
