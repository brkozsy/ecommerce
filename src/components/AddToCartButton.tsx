"use client";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

export default function AddToCartButton({ product }: { product: Product }) {
    const add = useCartStore((s) => s.add);
    const qtyInCart = useCartStore((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);

    return (
        <button
            className="mt-6 w-full rounded-2xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
            disabled={!product.inStock}
            onClick={() => add(product)}
        >
            Add to cart{qtyInCart ? ` • (${qtyInCart})` : ""}
        </button>
    );
}
