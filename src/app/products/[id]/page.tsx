import { notFound } from "next/navigation";
import { adminDb } from "@/lib/server/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Product = {
    id: string;
    title: string;
    price: number;
    inStock: boolean;
    createdAt: string | null;
};

async function getProduct(id: string | undefined): Promise<Product | null> {
    if (!id) return null;

    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data() as any;
    const ts = data.createdAt as Timestamp | undefined;

    return {
        id: doc.id,
        title: String(data.title ?? ""),
        price: Number(data.price ?? 0),
        inStock: Boolean(data.inStock),
        createdAt: ts ? ts.toDate().toISOString() : null,
    };
}


export default async function ProductDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const p = await getProduct(params.id);
    if (!p) notFound();

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <div className="rounded-2xl border p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{p.title}</h1>
                        <p className="mt-2 text-sm opacity-70">
                            {p.inStock ? "✅ In stock" : "⛔ Out of stock"}
                        </p>
                    </div>

                    <p className="text-2xl font-extrabold">{p.price} ₺</p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border p-4">
                        <p className="text-xs opacity-70">Product ID</p>
                        <p className="mt-1 font-mono text-sm">{p.id}</p>
                    </div>

                    <div className="rounded-2xl border p-4">
                        <p className="text-xs opacity-70">Created At</p>
                        <p className="mt-1 text-sm">
                            {p.createdAt ? new Date(p.createdAt).toLocaleString("tr-TR") : "-"}
                        </p>
                    </div>
                </div>

                <button
                    className="mt-6 w-full rounded-2xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5"
                    disabled={!p.inStock}
                >
                    Add to cart (Gün 4)
                </button>
            </div>
        </main>
    );
}