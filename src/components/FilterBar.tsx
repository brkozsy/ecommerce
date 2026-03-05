"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";

const ALL = "Hepsi";

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || ALL;
    const currentSort = searchParams.get("sort") || "default";

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === "category") {
            if (!value || value === ALL) params.delete("category");
            else params.set("category", value);
        } else if (key === "sort") {
            if (!value || value === "default") params.delete("sort");
            else params.set("sort", value);
        } else {
            if (!value) params.delete(key);
            else params.set(key, value);
        }

        const qs = params.toString();
        router.push(qs ? `?${qs}` : "?", { scroll: false });
    };

    const categories = [ALL, ...PRODUCT_CATEGORIES];

    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => updateFilters("category", cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${currentCategory === cat
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <select
                value={currentSort}
                onChange={(e) => updateFilters("sort", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="default">Sıralama Seçin</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            </select>
        </div>
    );
}