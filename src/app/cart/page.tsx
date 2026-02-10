"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
    const items = useCartStore((s) => s.items);
    const inc = useCartStore((s) => s.inc);
    const dec = useCartStore((s) => s.dec);
    const remove = useCartStore((s) => s.remove);
    const clear = useCartStore((s) => s.clear);
    const totalPrice = useCartStore((s) => s.totalPrice());

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cart</h1>
                <Link className="rounded-2xl border px-4 py-2" href="/">
                    Continue shopping
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border p-6">
                    <p className="opacity-70">Sepetin boş.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((i) => (
                        <div key={i.id} className="rounded-2xl border p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">{i.title}</p>
                                    <p className="text-sm opacity-70">{i.price} ₺</p>
                                </div>

                                <button className="text-sm underline opacity-70" onClick={() => remove(i.id)}>
                                    Remove
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button className="rounded-xl border px-3 py-2" onClick={() => dec(i.id)}>-</button>
                                    <span className="min-w-10 text-center font-semibold">{i.qty}</span>
                                    <button className="rounded-xl border px-3 py-2" onClick={() => inc(i.id)}>+</button>
                                </div>

                                <p className="font-bold">{(i.price * i.qty).toFixed(2)} ₺</p>
                            </div>
                        </div>
                    ))}

                    <div className="rounded-2xl border p-5 flex items-center justify-between">
                        <p className="text-lg font-bold">Total</p>
                        <p className="text-lg font-extrabold">{totalPrice.toFixed(2)} ₺</p>
                    </div>

                    <button className="w-full rounded-2xl border px-4 py-3 font-medium" onClick={clear}>
                        Clear cart
                    </button>
                </div>
            )}
        </main>
    );
}
