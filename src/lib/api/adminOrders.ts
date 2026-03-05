import { fetchJSON } from "@/lib/api/http";

type AdminOrdersResponse = { ok: true; items: any[] } | { ok: false; error: string };

export async function adminListOrders(token: string) {
    const data = await fetchJSON<AdminOrdersResponse>("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!data || data.ok !== true) throw new Error((data as any)?.error || "Siparişler alınamadı");
    return data.items ?? [];
}