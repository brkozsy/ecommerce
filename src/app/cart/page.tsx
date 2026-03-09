"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { AlertCircle, } from "lucide-react";
import { cartRemove, cartSetQty, getCart } from "@/lib/api/cart";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    ArrowLeft,
    LogIn,
    Loader2,
    ShieldCheck,
    CreditCard,
    PackageX
} from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken();
}

export default function CartPage() {
    const router = useRouter();
    const user = useAuthStore((s: any) => s.user);

    const { data, isLoading, error } = useSWR(
        user ? "cart" : null,
        async () => {
            const token = await tokenOrThrow();
            return await getCart(token);
        },
        { revalidateOnFocus: false }
    );

    const items = data?.items ?? [];
    const total = useMemo(
        () => data?.total ?? items.reduce((s: any, i: any) => s + i.price * i.qty, 0),
        [data?.total, items]
    );

    const [actionErr, setActionErr] = useState<string | null>(null);

    const { trigger: setQty, isMutating: qtyMutating } = useSWRMutation(
        "cart",
        async (_key, { arg }: { arg: { productId: string; qty: number } }) => {
            const token = await tokenOrThrow();
            await cartSetQty(token, arg.productId, arg.qty);
            await mutate("cart");
            return true;
        }
    );

    const { trigger: removeItem, isMutating: removeMutating } = useSWRMutation(
        "cart",
        async (_key, { arg }: { arg: { productId: string } }) => {
            const token = await tokenOrThrow();
            await cartRemove(token, arg.productId);
            await mutate("cart");
            return true;
        }
    );

    const busy = isLoading || qtyMutating || removeMutating;

    const handleCheckout = () => {
        if (user) router.push("/checkout");
        else router.push("/login?next=/checkout");
    };

    // 1. DURUM: GİRİŞ YAPILMAMIŞ
    if (!user) {
        return (
            <main className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-gray-100 shadow-xl shadow-gray-200/40 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                        <LogIn className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapmanız Gerekiyor</h1>
                    <p className="text-gray-500 text-sm mb-8">Alışveriş sepetinizi görüntülemek ve sipariş vermek için lütfen hesabınıza giriş yapın.</p>
                    <button
                        onClick={() => router.push("/login?next=/cart")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 text-sm font-bold text-white hover:bg-black transition-colors"
                    >
                        Giriş Yap <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </main>
        );
    }

    // YÜKLENİYOR DURUMU
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <span className="text-sm font-semibold text-gray-500 animate-pulse">Sepetiniz hazırlanıyor...</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFAFB] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Sayfa Başlığı */}
                <div className="mb-8 flex items-baseline justify-between border-b border-gray-200 pb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Alışveriş Sepetim</h1>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {items.length} Ürün
                    </span>
                </div>

                {/* HATA DURUMU */}
                {error ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-800 font-semibold">Sepet bilgileri alınamadı.</p>
                        <p className="mt-1 text-sm text-red-600/80">{String((error as any)?.message || error)}</p>
                    </div>
                )

                    /* BOŞ SEPET DURUMU */
                    : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-gray-100 p-16 text-center shadow-sm">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50/50">
                                <ShoppingBag className="h-10 w-10 text-indigo-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz şu an boş</h2>
                            <p className="text-gray-500 max-w-sm mb-8">Sepetinizde ürün bulunmamaktadır. İhtiyacınız olan ürünleri bulmak için hemen alışverişe başlayın.</p>
                            <button
                                onClick={() => router.push("/home")}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Alışverişe Başla
                            </button>
                        </div>
                    )

                        /* DOLU SEPET DURUMU */
                        : (
                            <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">

                                {/* SOL KOLON: ÜRÜN LİSTESİ */}
                                <div className="lg:col-span-8">
                                    {actionErr && (
                                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                                            {actionErr}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                                            >
                                                {/* Ürün Görseli */}
                                                <div className="h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 relative">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-contain p-2 mix-blend-multiply" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <PackageX className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Ürün Detayları ve Kontroller */}
                                                <div className="flex flex-1 flex-col justify-between">

                                                    {/* Üst Kısım: Başlık ve Sil Butonu */}
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                                                                {item.title}
                                                            </h3>
                                                            <p className="mt-1 text-sm font-medium text-indigo-600">
                                                                {formatPrice(item.price)} <span className="text-gray-400 text-xs font-normal">/ adet</span>
                                                            </p>
                                                            {Number(item.stock) <= 5 && (
                                                                <p className="mt-1 text-[11px] font-bold text-orange-500 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                                                    Son {item.stock} ürün!
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            disabled={busy}
                                                            onClick={async () => {
                                                                try {
                                                                    setActionErr(null);
                                                                    await removeItem({ productId: item.id });
                                                                } catch (e: any) {
                                                                    setActionErr(e.message);
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Ürünü sil"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    {/* Alt Kısım: Adet Seçici ve Toplam Fiyat */}
                                                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">

                                                        {/* Modern Adet Seçici */}
                                                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 h-10 w-28">
                                                            <button
                                                                disabled={busy || item.qty <= 1}
                                                                onClick={async () => {
                                                                    try {
                                                                        setActionErr(null);
                                                                        await setQty({ productId: item.id, qty: item.qty - 1 });
                                                                    } catch (e: any) { setActionErr(e.message); }
                                                                }}
                                                                className="flex-1 flex justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-8 text-center font-bold text-sm text-gray-900">
                                                                {item.qty}
                                                            </span>
                                                            <button
                                                                disabled={busy || item.qty >= Number(item.stock ?? 0)}
                                                                onClick={async () => {
                                                                    try {
                                                                        setActionErr(null);
                                                                        await setQty({ productId: item.id, qty: item.qty + 1 });
                                                                    } catch (e: any) { setActionErr(e.message); }
                                                                }}
                                                                className="flex-1 flex justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        {/* Ürün Toplam Fiyatı */}
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-gray-900">
                                                                {formatPrice(item.price * item.qty)}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SAĞ KOLON: SİPARİŞ ÖZETİ */}
                                <div className="lg:col-span-4 mt-8 lg:mt-0">
                                    <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/30">
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

                                        <div className="space-y-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-6">
                                            <div className="flex justify-between items-center">
                                                <span>Ara Toplam</span>
                                                <span className="text-gray-900">{formatPrice(total)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Kargo Ücreti</span>
                                                <span className="text-emerald-600 font-bold">Ücretsiz</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-6">
                                            <span className="text-base font-bold text-gray-900">Genel Toplam</span>
                                            <span className="text-3xl font-black text-indigo-600">{formatPrice(total)}</span>
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            disabled={busy}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200"
                                        >
                                            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ödemeye Geç"}
                                            {!busy && <ArrowRight className="h-5 w-5" />}
                                        </button>

                                        <button
                                            onClick={() => router.push("/home")}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Alışverişe Devam Et
                                        </button>

                                        {/* Güven Rozetleri */}
                                        <div className="mt-8 flex items-center justify-center gap-4 text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Güvenli</span>
                                            </div>
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            <div className="flex items-center gap-1.5">
                                                <CreditCard className="h-4 w-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Taksit İmkanı</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
            </div>
        </main>
    );
}