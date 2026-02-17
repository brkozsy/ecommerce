"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

type ProductLike = {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl?: string;
    description?: string;
};

export default function AddToCartButton({ product }: { product: ProductLike }) {
    const add = useCartStore((s) => s.add);
    const items = useCartStore((s) => s.items);

    const stock = Number(product.stock ?? 0);
    const canAdd = Number.isFinite(stock) && stock > 0;

    const inCart = useMemo(() => {
        return items.some((x) => x.id === product.id);
    }, [items, product.id]);

    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!added) return;
        const t = window.setTimeout(() => setAdded(false), 1400);
        return () => window.clearTimeout(t);
    }, [added]);

    function onAdd() {
        if (!canAdd) return;

        const p: Product = {
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl || "",
            description: product.description || "",
            inStock: true,
        };

        add(p);
        setAdded(true);
    }

    const label = !canAdd
        ? "Stok yok"
        : added
            ? "Sepete eklendi ✓"
            : inCart
                ? "1 tane daha ekle"
                : "Sepete Ekle";

    const base =
        "w-full rounded-xl px-4 py-2 font-semibold shadow-sm transition-all duration-150";
    const enabled = added
        ? "bg-emerald-600 text-white"
        : "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99]";
    const disabled = "cursor-not-allowed bg-zinc-200 text-zinc-500";

    return (
        <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd || added}
            className={base + " " + (canAdd ? enabled : disabled)}
        >
            {label}
        </button>
    );
}
