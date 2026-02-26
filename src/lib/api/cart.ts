import { fetchJSON } from "@/lib/api/http";

export type CartItem = {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl?: string;
    qty: number;
    category?: string;
};

type CartResponse =
    | { ok: true; items: CartItem[]; total: number }
    | { ok: false; error: string };

export async function getCart(token: string): Promise<{ items: CartItem[]; total: number }> {
    const data = await fetchJSON<CartResponse>("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!data || data.ok !== true) {
        throw new Error((data as any)?.error || "Cart alınamadı");
    }

    return { items: data.items ?? [], total: Number(data.total ?? 0) };
}

export async function cartAdd(token: string, productId: string, qtyDelta = 1): Promise<void> {
    const data = await fetchJSON<{ ok: boolean; error?: string }>("/api/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qtyDelta }),
    });

    if (!data?.ok) throw new Error(data?.error || "Sepete eklenemedi");
}

export async function cartSetQty(token: string, productId: string, qty: number): Promise<void> {
    const data = await fetchJSON<{ ok: boolean; error?: string }>("/api/cart", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty }),
    });

    if (!data?.ok) throw new Error(data?.error || "Sepet güncellenemedi");
}

export async function cartRemove(token: string, productId: string): Promise<void> {
    const data = await fetchJSON<{ ok: boolean; error?: string }>(
        `/api/cart?productId=${encodeURIComponent(productId)}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    if (!data?.ok) throw new Error(data?.error || "Ürün silinemedi");
}

export async function cartClear(token: string): Promise<void> {
    const data = await fetchJSON<{ ok: boolean; error?: string }>(`/api/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.ok) throw new Error(data?.error || "Sepet temizlenemedi");
}