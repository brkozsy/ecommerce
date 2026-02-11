"use client";

import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useCartStore } from "@/store/cartStore";

import Container from "@/components/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);
    const clear = useCartStore((s) => s.clear);

    const total = items.reduce(
        (sum: number, i: any) =>
            sum + Number(i.price) * Number(i.quantity ?? 1),
        0
    );

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
        <main className="py-10">
            <Container>
                <h1 className="text-2xl font-semibold text-white">Your Cart</h1>

                {items.length === 0 ? (
                    <Card className="mt-6 p-8 text-center">
                        <p className="text-white/70">Your cart is empty.</p>
                        <Button
                            className="mt-4"
                            onClick={() => router.push("/")}
                        >
                            Go Shopping
                        </Button>
                    </Card>
                ) : (
                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                        {/* Left side - items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item: any) => (
                                <Card key={item.id} className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-white font-semibold">
                                                {item.title ?? item.name}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                Quantity: {item.quantity ?? 1}
                                            </p>
                                        </div>

                                        <div className="text-white font-semibold">
                                            {Number(item.price) *
                                                Number(item.quantity ?? 1)}{" "}
                                            ₺
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Right side - summary */}
                        <Card className="p-6 h-fit">
                            <h2 className="text-lg font-semibold text-white">
                                Order Summary
                            </h2>

                            <div className="mt-4 flex items-center justify-between text-white/80">
                                <span>Total</span>
                                <span className="text-white font-semibold">
                                    {total} ₺
                                </span>
                            </div>

                            <Button
                                className="mt-6 w-full"
                                onClick={handleCheckout}
                            >
                                Checkout
                            </Button>
                        </Card>
                    </div>
                )}
            </Container>
        </main>
    );
}
