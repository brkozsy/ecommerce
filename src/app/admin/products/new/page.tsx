"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { adminCreateProduct } from "@/lib/api/adminProducts";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import {
    PackagePlus,
    Image as ImageIcon,
    Tag,
    FileText,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Banknote,
    Boxes,
    Eye
} from "lucide-react";

type FormData = {
    title: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    description?: string | null;
    isActive: boolean;
};

const schema: yup.ObjectSchema<FormData> = yup.object({
    title: yup.string().required("Başlık zorunlu").min(2, "En az 2 karakter olmalıdır"),
    category: yup.string().required("Kategori seçimi zorunludur"),
    price: yup.number().typeError("Geçerli bir fiyat giriniz").required("Fiyat zorunlu").min(0, "Fiyat 0'dan küçük olamaz"),
    stock: yup.number().typeError("Geçerli bir stok giriniz").required("Stok zorunlu").min(0, "Stok 0'dan küçük olamaz"),
    imageUrl: yup.string().nullable().optional().trim(),
    description: yup.string().nullable().optional(),
    isActive: yup.boolean().default(true),
});

export default function NewProductPage() {
    const router = useRouter();
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            category: PRODUCT_CATEGORIES[0],
            price: 0,
            stock: 0,
            imageUrl: "",
            description: "",
            isActive: true,
        },
        mode: "onTouched",
    });

    const { trigger: createProduct, isMutating } = useSWRMutation(
        "admin-create-product",
        async (_key, { arg }: { arg: FormData }) => {
            await adminCreateProduct({
                title: arg.title,
                category: arg.category,
                price: Number(arg.price),
                stock: Number(arg.stock),
                imageUrl: arg.imageUrl || "",
                description: arg.description || "",
                isActive: !!arg.isActive,
            });
            return true;
        }
    );

    const busy = isSubmitting || isMutating;

    const onSubmit = async (data: FormData) => {
        setStatus(null);
        try {
            await createProduct(data);
            setStatus({ type: "success", text: "Ürün başarıyla oluşturuldu! Yönlendiriliyorsunuz..." });
            setTimeout(() => router.replace("/admin/products"), 1500);
        } catch (e: any) {
            setStatus({ type: "error", text: String(e?.message || e) });
        }
    };

    return (
        <main className="min-h-screen bg-[#F4F4F5] px-4 py-8 md:py-12">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/admin/products")}
                            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Ürünlere Dön
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Yeni Ürün Ekle</h1>
                        <p className="mt-1 text-sm text-gray-500">Kataloğunuza yeni bir ürün ekleyin ve detaylarını yapılandırın.</p>
                    </div>
                    <button
                        onClick={() => document.getElementById("submit-product")?.click()}
                        disabled={busy}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-black transition-all disabled:opacity-60"
                    >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                        {busy ? "Kaydediliyor..." : "Ürünü Kaydet"}
                    </button>
                </div>

                {/* Status Banners */}
                {status?.type === "success" && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">{status.text}</span>
                    </div>
                )}
                {status?.type === "error" && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">{status.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-8 items-start" noValidate>

                    <div className="lg:col-span-8 space-y-8">

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <FileText className="h-5 w-5 text-gray-400" /> Temel Bilgiler
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ürün Adı</label>
                                    <input
                                        {...register("title")}
                                        disabled={busy}
                                        placeholder="Örn: Apple iPhone 15 Pro Max 256GB"
                                        className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.title ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                    />
                                    {errors.title && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Açıklama</label>
                                    <textarea
                                        {...register("description")}
                                        disabled={busy}
                                        rows={5}
                                        placeholder="Ürünün özelliklerini, avantajlarını ve detaylarını buraya yazın..."
                                        className={`w-full resize-none rounded-xl border bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.description ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <ImageIcon className="h-5 w-5 text-gray-400" /> Medya
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Görsel URL (Bağlantı)</label>
                                <input
                                    {...register("imageUrl")}
                                    disabled={busy}
                                    placeholder="https://site.com/gorsel.jpg"
                                    className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.imageUrl ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                />
                                <p className="mt-2 text-xs text-gray-500">Ürünü temsil eden yüksek kaliteli bir görsel bağlantısı girin.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-8">

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-5">Satış & Envanter</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                        <Banknote className="h-4 w-4 text-gray-400" /> Fiyat (₺)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("price")}
                                        disabled={busy}
                                        placeholder="0.00"
                                        className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.price ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                    />
                                    {errors.price && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.price.message}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                        <Boxes className="h-4 w-4 text-gray-400" /> Stok Adedi
                                    </label>
                                    <input
                                        type="number"
                                        {...register("stock")}
                                        disabled={busy}
                                        placeholder="0"
                                        className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.stock ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                    />
                                    {errors.stock && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.stock.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-5">Kategori</h2>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                </label>
                                <select
                                    {...register("category")}
                                    disabled={busy}
                                    className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.category ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"}`}
                                >
                                    {PRODUCT_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.category.message}</p>}
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                                <Eye className="h-5 w-5 text-gray-400" /> Görünürlük
                            </h2>

                            <label className="relative flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100/50 transition-colors">
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Ürün Aktif</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Mağazada satışa açık olur.</span>
                                </div>
                                <div className="relative">

                                    <input type="checkbox" {...register("isActive")} disabled={busy} className="peer sr-only" />
                                    <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/30 peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-full peer-disabled:opacity-50 shadow-sm border border-gray-200"></div>
                                </div>
                            </label>
                        </div>

                        <button type="submit" id="submit-product" className="hidden" />

                    </div>
                </form>
            </div>
        </main>
    );
}