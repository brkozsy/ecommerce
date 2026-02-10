"use client";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

export default function AddToCartButton({ product }: { product: Product }) {
    const add = useCartStore((s) => s.add);

    return (
        <button
            className="mt-6 w-full rounded-2xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
            disabled={!product.inStock}
            onClick={() => add(product)}
        >
            Add to cart
        </button>
    );
}
