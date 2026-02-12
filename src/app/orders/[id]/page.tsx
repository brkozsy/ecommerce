"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import {
    CheckCircle2,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Printer,
    ArrowRight,
    User,
    Phone,
    Loader2,
    AlertTriangle,
    Home
} from "lucide-react";

type OrderItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

type OrderDTO = {
    id: string;
    items?: OrderItem[];
    total?: number;
    createdAt?: number;
    status?: string;
    shipping?: {
        adSoyad?: string;
        telefon?: string;
        sehir?: string;
        adres?: string;
        odemeYontemi?: string;
    };
    payment?: {
        method?: string;
        status?: string;
    };
};

// Yardımcı Fonksiyonlar
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};

const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'success':
        case 'paid':
        case 'completed':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'pending':
        case 'processing':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'failed':
        case 'cancelled':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: 'Bekliyor',
        processing: 'İşleniyor',
        paid: 'Ödendi',
        completed: 'Tamamlandı',
        failed: 'Başarısız',
        cod: 'Kapıda Ödeme'
    };
    return map[status?.toLowerCase()] || status;
};

export default function OrderPage() {
    const router = useRouter();
    const { id: orderId } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDTO | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                setOrder(null);

                if (!orderId) return;

                const auth = getAuth();
                const user = auth.currentUser ?? (await new Promise<any>((resolve) => {
                    const unsub = auth.onAuthStateChanged((u) => {
                        unsub();
                        resolve(u);
                    });
                }));

                if (!user) {
                    router.replace("/login");
                    return;
                }

                const token = await user.getIdToken(true);

                const res = await fetch(`/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const text = await res.text();
                const ct = res.headers.get("content-type") || "";

                if (!ct.includes("application/json")) {
                    throw new Error(`API Hatası: ${res.status}`);
                }

                const data = JSON.parse(text);

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error ?? "Sipariş verisi alınamadı.");
                }

                if (alive) setOrder(data.order as OrderDTO);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Bilinmeyen bir hata oluştu");
            } finally {
                if (alive) setLoading(false);
            }
        }

        run();
        return () => { alive = false; };
    }, [orderId, router]);

    const items = order?.items ?? [];
    const toplam = useMemo(() => {
        if (typeof order?.total === "number") return order.total;
        return items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
    }, [order?.total, items]);

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-sm font-medium text-gray-500">Sipariş detayları yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle className="h-7 w-7" />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">Bir Sorun Oluştu</h2>
                    <p className="mb-6 text-gray-500">{error}</p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push("/")} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Ana Sayfa
                        </button>
                        <button onClick={() => window.location.reload()} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const odemeYontemi = order.payment?.method ?? order.shipping?.odemeYontemi ?? "card";
    const odemeDurumu = order.payment?.status ?? "pending";
    const siparisDurumu = order.status ?? "pending";

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Header Bölümü */}
                <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Siparişiniz Alındı!</h1>
                            <p className="text-sm text-gray-500">Teşekkürler, siparişiniz başarıyla oluşturuldu.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Printer className="h-4 w-4" />
                            Yazdır
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            <Home className="h-4 w-4" />
                            Alışverişe Dön
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* SOL KOLON: Ürün Detayları */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Ürün Listesi Kartı */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-900">Sipariş Detayı</h2>
                                <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {items.map((it, idx) => (
                                    <div key={`${it.id}-${idx}`} className="flex items-center gap-4 p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400">
                                            <Package className="h-8 w-8" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{it.title}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                <span>{it.qty} Adet</span>
                                                <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                                <span>{formatPrice(it.price)}</span>
                                            </div>
                                        </div>

                                        <div className="text-right font-semibold text-gray-900">
                                            {formatPrice(Number(it.price) * Number(it.qty))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Toplam Alanı */}
                            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Ara Toplam</span>
                                        <span>{formatPrice(toplam)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Kargo</span>
                                        <span className="text-green-600 font-medium">Ücretsiz</span>
                                    </div>
                                    <div className="my-2 h-px bg-gray-200 border-dashed"></div>
                                    <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                                        <span>Genel Toplam</span>
                                        <span className="text-indigo-600">{formatPrice(toplam)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: Bilgi Kartları */}
                    <div className="space-y-6">

                        {/* Durum Kartı */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Sipariş Durumu</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Sipariş</span>
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(siparisDurumu)}`}>
                                        {getStatusText(siparisDurumu)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Ödeme</span>
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(odemeDurumu)}`}>
                                        {getStatusText(odemeDurumu)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Müşteri Bilgileri */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Müşteri Bilgileri</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{order.shipping?.adSoyad}</p>
                                        <p className="text-xs text-gray-500">Alıcı</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-700">{order.shipping?.telefon}</p>
                                        <p className="text-xs text-gray-500">İletişim</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-700">{order.shipping?.adres}</p>
                                        <p className="text-xs text-gray-500 uppercase mt-0.5">{order.shipping?.sehir}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ödeme Yöntemi */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Ödeme Yöntemi</h3>
                            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-indigo-600">
                                    {odemeYontemi === 'cod' ? <Package className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {odemeYontemi === 'card' ? 'Kredi Kartı' : odemeYontemi === 'cod' ? 'Kapıda Ödeme' : 'Havale / EFT'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {odemeDurumu === 'paid' ? 'Ödeme Alındı' : 'Ödeme Bekleniyor'}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}