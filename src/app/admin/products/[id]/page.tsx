"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<string>("0");
    const [stock, setStock] = useState<string>("0");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        (async () => {
            setMsg("");
            setLoading(true);
            try {
                const u = auth.currentUser;
                if (!u) throw new Error("LOGIN_REQUIRED");
                const token = await u.getIdToken();


                const res = await fetch("/api/admin/products", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const p = (data.items || []).find((x: any) => x.id === id);
                if (!p) throw new Error("Product not found");

                setTitle(p.title || "");
                setPrice(String(p.price ?? 0));
                setStock(String(p.stock ?? 0));
                setImageUrl(p.imageUrl || "");
                setDescription(p.description || "");
                setIsActive(p.isActive !== false);
            } catch (e: any) {
                setMsg(String(e?.message || e));
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (saving) return;
        setMsg("");
        setSaving(true);

        try {
            const u = auth.currentUser;
            if (!u) throw new Error("LOGIN_REQUIRED");
            const token = await u.getIdToken();

            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PATCH",
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

            setMsg("✅ Kaydedildi.");
            setTimeout(() => router.replace("/admin/products"), 300);
        } catch (e: any) {
            setMsg(String(e?.message || e));
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="max-w-xl space-y-4">
            <h2 className="text-lg font-semibold">Edit Product</h2>

            <form onSubmit={onSave} className="space-y-3 rounded-xl border p-4">
                <input className="w-full rounded-lg border p-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
                <input className="w-full rounded-lg border p-3" placeholder="Image URL (şimdilik)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <textarea className="w-full rounded-lg border p-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active
                </label>

                <button disabled={saving} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60">
                    {saving ? "..." : "Save"}
                </button>
            </form>

            {msg ? <p className="text-sm">{msg}</p> : null}
        </div>
    );
}
