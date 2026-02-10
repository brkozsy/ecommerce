"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types/order";

export default function OrdersPage() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    const [items, setItems] = useState<Order[]>([]);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        async function run() {
            setMsg("");
            if (!auth.currentUser) return;

            const token = await auth.currentUser.getIdToken();
            const res = await fetch("/api/orders", {
                headers: { authorization: `Bearer ${token}` },
                cache: "no-store" as any,
            });

            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.ok) {
                setMsg(json?.error ? `Hata: ${json.error}` : "Orders yüklenemedi.");
                return;
            }
            setItems(json.items as Order[]);
        }
        run();
    }, [user?.uid]);

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Orders</h1>
                <Link className="rounded-2xl border px-4 py-2" href="/">Back to products</Link>
            </div>

            {loading ? <p>Loading...</p> : null}

            {!loading && !user ? (
                <div className="rounded-2xl border p-5">
                    <p className="opacity-70">Siparişleri görmek için giriş yap.</p>
                    <Link className="underline" href="/login">Login</Link>
                </div>
            ) : null}

            {msg ? <p className="text-sm">{msg}</p> : null}

            {user && items.length === 0 ? (
                <div className="rounded-2xl border p-5">
                    <p className="opacity-70">Henüz sipariş yok.</p>
                </div>
            ) : null}

            <div className="space-y-3">
                {items.map((o) => (
                    <div key={o.id} className="rounded-2xl border p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold">Order #{o.id}</p>
                                <p className="text-sm opacity-70">{new Date(o.createdAt).toLocaleString("tr-TR")}</p>
                                <p className="text-sm opacity-70">Status: {o.status}</p>
                            </div>
                            <p className="font-bold">{o.total.toFixed(2)} ₺</p>
                        </div>

                        <div className="mt-3 space-y-1">
                            {o.items.map((it) => (
                                <p key={it.id} className="text-sm opacity-80">
                                    • {it.title} × {it.qty}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
