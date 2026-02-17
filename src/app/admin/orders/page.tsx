"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const user = auth.currentUser;
                if (!user) {
                    setOrders([]);
                    return;
                }

                const token = await user.getIdToken(true);
                const res = await fetch("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await res.json();
                if (!res.ok || !data?.ok) {
                    setOrders([]);
                    return;
                }

                setOrders(data.items ?? []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50/50">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
                        <p className="mt-1 text-sm text-gray-500">Tüm siparişlerin burada listelenir.</p>
                    </div>
                    <Link
                        href="/"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50"
                    >
                        Alışverişe Dön
                    </Link>
                </div>

                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-10 text-center text-gray-600">Henüz sipariş yok.</div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((o) => (
                                <Link
                                    key={o.id}
                                    href={`/orders/${o.id}`}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Sipariş #{String(o.id).slice(0, 8).toUpperCase()}</p>
                                        <p className="mt-1 text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString("tr-TR") : ""}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-indigo-600">
                                            ₺{Number(o?.totals?.total ?? 0).toLocaleString("tr-TR")}
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-gray-500">{o.status ?? "pending"}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
