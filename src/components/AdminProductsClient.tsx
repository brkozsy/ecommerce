"use client";

import useSWR from "swr";
import Link from "next/link";
import { adminDeleteProduct, adminListProducts } from "@/lib/api/adminProducts";
import { Loader2, Trash2, Pencil, Plus, AlertCircle, Search, Package } from "lucide-react";
import { useState } from "react";

export default function AdminProductsClient() {
    const { data, isLoading, error, mutate } = useSWR("admin-products", adminListProducts);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const items = Array.isArray(data) ? data : [];

    const filteredItems = items.filter((p: any) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function onDelete(id: string) {
        if (deletingId) return;
        if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
        setDeletingId(id);
        try {
            await adminDeleteProduct(id);
            await mutate();
        } catch (e: any) {
            alert("Hata: " + String(e?.message || e));
        } finally {
            setDeletingId(null);
        }
    }

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    if (error) return (
        <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100">
            <AlertCircle className="mx-auto text-red-500 mb-2" />
            <p className="text-red-700 font-bold">Veri Alınamadı</p>
            <p className="text-red-500 text-sm">Sunucu hatası (500) veya yetki sorunu.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    <Plus className="h-4 w-4" /> Yeni Ürün
                </Link>
            </div>

            {filteredItems.length === 0 ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-2rem border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <Package className="h-10 w-10 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Görüntülenecek ürün bulunamadı.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Ürün</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Fiyat</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{p.title}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.category}</td>
                                    <td className="px-6 py-4 font-bold">{p.price} ₺</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Pencil size={18} /></Link>
                                            <button onClick={() => onDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                {deletingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}