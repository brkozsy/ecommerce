import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;

        const doc = await adminDb.collection("products").doc(id).get();
        if (!doc.exists) {
            return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
        }

        const data = doc.data() as any;
        const ts = data.createdAt as Timestamp | undefined;

        const stock = toNumber(data.stock, 0);
        const isActive = data.isActive !== false;
        const inStock = isActive && stock > 0;

        const item = {
            id: doc.id,
            title: String(data.title ?? ""),
            price: toNumber(data.price, 0),
            stock,
            inStock,
            imageUrl: data.imageUrl ?? null,
            description: data.description ?? null,
            isActive,
            createdAt: ts ? ts.toDate().toISOString() : null,
        };

        return NextResponse.json({ ok: true, item });
    } catch (err: any) {
        console.error("GET /api/products/[id] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "Internal error" }, { status: 500 });
    }
}
