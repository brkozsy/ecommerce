"use client";

import Link from "next/link";
import useSWR from "swr";
import { auth } from "@/lib/firebase/client";

async function authedJson(url: string) {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    const token = await u.getIdToken();

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
        try {
            const j = text ? JSON.parse(text) : null;
            if (j?.error) throw new Error(j.error);
        } catch { }
        if (res.status === 401) throw new Error("UNAUTHENTICATED");
        if (res.status === 403) throw new Error("FORBIDDEN");
        throw new Error(text || `Request failed (${res.status})`);
    }
    return text ? JSON.parse(text) : null;
}

export default function AdminProductsPage() {
    const { data, error, isLoading, mutate } = useSWR("/api/admin/products", authedJson);
    const items = data?.items || [];

    async function onDelete(id: string) {
        if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
        const u = auth.currentUser;
        if (!u) return alert("Login olmalısın");
        const token = await u.getIdToken();

        const res = await fetch(`/api/admin/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const t = await res.text().catch(() => "");
            return alert(t || "Silme başarısız");
        }

        mutate(); // refresh list
    }

    if (isLoading) return <div>Yükleniyor...</div>;
    if (error) {
        const msg = String((error as any)?.message || error);
        if (msg.includes("LOGIN_REQUIRED") || msg.includes("UNAUTHENTICATED")) return <div>Admin için giriş yapmalısın.</div>;
        if (msg.includes("FORBIDDEN")) return <div>Yetkin yok (admin değilsin).</div>;
        return <div className="text-red-600">Hata: {msg}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Products</h2>
                <Link className="rounded-lg border px-3 py-1 text-sm" href="/admin/products/new">
                    + New
                </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-black/5 dark:bg-white/5">
                        <tr>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Price</th>
                            <th className="p-3 text-left">Stock</th>
                            <th className="p-3 text-left">Active</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p: any) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-3">{p.title}</td>
                                <td className="p-3">{p.price}</td>
                                <td className="p-3">{p.stock ?? 0}</td>
                                <td className="p-3">{p.isActive ? "Yes" : "No"}</td>
                                <td className="p-3 text-right space-x-2">
                                    <Link className="underline" href={`/admin/products/${p.id}`}>Edit</Link>
                                    <button className="underline text-red-600" onClick={() => onDelete(p.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!items.length ? (
                            <tr>
                                <td className="p-6 text-center opacity-70" colSpan={5}>
                                    Ürün yok.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => mutate()}>
                Refresh
            </button>
        </div>
    );
}
