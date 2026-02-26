"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import {
    adminDeleteProduct,
    adminGetProduct,
    adminUpdateProduct,
    AdminProduct,
} from "@/lib/api/adminProducts";
import { AlertCircle, ArrowLeft, CheckCircle2, Image as ImageIcon, Loader2, Save, Trash2 } from "lucide-react";

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
    title: yup.string().required("Başlık zorunlu").min(2, "En az 2 karakter"),
    category: yup.string().required("Kategori zorunlu"),
    price: yup.number().typeError("Fiyat sayı olmalı").required("Fiyat zorunlu").min(0, "0'dan küçük olamaz"),
    stock: yup.number().typeError("Stok sayı olmalı").required("Stok zorunlu").min(0, "0'dan küçük olamaz"),
    imageUrl: yup.string().nullable().optional().trim(),
    description: yup.string().nullable().optional(),
    isActive: yup.boolean().default(true),
});

export default function AdminEditProductPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params?.id;

    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const { data: product, isLoading, error, mutate } = useSWR<AdminProduct>(
        id ? `admin-product-${id}` : null,
        async () => await adminGetProduct(String(id)),
        { revalidateOnFocus: false }
    );

    const defaultCategory = useMemo(() => PRODUCT_CATEGORIES[0], []);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            category: defaultCategory,
            price: 0,
            stock: 0,
            imageUrl: "",
            description: "",
            isActive: true,
        },
        mode: "onTouched",
    });

    // ürün gelince formu doldur
    useMemo(() => {
        if (!product) return;
        reset({
            title: String(product.title ?? ""),
            category: String(product.category ?? defaultCategory),
            price: Number(product.price ?? 0),
            stock: Number(product.stock ?? 0),
            imageUrl: product.imageUrl ?? "",
            description: product.description ?? "",
            isActive: Boolean(product.isActive ?? true),
        });
    }, [product, reset, defaultCategory]);

    const { trigger: saveProduct, isMutating: saving } = useSWRMutation(
        "admin-update-product",
        async (_key, { arg }: { arg: FormData }) => {
            await adminUpdateProduct(String(id), {
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

    const { trigger: delProduct, isMutating: deleting } = useSWRMutation(
        "admin-delete-product",
        async () => {
            await adminDeleteProduct(String(id));
            return true;
        }
    );

    const busy = isSubmitting || saving || deleting;

    const imageUrl = watch("imageUrl");

    const onSubmit = async (values: FormData) => {
        setStatus(null);
        try {
            await saveProduct(values);
            await mutate();
            setStatus({ type: "success", text: "Kaydedildi." });
        } catch (e: any) {
            setStatus({ type: "error", text: String(e?.message || e) });
        }
    };

    const onDelete = async () => {
        setStatus(null);
        const ok = window.confirm("Ürünü silmek istiyor musun?");
        if (!ok) return;
        try {
            await delProduct();
            router.replace("/admin/products");
        } catch (e: any) {
            setStatus({ type: "error", text: String(e?.message || e) });
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50/50 px-4 py-10">
                <div className="mx-auto max-w-4xl">
                    <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="ml-3 text-sm text-gray-600">Yükleniyor...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen bg-gray-50/50 px-4 py-10">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
                        <div className="flex items-start gap-2 text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5" />
                            <div>
                                <p className="font-semibold">Ürün yüklenemedi</p>
                                <p className="mt-1 text-sm text-gray-600">{String((error as any)?.message || error)}</p>
                            </div>
                        </div>
                        <Link href="/admin/products" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Ürünlere dön
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50 px-4 py-10">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
                        <p className="mt-1 text-sm text-gray-500 font-mono">{product.id}</p>
                    </div>

                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Geri
                    </Link>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                    {status?.type === "success" ? (
                        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                            <CheckCircle2 className="mt-0.5 h-5 w-5" />
                            <span>{status.text}</span>
                        </div>
                    ) : null}

                    {status?.type === "error" ? (
                        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5" />
                            <span>{status.text}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Başlık</label>
                                <input
                                    className={`mt-2 w-full rounded-2xl border bg-white py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? "border-red-200" : "border-gray-200"
                                        }`}
                                    {...register("title")}
                                    disabled={busy}
                                />
                                {errors.title?.message ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    className={`mt-2 w-full rounded-2xl border bg-white py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.category ? "border-red-200" : "border-gray-200"
                                        }`}
                                    {...register("category")}
                                    disabled={busy}
                                >
                                    {PRODUCT_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {errors.category?.message ? <p className="mt-1 text-xs text-red-600">{errors.category.message}</p> : null}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fiyat</label>
                                <input
                                    type="number"
                                    className={`mt-2 w-full rounded-2xl border bg-white py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? "border-red-200" : "border-gray-200"
                                        }`}
                                    {...register("price")}
                                    disabled={busy}
                                />
                                {errors.price?.message ? <p className="mt-1 text-xs text-red-600">{errors.price.message}</p> : null}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Stok</label>
                                <input
                                    type="number"
                                    className={`mt-2 w-full rounded-2xl border bg-white py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.stock ? "border-red-200" : "border-gray-200"
                                        }`}
                                    {...register("stock")}
                                    disabled={busy}
                                />
                                {errors.stock?.message ? <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p> : null}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Görsel URL</label>
                                <div className="relative mt-2">
                                    <ImageIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://..."
                                        {...register("imageUrl")}
                                        disabled={busy}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <div className="text-sm font-semibold text-gray-900">Önizleme</div>
                                <div className="mt-3 h-32 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Görsel yok</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Açıklama</label>
                            <textarea
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={5}
                                {...register("description")}
                                disabled={busy}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="h-4 w-4" {...register("isActive")} disabled={busy} />
                            Ürün aktif
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                            <button
                                type="submit"
                                disabled={busy || !isDirty}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-60"
                            >
                                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Kaydet
                            </button>

                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                            >
                                <Trash2 className="h-5 w-5" />
                                Ürünü Sil
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}