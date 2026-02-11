"use client";
import Image from "next/image";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Product } from "@/types/product";
import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/ui/Card";

type ProductsResponse = { ok: true; items: Product[] };

function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-white/10" />
                    <div className="h-6 w-24 rounded bg-white/10" />
                </div>
                <div className="h-6 w-20 rounded-full bg-white/10" />
            </div>
            <div className="mt-4 h-3 w-44 rounded bg-white/10" />
        </div>
    );
}


export default function ProductList() {
    const { data, error, isLoading } = useSWR<ProductsResponse>(
        "/api/products",
        fetcher
    );

    if (isLoading)
        return (
            <main className="py-10">
                <Container>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </Container>
            </main>
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
                            <Card className="overflow-hidden transition hover:ring-white/30 cursor-pointer">
                                <div className="relative h-40 w-full bg-gradient-to-br from-white/10 to-white/0">
                                    {"image" in p && (p as any).image ? (
                                        <Image
                                            src={(p as any).image}
                                            alt={p.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : null}

                                    <div className="absolute right-3 top-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs ring-1 backdrop-blur ${p.inStock
                                                ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
                                                : "bg-red-500/15 text-red-300 ring-red-400/20"
                                                }`}
                                        >
                                            {p.inStock ? "In stock" : "Out of stock"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-white font-semibold">{p.title}</h3>

                                    <p className="mt-2 text-lg font-semibold text-white/90">{p.price} ₺</p>

                                    <p className="mt-4 text-xs text-white/50">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleString("tr-TR") : "-"}
                                    </p>
                                </div>
                            </Card>

                        </Link>
                    ))}
                </div>
            </Container>
        </main>
    );
}
