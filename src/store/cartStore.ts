import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

type CartState = {
    items: CartItem[];
    add: (p: Product) => void;
    inc: (id: string) => void;
    dec: (id: string) => void;
    remove: (id: string) => void;
    clear: () => void;
    totalPrice: () => number;
    totalQty: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            add: (p) =>
                set((s) => {
                    const found = s.items.find((i) => i.id === p.id);
                    if (found) {
                        return {
                            items: s.items.map((i) =>
                                i.id === p.id ? { ...i, qty: i.qty + 1 } : i
                            ),
                        };
                    }
                    return {
                        items: [...s.items, { id: p.id, title: p.title, price: p.price, qty: 1 }],
                    };
                }),

            inc: (id) =>
                set((s) => ({
                    items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
                })),

            dec: (id) =>
                set((s) => ({
                    items: s.items
                        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                        .filter((i) => i.qty > 0),
                })),

            remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

            clear: () => set({ items: [] }),

            totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
            totalQty: () => get().items.reduce((sum, i) => sum + i.qty, 0),
        }),
        { name: "cart-v1" }
    )
);
