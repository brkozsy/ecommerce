"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { getOrder } from "@/lib/api/orders";
import {
    Loader2,
    AlertCircle,
    ArrowLeft,
    Package,
    CheckCircle2,
    Truck,
    XCircle,
    Clock,
    Lock,
    MapPin,
    CreditCard,
    Receipt
} from "lucide-react";

// --- YARDIMCI FONKSİYONLAR ---
const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken();
}

// Sipariş durumuna göre renk ve ikon belirleyen fonksiyon
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

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = useMemo(() => String((params as any)?.id || ""), [params]);

    const user = useAuthStore((s: any) => s.user);

    const { data: order, isLoading, error } = useSWR(
        user && id ? ["order", id] : null,
        async () => {
            const token = await tokenOrThrow();
            return await getOrder(token, id);
        },
        { revalidateOnFocus: false }
    );

    // 1. GİRİŞ YAPILMAMIŞ
    if (!user) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-xl shadow-gray-200/40 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Lock className="h-7 w-7 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapmanız Gerekiyor</h1>
                    <p className="text-gray-500 text-sm mb-8">Bu siparişin detaylarını görebilmek için giriş yapmalısınız.</p>
                    <button
                        onClick={() => router.push(`/login?next=/orders/${encodeURIComponent(id)}`)}
                        className="w-full rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-black transition-colors shadow-lg shadow-gray-200"
                    >
                        Giriş Yap / Üye Ol
                    </button>
                </div>
            </main>
        );
    }

    // 2. ID YOK
    if (!id) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Geçersiz sipariş numarası.</p>
                </div>
            </main>
        );
    }

    // 3. YÜKLENİYOR
    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <span className="text-sm font-semibold text-gray-500 animate-pulse">Sipariş detayları getiriliyor...</span>
            </main>
        );
    }

    // 4. HATA DURUMU
    if (error) {
        const msg = (error as any)?.message || "Sipariş detayları alınamadı.";
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
                    <h2 className="text-lg font-bold text-red-800 mb-2">Bir Sorun Oluştu</h2>
                    <p className="text-sm text-red-600/80 mb-8">{msg}</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => router.push("/orders")}
                            className="rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-50 transition-colors"
                        >
                            Siparişlerime Dön
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!order) return null;

    // Tarih Hesaplama
    const created = typeof order.createdAt === "number" ? new Date(order.createdAt) : order.createdAt?.toDate?.() ? order.createdAt.toDate() : null;
    const formattedDate = created ? created.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Tarih Bilinmiyor";

    // Durum Ayarları
    const { label: statusLabel, color: statusColor, icon: StatusIcon } = getStatusConfig(order.status);

    return (
        <main className="min-h-screen bg-[#FAFAFB] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Üst Navigasyon */}
                <button
                    onClick={() => router.push("/orders")}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Siparişlerime Dön
                </button>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

                    {/* SOL KOLON: SİPARİŞ İÇERİĞİ */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Başlık ve Durum Kartı */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sipariş Detayı</h1>
                                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                        <p className="text-gray-500">
                                            Sipariş No: <span className="font-mono font-semibold text-gray-900">{order.id}</span>
                                        </p>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <p className="text-gray-500">{formattedDate}</p>
                                    </div>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${statusColor}`}>
                                    <StatusIcon className="h-5 w-5" />
                                    {statusLabel}
                                </div>
                            </div>
                        </div>

                        {/* Ürünler Listesi Kartı */}
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-indigo-600" /> Satın Alınan Ürünler
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {order.items?.map((it: any) => (
                                        <div key={it.id} className="flex flex-col sm:flex-row sm:items-center gap-4 group">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 relative p-2">
                                                {it.imageUrl ? (
                                                    <img src={it.imageUrl} alt={it.title} className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <Package className="h-full w-full text-gray-200" />
                                                )}
                                                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white ring-2 ring-white">
                                                    {it.qty}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-base">{it.title}</p>
                                                <p className="text-sm text-gray-500 mt-1">Birim Fiyat: {formatPrice(Number(it.price || 0))}</p>
                                            </div>
                                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                <p className="text-lg font-black text-gray-900">
                                                    {formatPrice(Number(it.price || 0) * Number(it.qty || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: ÖZET VE BİLGİLER */}
                    <div className="lg:col-span-4 mt-6 lg:mt-0 space-y-6">

                        {/* Tutar Özeti */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <Receipt className="h-5 w-5 text-indigo-600" /> Sipariş Özeti
                            </h2>
                            <div className="space-y-4 text-sm font-medium text-gray-500">
                                <div className="flex justify-between">
                                    <span>Ara Toplam</span>
                                    <span className="text-gray-900">{formatPrice(Number(order.total || 0))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kargo Tutarı</span>
                                    <span className="text-emerald-600 font-bold">Ücretsiz</span>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-gray-100 pt-6 flex items-center justify-between">
                                <span className="text-base font-bold text-gray-900">Genel Toplam</span>
                                <span className="text-2xl font-black text-indigo-600">{formatPrice(Number(order.total || 0))}</span>
                            </div>
                        </div>

                        {/* Teslimat Bilgileri (Eğer veritabanında kayıtlıysa) */}
                        {order.shipping && (
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <MapPin className="h-5 w-5 text-indigo-600" /> Teslimat Adresi
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alıcı</p>
                                        <p className="font-semibold text-gray-900 mt-0.5">{order.shipping.adSoyad}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telefon</p>
                                        <p className="font-medium text-gray-700 mt-0.5">{order.shipping.telefon}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Adres</p>
                                        <p className="font-medium text-gray-700 mt-0.5 leading-relaxed">
                                            {order.shipping.adres}, {order.shipping.sehir}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ödeme Bilgileri (Eğer veritabanında kayıtlıysa) */}
                        {order.payment && (
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                                    <CreditCard className="h-5 w-5 text-indigo-600" /> Ödeme Yöntemi
                                </h2>
                                <p className="text-sm font-semibold text-gray-700 capitalize">
                                    {order.payment.method === "card" ? "Kredi Kartı" :
                                        order.payment.method === "cod" ? "Kapıda Ödeme" :
                                            order.payment.method === "transfer" ? "Havale / EFT" : order.payment.method}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}