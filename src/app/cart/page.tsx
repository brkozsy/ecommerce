"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore"; // ✅ Auth Store'u ekledik
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    ArrowLeft,
    LogIn
} from "lucide-react";

// Para birimi formatlayıcı
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};

export default function CartPage() {
    const router = useRouter();

    // Store verileri
    const items = useCartStore((s: any) => s.items ?? []);
    const removeItem = useCartStore((s: any) => s.removeItem ?? (() => { }));
    const updateQty = useCartStore((s: any) => s.updateQty ?? (() => { }));

    // ✅ Kullanıcı durumunu çekiyoruz
    const user = useAuthStore((s: any) => s.user);

    const total = items.reduce((sum: number, i: any) => sum + Number(i.price) * Number(i.qty ?? 1), 0);

    // ✅ Checkout Butonu Fonksiyonu
    const handleCheckout = () => {
        if (user) {
            // Kullanıcı giriş yapmışsa direkt checkout'a git
            router.push("/checkout");
        } else {
            // Giriş yapmamışsa Login'e git ama işlem bitince checkout'a geri dön (next parametresi)
            router.push("/login?next=/checkout");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Başlık */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Alışveriş Sepeti</h1>
                    <span className="text-sm font-medium text-gray-500">
                        {items.length} Ürün
                    </span>
                </div>

                {items.length === 0 ? (
                    /* BOŞ SEPET GÖRÜNÜMÜ */
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <ShoppingBag className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Sepetiniz şu an boş</h2>
                        <p className="mt-2 max-w-md text-gray-500">
                            Henüz sepetinize bir ürün eklemediniz. Fırsatları kaçırmamak için alışverişe başlayın.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Alışverişe Başla
                        </button>
                    </div>
                ) : (
                    /* DOLU SEPET GRID YAPISI */
                    <div className="grid gap-8 lg:grid-cols-12">

                        {/* SOL KOLON: Ürün Listesi */}
                        <div className="lg:col-span-8">
                            <div className="space-y-4">
                                {items.map((item: any) => {
                                    const qty = Number(item.qty ?? 1);
                                    const price = Number(item.price);

                                    return (
                                        <div
                                            key={item.id}
                                            className="group flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                                        >
                                            {/* Ürün Resmi */}
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                        <ShoppingBag className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ürün Bilgileri */}
                                            <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">Birim Fiyat: {formatPrice(price)}</p>
                                                </div>

                                                {/* Miktar ve Silme */}
                                                <div className="mt-4 flex items-center justify-between gap-6 sm:mt-0">

                                                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                                                        <button
                                                            onClick={() => updateQty(item.id, Math.max(1, qty - 1))}
                                                            className="p-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                                                            disabled={qty <= 1}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-900">{qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.id, qty + 1)}
                                                            className="p-2 text-gray-500 hover:text-indigo-600"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900">{formatPrice(price * qty)}</div>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                        title="Sepetten Sil"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SAĞ KOLON: Özet Paneli */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Sipariş Özeti</h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Ara Toplam</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Kargo</span>
                                        <span className="font-medium text-green-600">Ücretsiz</span>
                                    </div>

                                    <hr className="border-dashed border-gray-200" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-900">Toplam Tutar</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatPrice(total)}</span>
                                    </div>

                                    {/* ✅ GÜNCELLENMİŞ BUTON */}
                                    <button
                                        onClick={handleCheckout}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        {user ? (
                                            <>
                                                Siparişi Tamamla
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        ) : (
                                            <>
                                                Giriş Yap ve Tamamla
                                                <LogIn className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 bg-gray-50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                        <span>Güvenli Alışveriş Garantisi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}