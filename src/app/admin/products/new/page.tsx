"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

export default function NewProductPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<string>("0");
    const [stock, setStock] = useState<string>("0");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setMsg("");
        setLoading(true);

        try {
            const u = auth.currentUser;
            if (!u) throw new Error("LOGIN_REQUIRED");
            const token = await u.getIdToken();

            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    price: Number(price),
                    stock: Number(stock),
                    imageUrl: imageUrl || null,
                    description: description || null,
                    isActive,
                }),
            });

            const text = await res.text().catch(() => "");
            if (!res.ok) throw new Error(text || `Request failed (${res.status})`);

            setMsg("✅ Ürün eklendi. Yönlendiriliyor...");
            setTimeout(() => router.replace("/admin/products"), 200);
        } catch (e: any) {
            setMsg(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl space-y-4">
            <h2 className="text-lg font-semibold">New Product</h2>

            <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4">
                <input className="w-full rounded-lg border p-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Image URL (şimdilik)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <textarea className="w-full rounded-lg border p-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active
                </label>

                <button disabled={loading} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60">
                    {loading ? "..." : "Create"}
                </button>
            </form>

            {msg ? <p className="text-sm">{msg}</p> : null}
        </div>
    );
}
