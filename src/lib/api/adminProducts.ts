import { fetchJSON } from "@/lib/api/http";
import { auth } from "@/lib/firebase/client";

export type AdminProduct = {
    id: string;
    title: string;
    category?: string | null;
    price?: number;
    stock?: number;
    imageUrl?: string | null;
    description?: string | null;
    isActive?: boolean;
};

type AdminProductsResponse =
    | { ok: true; items: AdminProduct[] }
    | { ok: false; error: string };

type AdminProductResponse =
    | { ok: true; item: AdminProduct }
    | { ok: false; error: string };

type AdminCreateResponse =
    | { ok: true; item: AdminProduct }
    | { ok: true; id: string }
    | { ok: false; error: string };

function getBaseUrl() {
    if (typeof window !== "undefined") return "";
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

async function getIdTokenOrThrow() {
    const waitUser = () =>
        new Promise<NonNullable<typeof auth.currentUser>>((resolve, reject) => {
            const unsub = auth.onAuthStateChanged(
                (user) => {
                    unsub();
                    if (!user) reject(new Error("LOGIN_REQUIRED"));
                    else resolve(user);
                },
                (err) => {
                    unsub();
                    reject(err);
                }
            );
        });

    const u = auth.currentUser ?? (await waitUser());
    return await u.getIdToken();
}

export async function adminListProducts(): Promise<AdminProduct[]> {
    const base = getBaseUrl();
    const token = await getIdTokenOrThrow();

    const data = await fetchJSON<AdminProductsResponse>(`${base}/api/admin/products`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!("ok" in data) || data.ok !== true) return [];
    return data.items ?? [];
}

export async function adminGetProduct(id: string): Promise<AdminProduct> {
    const base = getBaseUrl();
    const token = await getIdTokenOrThrow();

    const data = await fetchJSON<AdminProductResponse>(`${base}/api/admin/products/${id}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!("ok" in data) || data.ok !== true) {
        throw new Error((data as any)?.error || "Product not found");
    }

    return data.item;
}

export async function adminCreateProduct(payload: Partial<AdminProduct>): Promise<void> {
    const base = getBaseUrl();
    const token = await getIdTokenOrThrow();

    const data = await fetchJSON<AdminCreateResponse>(`${base}/api/admin/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    if (!("ok" in data) || data.ok !== true) {
        throw new Error((data as any)?.error || "Create failed");
    }
}

export async function adminUpdateProduct(id: string, patch: Partial<AdminProduct>): Promise<void> {
    const base = getBaseUrl();
    const token = await getIdTokenOrThrow();

    const res = await fetch(`${base}/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Update failed (${res.status})`);
    }
}

export async function adminDeleteProduct(id: string): Promise<void> {
    const base = getBaseUrl();
    const token = await getIdTokenOrThrow();

    const res = await fetch(`${base}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Delete failed (${res.status})`);
    }
}