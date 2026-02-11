"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

import Container from "@/components/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type OrderItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

type OrderDTO = {
    id: string;
    items?: OrderItem[];
    total?: number;
    createdAt?: number;
    status?: string;
    shipping?: {
        adSoyad?: string;
        telefon?: string;
        sehir?: string;
        adres?: string;
        odemeYontemi?: string;
    };
    payment?: {
        method?: string;
        status?: string;
    };
};

export default function OrderPage() {
    const router = useRouter();
    const { id: orderId } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDTO | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                setOrder(null);

                if (!orderId) return;

                const auth = getAuth();

                const user =
                    auth.currentUser ??
                    (await new Promise<ReturnType<typeof auth.currentUser>>((resolve) => {
                        const unsub = auth.onAuthStateChanged((u) => {
                            unsub();
                            resolve(u);
                        });
                    }));

                if (!user) {
                    router.replace("/login");
                    return;
                }

                const token = await user.getIdToken(true);

                const res = await fetch(`/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const text = await res.text();
                const ct = res.headers.get("content-type") || "";

                if (!ct.includes("application/json")) {
                    throw new Error(
                        `API JSON dönmedi (${res.status}): ${text.slice(0, 200)}`
                    );
                }

                const data = JSON.parse(text);

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error ?? `Sipariş alınamadı (${res.status}).`);
                }

                if (alive) setOrder(data.order as OrderDTO);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Bilinmeyen hata");
            } finally {
                if (alive) setLoading(false);
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [orderId, router]);

    const items = order?.items ?? [];
    const toplam = useMemo(() => {
        if (typeof order?.total === "number") return order.total;
        return items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
    }, [order?.total, items]);

    if (loading) {
        return (
            <main className="py-10">
                <Container>
                    <Card className="p-6">
                        <p className="text-white/70">Sipariş yükleniyor...</p>
                    </Card>
                </Container>
            </main>
        );
    }

    if (error) {
        return (
            <main className="py-10">
                <Container>
                    <Card className="p-6">
                        <p className="text-red-400">{error}</p>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => router.push("/")}>Ana sayfa</Button>
                            <Button variant="secondary" onClick={() => router.refresh()}>
                                Tekrar dene
                            </Button>
                        </div>
                    </Card>
                </Container>
            </main>
        );
    }

    if (!order) return null;

    const odemeYontemi =
        order.payment?.method ?? order.shipping?.odemeYontemi ?? "Belirtilmedi";
    const odemeDurumu = order.payment?.status ?? "bilinmiyor";
    const siparisDurumu = order.status ?? "pending";

    return (
        <main className="py-10">
            <Container>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Sipariş Alındı ✅</h1>
                        <p className="mt-1 text-sm text-white/60">
                            Sipariş No: <span className="text-white/80">{order.id}</span>
                        </p>
                    </div>

                    <Button variant="secondary" onClick={() => router.push("/")}>
                        Alışverişe Dön
                    </Button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <Card className="p-6 lg:col-span-2">
                        <h2 className="text-lg font-semibold text-white">Ürünler</h2>

                        {items.length === 0 ? (
                            <p className="mt-4 text-white/60">Ürün bilgisi bulunamadı.</p>
                        ) : (
                            <div className="mt-4 divide-y divide-white/10">
                                {items.map((it, idx) => (
                                    <div key={`${it.id}-${idx}`} className="flex justify-between gap-4 py-4">
                                        <div>
                                            <div className="font-medium text-white/90">{it.title}</div>
                                            <div className="mt-1 text-sm text-white/60">
                                                Adet: {it.qty} • Birim: {it.price} ₺
                                            </div>
                                        </div>
                                        <div className="font-semibold text-white">
                                            {Number(it.price) * Number(it.qty)} ₺
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                            <span className="text-white/70">Toplam</span>
                            <span className="text-lg font-semibold text-white">{toplam} ₺</span>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-white">Durum</h2>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-white/80">
                                    <span>Sipariş</span>
                                    <span className="text-white">{siparisDurumu}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                    <span>Ödeme</span>
                                    <span className="text-white">{odemeDurumu}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                    <span>Yöntem</span>
                                    <span className="text-white">{odemeYontemi}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-white">Teslimat</h2>
                            <div className="mt-4 space-y-2 text-sm text-white/80">
                                <div>
                                    <span className="text-white/60">Ad Soyad:</span>{" "}
                                    <span className="text-white">{order.shipping?.adSoyad ?? "-"}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Telefon:</span>{" "}
                                    <span className="text-white">{order.shipping?.telefon ?? "-"}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Şehir:</span>{" "}
                                    <span className="text-white">{order.shipping?.sehir ?? "-"}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Adres:</span>{" "}
                                    <span className="text-white">{order.shipping?.adres ?? "-"}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
        </main>
    );
}
