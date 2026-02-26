"use client";

import Link from "next/link";
import useSWR from "swr";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { getMyOrders } from "@/lib/api/orders";
import type { Order } from "@/types/order";
import {
    Loader2,
    AlertCircle,
    PackageX,
    Package,
    ChevronRight,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ArrowRight,
    Lock
} from "lucide-react";

// --- YARDIMCI FONKSİYONLAR ---
async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken();
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

// Sipariş durumuna göre renk ve ikon belirleyen yardımcı fonksiyon
const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
        case "completed":
        case "delivered":
            return { label: "Tamamlandı", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
        case "shipped":
            return { label: "Kargoya Verildi", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Truck };
        case "cancelled":
            return { label: "İptal Edildi", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle };
        case "pending":
        default:
            return { label: "Hazırlanıyor", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Clock };
    }
};

export default function OrdersPage() {
    const user = useAuthStore((s: any) => s.user);
    const loadingAuth = useAuthStore((s: any) => s.loading);

    const { data, isLoading, error } = useSWR<Order[]>(
        user ? "my-orders" : null,
        async () => {
            const token = await tokenOrThrow();
            return await getMyOrders(token);
        },
        { revalidateOnFocus: false }
    );

    // 1. AUTH YÜKLENİYOR
    if (loadingAuth) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </main>
        );
    }

    // 2. GİRİŞ YAPILMAMIŞ
    if (!user) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-xl shadow-gray-200/40 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Lock className="h-7 w-7 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapmanız Gerekiyor</h1>
                    <p className="text-gray-500 text-sm mb-8">Sipariş geçmişinizi görüntülemek ve kargo takibi yapmak için lütfen giriş yapın.</p>
                    <Link
                        href="/login?next=/orders"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 text-sm font-bold text-white hover:bg-black transition-colors shadow-lg shadow-gray-200"
                    >
                        Giriş Yap / Üye Ol <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </main>
        );
    }

    // 3. SİPARİŞLER YÜKLENİYOR
    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <span className="text-sm font-semibold text-gray-500 animate-pulse">Siparişleriniz getiriliyor...</span>
            </main>
        );
    }

    // 4. HATA DURUMU
    if (error) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
                    <h2 className="text-lg font-bold text-red-800 mb-2">Siparişler Alınamadı</h2>
                    <p className="text-sm text-red-600/80">{String((error as any)?.message || error)}</p>
                </div>
            </main>
        );
    }

    const items = Array.isArray(data) ? data : [];

    return (
        <main className="min-h-screen bg-[#FAFAFB] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">

                {/* Başlık Alanı */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Siparişlerim</h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">Tüm sipariş geçmişiniz ve kargo durumları.</p>
                    </div>
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Alışverişe Devam Et <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* BOŞ DURUM */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-gray-100 p-16 text-center shadow-sm">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                            <PackageX className="h-10 w-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz siparişiniz bulunmuyor</h2>
                        <p className="text-gray-500 max-w-sm mb-8">Mağazamızdaki harika ürünleri keşfederek ilk siparişinizi hemen oluşturabilirsiniz.</p>
                        <Link
                            href="/home"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Ürünleri Keşfet
                        </Link>
                    </div>
                ) : (
                    /* SİPARİŞ LİSTESİ */
                    <div className="space-y-4">
                        {items.map((order: any) => {
                            // Tarih Formatlama
                            const created =
                                typeof order.createdAt === "number"
                                    ? new Date(order.createdAt)
                                    : order.createdAt?.toDate?.()
                                        ? order.createdAt.toDate()
                                        : null;

                            const formattedDate = created
                                ? created.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })
                                : "Tarih Bilinmiyor";

                            // Durum Konfigürasyonu
                            const StatusIcon = getStatusConfig(order.status).icon;
                            const statusColor = getStatusConfig(order.status).color;
                            const statusLabel = getStatusConfig(order.status).label;

                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        {/* Sol Kısım: Tarih ve Durum */}
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-sm font-bold text-gray-900">{formattedDate}</span>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${statusColor}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {statusLabel}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Sipariş No</p>
                                                <p className="font-mono text-sm font-semibold text-gray-700">{order.id}</p>
                                            </div>
                                        </div>

                                        {/* Sağ Kısım: Tutar ve Ok */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Toplam Tutar</p>
                                                <p className="text-xl font-black text-indigo-600">
                                                    {formatPrice(Number(order.total ?? 0))}
                                                </p>
                                            </div>

                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}