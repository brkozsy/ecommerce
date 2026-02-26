"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { getProduct } from "@/lib/api/products";
import type { Product } from "@/types/product";
import {
    ChevronRight,
    Home,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    AlertCircle,
    PackageX,
    Loader2,
    Minus,
    Plus,
    Check
} from "lucide-react";

// --- YARDIMCI TİPLER ---
type ProductDTO = Product & {
    stock?: number | string | null;
    imageUrl?: string | null;
    description?: string | null;
    category?: string | null;
};

// --- YARDIMCI FONKSİYONLAR ---
function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
    }).format(price);
};

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const [quantity, setQuantity] = useState(1);

    const {
        data: product,
        isLoading,
        error,
    } = useSWR<ProductDTO>(
        id ? `product:${id}` : null,
        () => getProduct(String(id))
    );

    // Stok Hesaplamaları
    const stock = product ? toNumber((product as any).stock, 0) : 0;
    const inStock = stock > 0;

    const handleQuantityChange = (type: "inc" | "dec") => {
        if (type === "inc" && quantity < stock) setQuantity((prev) => prev + 1);
        if (type === "dec" && quantity > 1) setQuantity((prev) => prev - 1);
    };

    // Yükleniyor Ekranı (Sadeleştirilmiş)
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    // Hata Ekranı (Sadeleştirilmiş)
    if (error || !product) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-xl p-8 border border-gray-200 text-center">
                    <PackageX className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h1>
                    <p className="text-gray-500 text-sm mb-6">Aradığınız ürün mevcut değil veya yayından kaldırılmış.</p>
                    <Link href="/home" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors">
                        Mağazaya Dön
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pb-24">
            {/* Breadcrumb - İnce ve Sade */}
            <div className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Link href="/home" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
                            <Home className="h-3.5 w-3.5" />
                            Ana Sayfa
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">
                            {product.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 items-start">

                    {/* SOL: Ürün Görseli */}
                    <div className="lg:col-span-7">
                        <div className="aspect-square w-full rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-center p-8 relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="h-full w-full object-contain mix-blend-multiply"
                                />
                            ) : (
                                <PackageX className="h-24 w-24 text-gray-300" />
                            )}
                        </div>
                    </div>

                    {/* SAĞ: Ürün Detayları */}
                    <div className="lg:col-span-5 mt-10 lg:mt-0 space-y-8">
                        {/* Başlık ve Kategori */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-indigo-600">
                                    {product.category || "Genel"}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium text-gray-900">4.8</span>
                                    <span>(128)</span>
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                                {product.title}
                            </h1>

                            <div className="flex items-end gap-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatPrice(Number(product.price || 0))}
                                </span>
                            </div>

                            {/* Stok Durumu */}
                            <div className="mt-3">
                                {inStock ? (
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                        <Check className="h-4 w-4" />
                                        Stokta var ({stock} adet)
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        Tükendi
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aksiyon Alanı (Sepete Ekle & Adet) */}
                        <div className="border-y border-gray-100 py-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Adet
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                {/* Adet Seçici */}
                                <div className="flex items-center justify-between border border-gray-300 rounded-lg bg-white h-12 sm:w-32">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange("dec")}
                                        disabled={quantity <= 1}
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="flex-1 text-center font-semibold text-gray-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange("inc")}
                                        disabled={quantity >= stock}
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Buton Konteyneri */}
                                <div className="flex-1">
                                    <AddToCartButton
                                        product={{
                                            id: String((product as any).id),
                                            title: String(product.title),
                                            price: Number(product.price || 0),
                                            imageUrl: (product as any).imageUrl ?? null,
                                            stock: stock,
                                        }}
                                        quantity={quantity}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Özellikler İkonları */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Truck, title: "Ücretsiz Kargo" },
                                { icon: ShieldCheck, title: "2 Yıl Garanti" },
                                { icon: RotateCcw, title: "14 Gün İade" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl text-center">
                                    <item.icon className="h-5 w-5 text-gray-600 mb-2" />
                                    <span className="text-xs font-medium text-gray-900">{item.title}</span>
                                </div>
                            ))}
                        </div>

                        {/* Açıklama */}
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-3">Ürün Açıklaması</h3>
                            <div className="prose prose-sm text-gray-600 max-w-none">
                                <p>
                                    {product.description || "Bu ürün için henüz detaylı açıklama girilmemiştir."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}