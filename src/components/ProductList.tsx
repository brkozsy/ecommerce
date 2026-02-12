"use client";

import Link from "next/link";
import type { Product } from "@/types/product";

export default function ProductList({ items }: { items: Product[] }) {
    if (!items?.length) {
        return (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-zinc-600 shadow-sm">
                No products yet.
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
                const img = (p.imageUrl || "").trim(); // ✅ sadece imageUrl
                return (
                    <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="h-44 w-full bg-zinc-100">
                            {img ? (
                                <img
                                    src={img}
                                    alt={p.title}
                                    className="h-44 w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-44 items-center justify-center text-sm text-zinc-500">
                                    No image
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">
                                    {p.title}
                                </h3>
                                <p className="shrink-0 text-base font-bold text-orange-600">
                                    {p.price} ₺
                                </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span
                                    className={
                                        "rounded-full px-3 py-1 text-xs font-medium " +
                                        (p.stock > 0
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700")
                                    }
                                >
                                    {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
                                </span>

                                <span className="text-xs text-zinc-500 group-hover:text-zinc-700">
                                    View details →
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
