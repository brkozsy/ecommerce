import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiOk = { ok: true; item: Product };
type ApiErr = { ok: false; error: string };

async function getOrigin() {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    return host ? `${proto}://${host}` : null;
}

async function getProduct(id: string | undefined): Promise<Product | null> {
    if (!id) return null;

    const origin = await getOrigin();
    if (!origin) return null;

    const res = await fetch(`${origin}/api/products/${encodeURIComponent(id)}`, {
        cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as ApiOk | ApiErr | null;
    if (!res.ok || !json || (json as any).ok === false) return null;

    return (json as ApiOk).item;
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await getProduct(id);
    if (!product) notFound();

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <div className="rounded-2xl border p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{product.title}</h1>
                        <p className="mt-2 text-sm opacity-70">
                            {product.inStock ? "✅ In stock" : "⛔ Out of stock"}
                        </p>
                    </div>
                    <p className="text-2xl font-extrabold">{product.price} ₺</p>
                </div>
            </div>
        </main>
    );
}
