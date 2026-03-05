"use client";

import useSWR from "swr";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { adminListOrders } from "@/lib/api/adminOrders";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken(true);
}

export default function OrdersPage() {
    const { data: orders, isLoading, error } = useSWR(
        "admin-orders",
        async () => {
            const token = await tokenOrThrow();
            return await adminListOrders(token);
        },
        { revalidateOnFocus: false }
    );

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50/50 px-4 py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="ml-3 text-sm text-gray-600">Siparişler yükleniyor...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50/50 px-4 py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-2 text-red-600 font-semibold">
                            <AlertCircle className="h-5 w-5" />
                            Siparişler alınamadı
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{String((error as any)?.message || error)}</p>
                    </div>
                </div>
            </main>
        );
    }

    const items = Array.isArray(orders) ? orders : [];

    return (
        <main className="min-h-screen bg-gray-50/50 px-4 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Siparişler</h1>
                    <Link href="/admin" className="text-sm font-semibold text-indigo-600 hover:underline">
                        Dashboard <ArrowRight className="inline h-4 w-4" />
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-10 shadow-sm text-center text-gray-600">
                        Henüz sipariş yok.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Sipariş ID</th>
                                    <th className="px-6 py-4">Toplam</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4">Tarih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((o: any) => {
                                    const created =
                                        o?.createdAt?.toDate?.()
                                            ? o.createdAt.toDate()
                                            : typeof o?.createdAt === "number"
                                                ? new Date(o.createdAt)
                                                : o?.createdAt
                                                    ? new Date(String(o.createdAt))
                                                    : null;
                                    const total = Number(o?.total ?? 0);
                                    return (
                                        <tr key={o.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-700">{o.id}</td>
                                            <td className="px-6 py-4 font-semibold">{total.toLocaleString("tr-TR")} ₺</td>
                                            <td className="px-6 py-4">{String(o?.status ?? "pending")}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {created ? created.toLocaleString("tr-TR") : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}