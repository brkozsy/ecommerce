"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    ArrowLeft,
    LogIn
} from "lucide-react";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.remove);
    const increaseQty = useCartStore((s) => s.inc);
    const decreaseQty = useCartStore((s) => s.dec);

    const user = useAuthStore((s: any) => s.user);

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const handleCheckout = () => {
        if (user) {
            router.push("/checkout");
        } else {
            router.push("/login?next=/checkout");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Alışveriş Sepeti</h1>
                    <span className="text-sm font-medium text-gray-500">
                        {items.length} Ürün
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <ShoppingBag className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Sepetiniz şu an boş</h2>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Alışverişe Başla
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                                    >
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                    <ShoppingBag className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                                            <div className="flex-1 pr-4">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">Birim Fiyat: {formatPrice(item.price)}</p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-6 sm:mt-0">
                                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                                                    <button
                                                        onClick={() => decreaseQty(item.id)}
                                                        className="p-2 text-gray-500 hover:text-indigo-600"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-900">{item.qty}</span>
                                                    <button
                                                        onClick={() => increaseQty(item.id)}
                                                        className="p-2 text-gray-500 hover:text-indigo-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</div>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Özet Paneli */}
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
                                    <button
                                        onClick={handleCheckout}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700"
                                    >
                                        {user ? (
                                            <>Siparişi Tamamla <ArrowRight className="h-5 w-5" /></>
                                        ) : (
                                            <>Giriş Yap ve Tamamla <LogIn className="h-5 w-5" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}