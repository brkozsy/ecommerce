import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";
import type { Product } from "@/types/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;

        const doc = await adminDb.collection("products").doc(id).get();
        if (!doc.exists) {
            return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
        }

        const data = doc.data() as any;
        const ts = data.createdAt as Timestamp | undefined;

        const item: Product = {
            id: doc.id,
            title: String(data.title ?? ""),
            price: Number(data.price ?? 0),
            inStock: Boolean(data.inStock),
            createdAt: ts ? ts.toDate().toISOString() : null,
        };

        return NextResponse.json({ ok: true, item });
    } catch (err: any) {
        console.error("GET /api/products/[id] error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "Internal error" }, { status: 500 });
    }
}
