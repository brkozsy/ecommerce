import { fetchJSON } from "@/lib/api/http";
import type { Product } from "@/types/product";

type ProductsResponse =
    | { ok: true; items: Product[] }
    | { ok: false; error: string };

type ProductResponse =
    | { ok: true; item: Product }
    | { ok: false; error: string };

function getBaseUrl() {
    if (typeof window !== "undefined") return "";
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function getProducts(): Promise<Product[]> {
    const base = getBaseUrl();

    const data = await fetchJSON<ProductsResponse>(`${base}/api/products`, {
        cache: "no-store",
    });

    if (!("ok" in data) || data.ok !== true) return [];
    return data.items ?? [];
}

export async function getProduct(id: string): Promise<Product> {
    const base = getBaseUrl();

    const data = await fetchJSON<ProductResponse>(`${base}/api/products/${id}`, {
        cache: "no-store",
    });

    if (!("ok" in data) || data.ok !== true) {
        throw new Error((data as any)?.error || "Product not found");
    }

    return data.item;
}