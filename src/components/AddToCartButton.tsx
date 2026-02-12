"use client";

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

    const stock = Number(product.stock ?? 0);
    const canAdd = Number.isFinite(stock) && stock > 0;

    function onAdd() {
        if (!canAdd) return;

        const p: Product = {
            id: product.id,
            title: product.title,
            price: product.price,
            stock,
            imageUrl: product.imageUrl || "",
            description: product.description || "",
            inStock: true,
        };

        add(p);
    }

    return (
        <button
            onClick={onAdd}
            disabled={!canAdd}
            className={
                "w-full rounded-xl px-4 py-2 font-semibold shadow-sm " +
                (canAdd
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "cursor-not-allowed bg-zinc-200 text-zinc-500")
            }
        >
            {canAdd ? "Sepete Ekle" : "Stok yok"}
        </button>
    );
}
