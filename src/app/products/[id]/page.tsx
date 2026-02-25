"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import {
    ChevronRight,
    Home,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    AlertCircle,
    PackageX,
    Loader2
} from "lucide-react";

type ProductDTO = {
    id: string;
    title: string;
    price: number;
    stock?: number | string | null;
    imageUrl?: string | null;
    description?: string | null;
};

function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id;

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [p, setP] = useState<ProductDTO | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            if (!id) return;

            setLoading(true);
            setErr(null);

            try {
                const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                    cache: "no-store",
                });

                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error || `Ürün getirilemedi (${res.status})`);
                }

                if (alive) setP(data.item as ProductDTO);
            } catch (e: any) {
                if (alive) setErr(e?.message || "Bir hata oluştu");
            } finally {
                if (alive) setLoading(false);
            }
        }

        run();

        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-sm font-medium text-gray-500">Ürün detayları yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (err) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold text-red-900">Bir Hata Oluştu</h3>
                    <p className="mt-2 text-red-600">{err}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    if (!p) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
                    <PackageX className="h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-xl font-bold text-gray-900">Ürün Bulunamadı</h2>
                    <p className="mt-2 text-gray-500">Aradığınız ürün satıştan kaldırılmış veya link hatalı olabilir.</p>
                    <Link
                        href="/"
                        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                        Alışverişe Devam Et
                    </Link>
                </div>
            </div>
        );
    }

    const stock = toNumber(p.stock, 0);
    const inStock = stock > 0;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <Home className="h-4 w-4" />
                        <span>Ana Sayfa</span>
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/products" className="hover:text-indigo-600 transition-colors">
                        Ürünler
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium text-gray-900 line-clamp-1">{p.title}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

                    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="aspect-square w-full bg-gray-50/50 p-8 flex items-center justify-center">
                            {p.imageUrl ? (
                                <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <div className="h-20 w-20 rounded-full bg-gray-100"></div>
                                    <span>Görsel Yok</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">

                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {p.title}
                        </h1>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-current" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">(4.9/5 - 128 Değerlendirme)</span>
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                            <p className="text-4xl font-bold text-indigo-600">
                                {formatPrice(p.price)}
                            </p>

                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${inStock
                                ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                                }`}>
                                <div className={`h-2 w-2 rounded-full ${inStock ? "bg-green-600" : "bg-red-600"}`}></div>
                                {inStock ? `Stokta: ${stock} Adet` : "Stok Tükendi"}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Açıklama</h3>
                            <div className="prose prose-sm text-gray-600">
                                <p>{p.description?.trim() || "Bu ürün için henüz detaylı bir açıklama girilmemiştir."}</p>
                            </div>
                        </div>

                        <div className="my-8 border-t border-gray-100"></div>

                        <div className="space-y-6">
                            <AddToCartButton
                                product={{
                                    id: p.id,
                                    title: p.title,
                                    price: p.price,
                                    stock: stock,
                                    imageUrl: p.imageUrl ?? "",
                                    description: p.description ?? "",
                                }}
                            />

                            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Truck className="h-5 w-5 text-indigo-600" />
                                    <span>Aynı Gün Kargo</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    <span>2 Yıl Garanti</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <RotateCcw className="h-5 w-5 text-indigo-600" />
                                    <span>14 Gün İade</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}