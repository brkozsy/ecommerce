"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import type { User } from "firebase/auth";

import Container from "@/components/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { useCartStore } from "@/store/cartStore";

type Shipping = {
    adSoyad: string;
    telefon: string;
    sehir: string;
    adres: string;
    odemeYontemi: "card" | "cod" | "transfer";
};

async function waitForUser(auth: ReturnType<typeof getAuth>) {
    if (auth.currentUser) return auth.currentUser;

    return await new Promise<User | null>((resolve) => {
        let unsub: (() => void) | null = null;
        unsub = auth.onAuthStateChanged((u) => {
            if (unsub) unsub();
            resolve(u);
        });
    });
}

export default function CheckoutPage() {
    const router = useRouter();

    const cartItems = useCartStore((s: any) => s.items ?? s.cart ?? []);
    const clearCart = useCartStore((s: any) => s.clear ?? s.clearCart ?? (() => { }));

    const total = useMemo(() => {
        return (cartItems ?? []).reduce(
            (sum: number, it: any) => sum + Number(it.price ?? 0) * Number(it.qty ?? 1),
            0
        );
    }, [cartItems]);

    const [shipping, setShipping] = useState<Shipping>({
        adSoyad: "",
        telefon: "",
        sehir: "",
        adres: "",
        odemeYontemi: "card",
    });

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string>("");

    async function submitOrder() {
        try {
            setMsg("");

            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                setMsg("Sepet boş. Önce ürün ekle.");
                return;
            }

            // basit validasyon
            if (!shipping.adSoyad.trim() || !shipping.telefon.trim() || !shipping.sehir.trim() || !shipping.adres.trim()) {
                setMsg("Lütfen teslimat bilgilerini doldur.");
                return;
            }

            setBusy(true);

            const user = await waitForUser(auth);

            if (!user) {
                // login yoksa
                router.replace("/login");
                return;
            }

            const token = await user.getIdToken(true);

            const payload = {
                items: cartItems.map((it: any) => ({
                    id: String(it.id ?? it.productId ?? ""),
                    title: String(it.title ?? it.name ?? ""),
                    price: Number(it.price ?? 0),
                    qty: Number(it.qty ?? 1),
                })),
                total: Number(total),
                shipping: {
                    adSoyad: shipping.adSoyad,
                    telefon: shipping.telefon,
                    sehir: shipping.sehir,
                    adres: shipping.adres,
                    odemeYontemi: shipping.odemeYontemi,
                },
                payment: {
                    method: shipping.odemeYontemi,
                    status: "pending",
                },
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let json: any = null;
            try {
                json = JSON.parse(text);
            } catch {
            }

            if (!res.ok || !json?.ok) {
                throw new Error(json?.error ?? text ?? "Sipariş oluşturulamadı.");
            }

            try {
                clearCart();
            } catch { }

            router.push(`/orders/${json.id}`);
        } catch (e: any) {
            setMsg(e?.message ?? "Bilinmeyen hata");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="py-10">
            <Container>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sol: Form */}
                    <Card className="p-6 lg:col-span-2">
                        <h1 className="text-xl font-semibold text-white">Checkout</h1>
                        <p className="mt-1 text-sm text-white/60">Teslimat ve ödeme bilgilerini gir.</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="text-sm text-white/70">Ad Soyad</label>
                                <Input
                                    value={shipping.adSoyad}
                                    onChange={(e) => setShipping((s) => ({ ...s, adSoyad: e.target.value }))}
                                    placeholder="Burak Özsoy"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Telefon</label>
                                <Input
                                    value={shipping.telefon}
                                    onChange={(e) => setShipping((s) => ({ ...s, telefon: e.target.value }))}
                                    placeholder="05xx..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Şehir</label>
                                <Input
                                    value={shipping.sehir}
                                    onChange={(e) => setShipping((s) => ({ ...s, sehir: e.target.value }))}
                                    placeholder="Konya"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm text-white/70">Adres</label>
                                <Input
                                    value={shipping.adres}
                                    onChange={(e) => setShipping((s) => ({ ...s, adres: e.target.value }))}
                                    placeholder="Mahalle / sokak / no..."
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm text-white/70">Ödeme Yöntemi</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant={shipping.odemeYontemi === "card" ? "primary" : "secondary"}
                                        onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "card" }))}
                                    >
                                        Kart
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={shipping.odemeYontemi === "cod" ? "primary" : "secondary"}
                                        onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "cod" }))}
                                    >
                                        Kapıda Ödeme
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={shipping.odemeYontemi === "transfer" ? "primary" : "secondary"}
                                        onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "transfer" }))}
                                    >
                                        Havale
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {msg ? <p className="mt-4 text-sm text-red-400">{msg}</p> : null}

                        <div className="mt-6 flex gap-2">
                            <Button onClick={() => router.push("/cart")} variant="secondary" disabled={busy}>
                                Sepete Dön
                            </Button>
                            <Button onClick={submitOrder} disabled={busy}>
                                {busy ? "Gönderiliyor..." : "Siparişi Tamamla"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-white">Özet</h2>
                        <div className="mt-4 space-y-2">
                            {(cartItems ?? []).map((it: any, idx: number) => (
                                <div key={`${it.id ?? it.productId ?? idx}`} className="flex justify-between text-sm text-white/80">
                                    <span className="max-w-[70%] truncate">
                                        {it.title ?? it.name ?? "Ürün"} × {it.qty ?? 1}
                                    </span>
                                    <span>{Number(it.price ?? 0) * Number(it.qty ?? 1)} ₺</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                            <span className="text-white/70">Toplam</span>
                            <span className="text-lg font-semibold text-white">{Number(total).toFixed(2)} ₺</span>
                        </div>
                    </Card>
                </div>
            </Container>
        </main>
    );
}
