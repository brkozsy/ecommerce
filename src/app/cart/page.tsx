"use client";

import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useCartStore } from "@/store/cartStore"; // <-- sende farklıysa düzelt

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const clear = useCartStore((s) => s.clear);

    async function handleCheckout() {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            router.push("/login");
            return;
        }

        const idToken = await user.getIdToken(true);

        const payloadItems = items.map((i: any) => ({
            id: i.id ?? i.slug,
            title: i.title ?? i.name,
            price: Number(i.price),
            qty: Number(i.quantity ?? 1),
        }));

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, items: payloadItems }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Checkout failed");

        clear();
        router.push(`/orders/${data.orderId}`);
    }

    return (
        <div>
            {/* senin mevcut cart UI'n burada kalabilir */}
            <button onClick={handleCheckout}>Checkout</button>
        </div>
    );
}
