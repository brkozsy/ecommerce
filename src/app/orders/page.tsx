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
        let alive = true;

        async function run() {
            try {
                setMsg("");
                setItems([]);

                // giriş yoksa çık
                if (!user?.uid) return;

                // currentUser bazen geç geliyor → bekle
                const current =
                    auth.currentUser ??
                    (await new Promise<typeof auth.currentUser>((resolve) => {
                        const unsub = auth.onAuthStateChanged((u) => {
                            unsub();
                            resolve(u);
                        });
                    }));

                if (!current) return;

                const token = await current.getIdToken();

                const res = await fetch("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const text = await res.text();
                const ct = res.headers.get("content-type") || "";

                if (!ct.includes("application/json")) {
                    throw new Error(`API JSON dönmedi (${res.status}): ${text.slice(0, 200)}`);
                }

                const json = JSON.parse(text);

                if (!res.ok || !json?.ok) {
                    throw new Error(json?.error ? `Hata: ${json.error}` : "Orders yüklenemedi.");
                }

                if (alive) setItems(json.items as Order[]);
            } catch (e: any) {
                if (alive) setMsg(e?.message ?? "Orders yüklenemedi.");
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [user?.uid]);

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Orders</h1>
                <Link className="rounded-2xl border px-4 py-2" href="/">
                    Back to products
                </Link>
            </div>

            {loading ? <p>Loading...</p> : null}

            {!loading && !user ? (
                <div className="rounded-2xl border p-5">
                    <p className="opacity-70">Siparişleri görmek için giriş yap.</p>
                    <Link className="underline" href="/login">
                        Login
                    </Link>
                </div>
            ) : null}

            {msg ? <p className="text-sm text-red-400">{msg}</p> : null}

            {user && items.length === 0 && !msg ? (
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
                                <p className="text-sm opacity-70">
                                    {new Date(o.createdAt).toLocaleString("tr-TR")}
                                </p>
                                <p className="text-sm opacity-70">Status: {o.status}</p>

                                <Link className="mt-2 inline-block underline" href={`/orders/${o.id}`}>
                                    Detayı aç
                                </Link>
                            </div>

                            <p className="font-bold">{Number(o.total).toFixed(2)} ₺</p>
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
