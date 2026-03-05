import { fetchJSON } from "@/lib/api/http";

type MetricsResponse =
    | {
        ok: true;
        metrics: {
            ordersCount: number;
            pendingCount: number;
            productsCount: number;
            revenue: number;
        };
    }
    | { ok: false; error: string };

export async function adminGetMetrics(token: string) {
    const data = await fetchJSON<MetricsResponse>("/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!data || data.ok !== true) throw new Error((data as any)?.error || "Metikler alınamadı");
    return data.metrics;
}