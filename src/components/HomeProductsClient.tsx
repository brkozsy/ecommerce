"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import ProductList from "@/components/ProductList";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

const ALL = "Hepsi";

export default function HomeProductsClient() {
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || ALL;
    const sort = searchParams.get("sort") || "default";

    const { data: items, isLoading, error } = useSWR<Product[]>("products", getProducts);

    const safeItems = items ?? [];

    let filteredItems = safeItems.filter((item) => {
        if (!category || category === ALL) return true;

        const selectedCat = category.toLowerCase().trim();
        const itemCat = String((item as any).category || "").toLowerCase().trim();
        return itemCat === selectedCat;
    });

    if (sort === "price-asc") {
        filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
        filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500">Ürünler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500">Ürünler alınamadı.</p>
                <p className="mt-2 text-xs text-gray-400">{String((error as any)?.message || error)}</p>
            </div>
        );
    }

    return filteredItems.length > 0 ? (
        <ProductList items={filteredItems} />
    ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
            <p className="text-gray-500">Bu kriterlere uygun ürün bulunamadı.</p>
        </div>
    );
}