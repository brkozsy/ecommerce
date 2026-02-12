import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartItem = {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    qty: number;
};

type CartState = {
    items: CartItem[];
    add: (p: Product) => void;
    inc: (id: string) => void;
    dec: (id: string) => void;
    remove: (id: string) => void;
    clear: () => void;
    totalQty: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            // ✅ aynı ürün varsa qty +1
            add: (p) =>
                set((state) => {
                    const idx = state.items.findIndex((x) => x.id === p.id);
                    if (idx >= 0) {
                        const next = [...state.items];
                        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
                        return { items: next };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                id: p.id,
                                title: p.title,
                                price: p.price,
                                imageUrl: p.imageUrl || "",
                                qty: 1,
                            },
                        ],
                    };
                }),

            inc: (id) =>
                set((state) => ({
                    items: state.items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
                })),

            dec: (id) =>
                set((state) => ({
                    items: state.items
                        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
                        .filter((x) => x.qty > 0),
                })),

            remove: (id) =>
                set((state) => ({
                    items: state.items.filter((x) => x.id !== id),
                })),

            clear: () => set({ items: [] }),

            totalQty: () => get().items.reduce((sum, x) => sum + x.qty, 0),

            totalPrice: () => get().items.reduce((sum, x) => sum + x.qty * x.price, 0),
        }),
        { name: "cart-store" }
    )
);
