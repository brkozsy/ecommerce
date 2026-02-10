"use client";

import { useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";

export default function CheckoutPage() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    const cartItems = useCartStore((s) => s.items);
    const clear = useCartStore((s) => s.clear);
    const total = useCartStore((s) => s.totalPrice());

    const [msg, setMsg] = useState<string>("");

    const canOrder = useMemo(() => !!user && cartItems.length > 0, [user, cartItems.length]);

    async function placeOrder() {
        setMsg("");
        if (!auth.currentUser) {
            setMsg("Önce giriş yapmalısın.");
            return;
        }
        const token = await auth.currentUser.getIdToken();

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: cartItems }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.ok) {
            setMsg(json?.error ? `Hata: ${json.error}` : "Sipariş oluşturulamadı.");
            return;
        }

        clear();
        setMsg(`✅ Sipariş oluşturuldu. ID: ${json.id}`);
    }

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Checkout</h1>
                <Link className="rounded-2xl border px-4 py-2" href="/cart">Back to cart</Link>
            </div>

            {loading ? <p>Loading...</p> : null}
            {!loading && !user ? (
                <div className="rounded-2xl border p-5">
                    <p className="opacity-70">Checkout için giriş yap.</p>
                    <Link className="underline" href="/login">Login</Link>
                </div>
            ) : null}

            <div className="rounded-2xl border p-5 space-y-2">
                <p className="font-semibold">Items: {cartItems.length}</p>
                <p className="font-semibold">Total: {total.toFixed(2)} ₺</p>

                <button
                    className="mt-3 w-full rounded-2xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
                    disabled={!canOrder}
                    onClick={placeOrder}
                >
                    Place order
                </button>

                {msg ? <p className="text-sm mt-2">{msg}</p> : null}
            </div>
        </main>
    );
}
