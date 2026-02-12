"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { DollarSign, Package, Users, ShoppingBag, Plus, Loader2 } from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        pendingCount: 0,
        productsCount: 0,
        customersCount: 0,
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const user = auth.currentUser;
                if (!user) throw new Error("LOGIN_REQUIRED");

                const token = await user.getIdToken(true);

                const res = await fetch("/api/admin/metrics", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await res.json();
                if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Metrics alınamadı");

                const m = data.metrics || {};
                setStats({
                    revenue: Number(m.revenue ?? 0),
                    pendingCount: Number(m.pendingCount ?? 0),
                    productsCount: Number(m.productsCount ?? 0),
                    customersCount: Number(m.customersCount ?? 0),
                });
            } catch (e) {
                console.error("ADMIN METRICS ERROR:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading)
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );

    const cards = [
        { label: "Toplam Satış", value: formatPrice(stats.revenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
        { label: "Aktif Siparişler", value: String(stats.pendingCount), icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Müşteriler", value: String(stats.customersCount), icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
        { label: "Toplam Ürün", value: String(stats.productsCount), icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Yönetim Paneli</h1>
                    <p className="mt-1 text-sm text-gray-500">Performans özeti.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"
                    >
                        <ShoppingBag className="h-4 w-4" /> Ürün Listesi
                    </Link>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" /> Yeni Ürün Ekle
                    </Link>
                </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
