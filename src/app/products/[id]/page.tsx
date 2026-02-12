"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

type ProductDTO = {
    id: string;
    title: string;
    price: number;
    stock?: number | string | null;
    imageUrl?: string | null;
    description?: string | null;
};

function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [p, setP] = useState<ProductDTO | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            if (!id) return;

            setLoading(true);
            setErr(null);

            try {
                const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                    cache: "no-store",
                });

                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error || `Request failed (${res.status})`);
                }

                if (alive) setP(data.item as ProductDTO);
            } catch (e: any) {
                if (alive) setErr(e?.message || "Error");
            } finally {
                if (alive) setLoading(false);
            }
        }

        run();

        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    Loading...
                </div>
            </main>
        );
    }

    if (err) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {err}
                </div>
            </main>
        );
    }

    if (!p) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    Product not found
                </div>
            </main>
        );
    }

    const stock = toNumber(p.stock, 0);
    const inStock = stock > 0;

    return (
        <main className="mx-auto max-w-5xl p-6 text-black">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                    {p.imageUrl ? (
                        <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="h-[420px] w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-[420px] items-center justify-center bg-zinc-100 text-zinc-500">
                            No image
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold">{p.title}</h1>

                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-xl font-semibold">{p.price} ₺</p>

                        <span
                            className={
                                "rounded-full px-3 py-1 text-sm font-medium " +
                                (inStock
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700")
                            }
                        >
                            {inStock ? `Stock: ${stock}` : "Out of stock"}
                        </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-zinc-700">
                        {p.description?.trim() ? p.description : "No description yet."}
                    </p>

                    <div className="mt-6">
                        <AddToCartButton
                            product={{
                                id: p.id,
                                title: p.title,
                                price: p.price,
                                stock,
                                imageUrl: p.imageUrl ?? "",
                                description: p.description ?? "",
                            }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
