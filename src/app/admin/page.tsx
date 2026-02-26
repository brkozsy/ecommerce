"use client";

import useSWR from "swr";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { adminGetMetrics } from "@/lib/api/adminMetrics";
import {
    DollarSign,
    Package,
    ShoppingBag,
    Plus,
    Loader2,
    AlertCircle,
    Clock,
    ArrowRight,
    TrendingUp,
    LayoutGrid
} from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken(true);
}

export default function AdminDashboard() {
    const { data: metrics, isLoading, error } = useSWR(
        "admin-metrics",
        async () => {
            const token = await tokenOrThrow();
            return await adminGetMetrics(token);
        },
        { revalidateOnFocus: false }
    );

    // 1. YÜKLENİYOR DURUMU
    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#F4F4F5] px-4 py-10 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <span className="text-sm font-semibold text-gray-500 animate-pulse">Metrikler yükleniyor...</span>
            </main>
        );
    }

    // 2. HATA DURUMU
    if (error) {
        return (
            <main className="min-h-screen bg-[#F4F4F5] px-4 py-10 flex items-center justify-center">
                <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-red-50 p-8 shadow-sm text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
                    <h2 className="text-lg font-bold text-red-800 mb-2">Veriler Alınamadı</h2>
                    <p className="text-sm text-red-600/80">{String((error as any)?.message || error)}</p>
                </div>
            </main>
        );
    }

    const revenue = metrics?.revenue ?? 0;
    const pendingCount = metrics?.pendingCount ?? 0;
    const productsCount = metrics?.productsCount ?? 0;
    const ordersCount = metrics?.ordersCount ?? 0;

    return (
        <main className="min-h-screen bg-[#F4F4F5] px-4 py-8 md:py-12">
            <div className="mx-auto max-w-6xl">

                {/* ÜST BİLGİ (HEADER) */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <LayoutGrid className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm font-bold tracking-wider text-indigo-600 uppercase">Yönetim Paneli</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Mağaza Özeti</h1>
                        <p className="mt-1.5 text-sm font-medium text-gray-500">Satışlarınızı, siparişlerinizi ve ürünlerinizi buradan takip edin.</p>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-300 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5" /> Yeni Ürün Ekle
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500">Toplam Ciro</h3>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{formatPrice(revenue)}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                            <TrendingUp className="h-3.5 w-3.5" /> Genel Toplam
                        </div>
                    </div>

                    {/* Toplam Sipariş Kartı */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500">Tüm Siparişler</h3>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{ordersCount}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            Toplam alınan sipariş adedi
                        </div>
                    </div>

                    {/* Bekleyen Sipariş Kartı (Dikkat Çekici) */}
                    <div className={`rounded-2xl border ${pendingCount > 0 ? "border-orange-200 bg-orange-50/30" : "border-gray-200 bg-white"} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500">Bekleyen Sipariş</h3>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pendingCount > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                        <p className={`text-3xl font-black ${pendingCount > 0 ? "text-orange-700" : "text-gray-900"}`}>
                            {pendingCount}
                        </p>
                        {pendingCount > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600">
                                Acil gönderim bekliyor!
                            </div>
                        )}
                    </div>

                    {/* Toplam Ürün Kartı */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500">Aktif Ürünler</h3>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{productsCount}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            Katalogdaki toplam çeşit
                        </div>
                    </div>
                </div>

                {/* HIZLI İŞLEMLER BÖLÜMÜ */}
                <h2 className="text-lg font-bold text-gray-900 mt-12 mb-6">Hızlı İşlemler</h2>
                <div className="grid gap-6 sm:grid-cols-2">

                    {/* Sipariş Yönetimi Kartı */}
                    <Link href="/admin/orders" className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Siparişleri Yönet</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Tüm sipariş durumlarını incele ve güncelle</p>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                    {/* Ürün Yönetimi Kartı */}
                    <Link href="/admin/products" className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Kataloğu Yönet</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Ürün stoklarını, fiyatları ve içerikleri düzenle</p>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                </div>
            </div>
        </main>
    );
}