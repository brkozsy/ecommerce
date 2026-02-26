"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { auth } from "@/lib/firebase/client";
import { cartAdd, getCart } from "@/lib/api/cart";
import { Loader2, CheckCircle2, ShoppingCart } from "lucide-react";

type ProductLike = {
    id: string;
    title: string;
    price: number;
    stock?: number | string | null;
    imageUrl?: string | null;
    description?: string | null;
};

// Ürün sayfası artık miktar (quantity) prop'unu gönderiyor
interface AddToCartButtonProps {
    product: ProductLike;
    quantity?: number; // Opsiyonel, varsayılan 1 olacak
}

function toNumber(v: any, fallback = 0) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("Sepete eklemek için giriş yapmalısınız.");
    return await u.getIdToken();
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
    const stock = toNumber(product.stock, 0);
    const canAdd = stock > 0;
    const [added, setAdded] = useState(false);

    const { data: cart } = useSWR(
        auth.currentUser ? "cart" : null,
        async () => {
            const token = await tokenOrThrow();
            return await getCart(token);
        },
        { revalidateOnFocus: false }
    );

    const inCart = useMemo(() => {
        const items = cart?.items ?? [];
        return items.some((x) => x.id === product.id);
    }, [cart?.items, product.id]);

    useEffect(() => {
        if (!added) return;
        const t = window.setTimeout(() => setAdded(false), 2000);
        return () => window.clearTimeout(t);
    }, [added]);

    // API'ye seçilen miktarı (quantity) gönderiyoruz
    const { trigger, isMutating } = useSWRMutation(
        "cart",
        async () => {
            const token = await tokenOrThrow();
            // Sabit 1 yerine seçilen quantity değerini gönderiyoruz
            await cartAdd(token, product.id, quantity);
            return true;
        },
        {
            onSuccess: async () => {
                await mutate("cart");
                setAdded(true);
            },
            onError: (err) => {
                alert(err?.message || "Sepete eklenirken bir hata oluştu.");
            }
        }
    );

    async function onAdd() {
        if (!canAdd || isMutating) return;
        await trigger();
    }

    // Durum mesajları
    const getButtonContent = () => {
        if (isMutating) return (
            <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Ekleniyor...</span>
            </div>
        );

        if (!canAdd) return "Stokta Yok";

        if (added) return (
            <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{quantity} Adet Eklendi</span>
            </div>
        );

        return (
            <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>{inCart ? `${quantity} Adet Daha Ekle` : "Sepete Ekle"}</span>
            </div>
        );
    };

    return (
        <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd || isMutating}
            className={`
                w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg
                ${!canAdd ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none" :
                    added ? "bg-emerald-600 text-white scale-[0.98] shadow-emerald-200" :
                        "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] shadow-orange-200"}
            `}
        >
            {getButtonContent()}
        </button>
    );
}