import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
    try {
        const snap = await adminDb.collection("products").limit(20).get();

        const items = snap.docs.map((d) => {
            const p: any = d.data();

            const stock = toNumber(p.stock, 0);
            const isActive = p.isActive !== false;
            const inStock = isActive && stock > 0;

            return {
                id: d.id,
                title: p.title ?? "",
                price: toNumber(p.price, 0),
                stock,
                inStock,
                imageUrl: p.imageUrl ?? null,
                description: p.description ?? null,
                isActive,
                createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : null,
            };
        });

        return NextResponse.json({ ok: true, items });
    } catch (err: any) {
        console.error("GET /api/products error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "Internal error" }, { status: 500 });
    }
}
