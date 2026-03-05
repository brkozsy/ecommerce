import { fetchJSON } from "@/lib/api/http";

export type OrderItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
    imageUrl?: string;
    category?: string;
};

export type Order = {
    id: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: number;
    shipping?: any;
    payment?: any;
};

type CreateOrderResponse = { ok: true; id: string } | { ok: false; error: string };
type OrdersResponse = { ok: true; items: Order[] } | { ok: false; error: string };
type OrderResponse = { ok: true; order: Order } | { ok: false; error: string };

export async function createOrderFromCart(
    token: string,
    payload: { shipping: any; payment: any }
): Promise<{ id: string }> {
    const data = await fetchJSON<CreateOrderResponse>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });

    if (!data || data.ok !== true) throw new Error((data as any)?.error || "Sipariş oluşturulamadı");
    return { id: data.id };
}

export async function getMyOrders(token: string): Promise<Order[]> {
    const data = await fetchJSON<OrdersResponse>("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!data || data.ok !== true) throw new Error((data as any)?.error || "Siparişler alınamadı");
    return data.items ?? [];
}

export async function getOrder(token: string, id: string) {
    const data = await fetchJSON<any>(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!data || data.ok !== true) throw new Error(data?.error || "Sipariş alınamadı");
    return data.order;
}