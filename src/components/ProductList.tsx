"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Product } from "@/types/product";
import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/ui/Card";

type ProductsResponse = { ok: true; items: Product[] };

export default function ProductList() {
    const { data, error, isLoading } = useSWR<ProductsResponse>(
        "/api/products",
        fetcher
    );

    if (isLoading)
        return (
            <Container className="py-10">
                <p className="text-white/60">Loading products...</p>
            </Container>
        );

    if (error)
        return (
            <Container className="py-10">
                <p className="text-red-500">
                    Error: {String(error.message ?? error)}
                </p>
            </Container>
        );

    return (
        <main className="py-10">
            <Container>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data?.items.map((p) => (
                        <Link key={p.id} href={`/products/${p.id}`}>
                            <Card className="p-5 transition hover:ring-white/30 cursor-pointer">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            {p.title}
                                        </h3>

                                        <p className="mt-2 text-lg font-semibold text-white/90">
                                            {p.price} ₺
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs ring-1 ${p.inStock
                                                ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
                                                : "bg-red-500/15 text-red-300 ring-red-400/20"
                                            }`}
                                    >
                                        {p.inStock ? "In stock" : "Out of stock"}
                                    </span>
                                </div>

                                <p className="mt-4 text-xs text-white/50">
                                    {p.createdAt
                                        ? new Date(p.createdAt).toLocaleString("tr-TR")
                                        : "-"}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Container>
        </main>
    );
}
