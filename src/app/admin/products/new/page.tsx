"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth } from "@/lib/firebase/client";
import {
    PackagePlus,
    Image as ImageIcon,
    Tag,
    Box,
    Type,
    FileText,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

// Yup Doğrulama Şeması
const productSchema = yup.object().shape({
    title: yup
        .string()
        .required("Başlık alanı zorunludur")
        .min(3, "Başlık en az 3 karakter olmalıdır"),
    price: yup
        .number()
        .typeError("Geçerli bir sayı giriniz")
        .required("Fiyat zorunludur")
        .positive("Fiyat 0'dan büyük olmalıdır"),
    stock: yup
        .number()
        .typeError("Geçerli bir sayı giriniz")
        .required("Stok zorunludur")
        .min(0, "Stok negatif olamaz"),
    imageUrl: yup
        .string()
        .url("Geçerli bir URL giriniz")
        .nullable()
        .transform((value) => (value === "" ? null : value)),
    description: yup
        .string()
        .required("Açıklama zorunludur")
        .min(10, "Açıklama en az 10 karakter olmalıdır"),
    isActive: yup.boolean().default(true),
});

type ProductFormValues = yup.InferType<typeof productSchema>;

export default function NewProductPage() {
    const router = useRouter();
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: yupResolver(productSchema),
        defaultValues: {
            isActive: true,
            price: 0,
            stock: 0,
            imageUrl: ""
        }
    });

    const watchedImageUrl = watch("imageUrl");

    async function onSubmit(data: ProductFormValues) {
        setLoading(true);
        setStatus(null);

        try {
            const u = auth.currentUser;
            if (!u) throw new Error("Oturum açmanız gerekiyor.");
            const token = await u.getIdToken();

            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Ürün oluşturulurken sunucu hatası oluştu.");

            setStatus({ type: 'success', text: "Ürün başarıyla oluşturuldu! Yönlendiriliyorsunuz..." });
            setTimeout(() => router.replace("/admin/products"), 1500);
        } catch (e: any) {
            setStatus({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-4xl pb-20">
            {/* Navigasyon & Başlık */}
            <div className="mb-10">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Ürün Listesine Geri Dön
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <PackagePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Yeni Ürün Ekle</h1>
                        <p className="text-gray-500">Envanterinize yeni bir teknolojik ürün ekleyin.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">

                {/* Sol Taraf: Form Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <FileText className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-800">Ürün Detayları</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Başlığı</label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            {...register("title")}
                                            className={`w-full rounded-2xl border ${errors.title ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/30'} py-3.5 pl-12 pr-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none`}
                                            placeholder="Örn: Kablosuz Oyuncu Mouse"
                                        />
                                    </div>
                                    {errors.title && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                                    <textarea
                                        {...register("description")}
                                        rows={6}
                                        className={`w-full rounded-2xl border ${errors.description ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/30'} p-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none`}
                                        placeholder="Ürünün teknik özelliklerini ve avantajlarını detaylandırın..."
                                    />
                                    {errors.description && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.description.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className={`flex items-center gap-3 rounded-2xl p-5 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                            } animate-in fade-in slide-in-from-top-4 duration-300`}>
                            {status.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            <span className="font-semibold">{status.text}</span>
                        </div>
                    )}
                </div>

                {/* Sağ Taraf: Fiyat, Stok ve Önizleme */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Tag className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-800">Fiyat & Stok</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fiyat (₺)</label>
                                    <input
                                        type="number"
                                        {...register("price")}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                    {errors.price && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{errors.price.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Stok</label>
                                    <input
                                        type="number"
                                        {...register("stock")}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                    {errors.stock && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{errors.stock.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Görsel URL</label>
                                <input
                                    {...register("imageUrl")}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="https://images.com/..."
                                />
                            </div>

                            {/* Önizleme Kartı */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-indigo-200">
                                {watchedImageUrl ? (
                                    <img
                                        src={watchedImageUrl}
                                        alt="Önizleme"
                                        className="h-full w-full object-cover animate-in zoom-in-95 duration-500"
                                        onError={(e) => (e.currentTarget.src = "")}
                                    />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-gray-300">
                                        <ImageIcon className="h-10 w-10 opacity-20 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Görsel Bekleniyor</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm font-bold text-gray-700">Satışa Hazır</span>
                                    <input
                                        type="checkbox"
                                        {...register("isActive")}
                                        className="h-5 w-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-indigo-600 p-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Ürünü Kaydet</span>
                                <PackagePlus className="h-5 w-5 transition-transform group-hover:rotate-12" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}