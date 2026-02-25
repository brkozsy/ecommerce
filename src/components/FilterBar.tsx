"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = ["Hepsi", "Bilgisayar", "Tablet", "Telefon", "Oyun Konsolu", "Şarj Aleti", "Saat"];

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || "Hepsi";
    const currentSort = searchParams.get("sort") || "default";

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "Hepsi" || value === "default") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
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
                <option value="default">Siralama Seçin</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            </select>
        </div>
    );
}
