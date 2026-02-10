import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";
import type { Product } from "@/types/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snap = await adminDb.collection("products").limit(20).get();

        const items: Product[] = snap.docs.map((d) => {
            const data = d.data() as any;
            const ts = data.createdAt as Timestamp | undefined;

            return {
                id: d.id,
                title: String(data.title ?? ""),
                price: Number(data.price ?? 0),
                inStock: Boolean(data.inStock),
                createdAt: ts ? ts.toDate().toISOString() : null,
            };
        });

        return NextResponse.json({ ok: true, items });
    } catch (err: any) {
        console.error("GET /api/products error:", err);
        return NextResponse.json({ ok: false, error: err?.message ?? "Internal error" }, { status: 500 });
    }
}
