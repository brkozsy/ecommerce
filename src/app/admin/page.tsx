"use client";

import useSWR from "swr";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";

async function authedJson(url: string) {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");

    const token = await u.getIdToken();
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
        try {
            const j = text ? JSON.parse(text) : null;
            if (j?.error) throw new Error(j.error);
        } catch { }
        if (res.status === 401) throw new Error("UNAUTHENTICATED");
        if (res.status === 403) throw new Error("FORBIDDEN");
        throw new Error(text || `Request failed (${res.status})`);
    }
    return text ? JSON.parse(text) : null;
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm opacity-70">{title}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            {hint ? <p className="mt-2 text-xs opacity-60">{hint}</p> : null}
        </div>
    );
}

export default function AdminDashboardPage() {
    const { data, error, isLoading, mutate } = useSWR("/api/admin/metrics", authedJson);

    if (isLoading) return <div>Yükleniyor...</div>;

    if (error) {
        const msg = String((error as any)?.message || error);
        if (msg.includes("LOGIN_REQUIRED") || msg.includes("UNAUTHENTICATED"))
            return <div>Admin için giriş yapmalısın.</div>;
        if (msg.includes("FORBIDDEN")) return <div>Yetkin yok (admin değilsin).</div>;
        return <div className="text-red-600">Hata: {msg}</div>;
    }

    const m = data?.metrics || { ordersCount: 0, pendingCount: 0, productsCount: 0, revenue: 0 };

    const revenueTRY = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
    }).format(m.revenue || 0);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Dashboard</h2>

                <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => mutate()}>
                        Yenile
                    </button>

                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Toplam Sipariş" value={String(m.ordersCount)} />
                <Card title="Pending Sipariş" value={String(m.pendingCount)} hint="Kargoya verilmemiş / işlem bekleyen" />
                <Card title="Toplam Ürün" value={String(m.productsCount)} />
                <Card title="Ciro" value={revenueTRY} hint="Orders.total toplamı" />
            </div>
        </div>
    );
}
