"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

import Container from "@/components/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CartPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items);

    const total = items.reduce(
        (sum: number, i: any) => sum + Number(i.price) * Number(i.quantity ?? 1),
        0
    );

    return (
        <main className="py-10">
            <Container>
                <h1 className="text-2xl font-semibold text-white">Sepetim</h1>

                {items.length === 0 ? (
                    <Card className="mt-6 p-8 text-center">
                        <p className="text-white/70">Sepetiniz boş.</p>
                        <Button className="mt-4" onClick={() => router.push("/")}>
                            Alışverişe Dön
                        </Button>
                    </Card>
                ) : (
                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                        {/* Ürünler */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item: any) => {
                                const qty = Number(item.quantity ?? 1);
                                const price = Number(item.price);
                                const lineTotal = price * qty;

                                return (
                                    <Card key={item.id ?? item.slug} className="p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-white font-semibold">
                                                    {item.title ?? item.name}
                                                </h3>
                                                <p className="text-sm text-white/60">Adet: {qty}</p>
                                            </div>

                                            <div className="text-white font-semibold">
                                                {lineTotal} ₺
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Özet */}
                        <Card className="p-6 h-fit">
                            <h2 className="text-lg font-semibold text-white">Sipariş Özeti</h2>

                            <div className="mt-4 flex items-center justify-between text-white/80">
                                <span>Toplam</span>
                                <span className="text-white font-semibold">{total} ₺</span>
                            </div>

                            <Button
                                className="mt-6 w-full"
                                onClick={() => router.push("/checkout")}
                            >
                                Siparişi Tamamla
                            </Button>
                        </Card>
                    </div>
                )}
            </Container>
        </main>
    );
}
