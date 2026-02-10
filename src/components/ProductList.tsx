"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Product } from "@/types/product";
import Link from "next/link";

type ProductsResponse = { ok: true; items: Product[] };

export default function ProductList() {
    const { data, error, isLoading } = useSWR<ProductsResponse>("/api/products", fetcher);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">Error: {String(error.message ?? error)}</p>;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((p) => (
                <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="block rounded-2xl border p-4 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{p.title}</h3>
                        <span className="text-sm">{p.inStock ? "In stock" : "Out"}</span>
                    </div>
                    <p className="mt-2 text-lg font-bold">{p.price} ₺</p>
                    <p className="mt-2 text-xs opacity-70">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString("tr-TR") : "-"}
                    </p>
                </Link>
            ))}
        </div>
    );
}
