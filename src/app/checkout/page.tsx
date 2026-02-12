"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import type { User } from "firebase/auth";
import { useCartStore } from "@/store/cartStore";

import {
    CreditCard,
    Truck,
    Banknote,
    MapPin,
    User as UserIcon,
    Phone,
    Navigation,
    CheckCircle2,
    Loader2,
    ShieldCheck
} from "lucide-react";

type Shipping = {
    adSoyad: string;
    telefon: string;
    sehir: string;
    adres: string;
    odemeYontemi: "card" | "cod" | "transfer";
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};

async function waitForUser(auth: any) {
    if (auth.currentUser) return auth.currentUser;
    return await new Promise<User | null>((resolve) => {
        let unsub: (() => void) | null = null;
        unsub = auth.onAuthStateChanged((u: User | null) => {
            if (unsub) unsub();
            resolve(u);
        });
    });
}

export default function CheckoutPage() {
    const router = useRouter();

    // Store verilerini güvenli çekelim
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
                setMsg("Sepetiniz boş görünüyor. Lütfen önce ürün ekleyin.");
                return;
            }

            // Validasyon
            if (!shipping.adSoyad.trim() || !shipping.telefon.trim() || !shipping.sehir.trim() || !shipping.adres.trim()) {
                setMsg("Lütfen tüm teslimat bilgilerini eksiksiz doldurun.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            setBusy(true);

            const user = await waitForUser(auth);
            if (!user) {
                router.replace("/login?redirect=/checkout");
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
                shipping: { ...shipping },
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
            try { json = JSON.parse(text); } catch { }

            if (!res.ok || !json?.ok) {
                throw new Error(json?.error ?? text ?? "Sipariş oluşturulamadı.");
            }

            try { clearCart(); } catch { }

            router.push(`/orders/${json.id}`);
        } catch (e: any) {
            setMsg(e?.message ?? "Beklenmedik bir hata oluştu.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ödeme & Teslimat</h1>
                    <p className="mt-2 text-sm text-gray-500">Siparişinizi tamamlamak için bilgilerinizi giriniz.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">

                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">


                        {msg && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="text-red-500">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-medium text-red-800">{msg}</p>
                            </div>
                        )}

                        {/* Bölüm 1: Teslimat Bilgileri */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Teslimat Adresi</h2>
                                    <p className="text-xs text-gray-500">Kargonuzun geleceği adres bilgileri</p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Ad Soyad</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-gray-200 pl-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            placeholder="Örn: Ahmet Yılmaz"
                                            value={shipping.adSoyad}
                                            onChange={(e) => setShipping((s) => ({ ...s, adSoyad: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            className="block w-full rounded-lg border border-gray-200 pl-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            placeholder="0555 123 45 67"
                                            value={shipping.telefon}
                                            onChange={(e) => setShipping((s) => ({ ...s, telefon: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Şehir</label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="block w-full rounded-lg border border-gray-200 pl-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            placeholder="İstanbul"
                                            value={shipping.sehir}
                                            onChange={(e) => setShipping((s) => ({ ...s, sehir: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Açık Adres</label>
                                    <textarea
                                        rows={3}
                                        className="block w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                                        placeholder="Mahalle, Cadde, Sokak, Bina No, Daire..."
                                        value={shipping.adres}
                                        onChange={(e) => setShipping((s) => ({ ...s, adres: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bölüm 2: Ödeme Yöntemi */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Ödeme Yöntemi</h2>
                                    <p className="text-xs text-gray-500">Size uygun olan yöntemi seçin</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {/* Kredi Kartı Seçeneği */}
                                <button
                                    type="button"
                                    onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "card" }))}
                                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-gray-50 ${shipping.odemeYontemi === "card"
                                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                                        : "border-gray-100 text-gray-600"
                                        }`}
                                >
                                    <CreditCard className={`h-6 w-6 ${shipping.odemeYontemi === "card" ? "text-indigo-600" : "text-gray-400"}`} />
                                    <span className="text-sm font-medium">Kredi Kartı</span>
                                    {shipping.odemeYontemi === "card" && (
                                        <div className="absolute right-2 top-2 text-indigo-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>

                                {/* Kapıda Ödeme Seçeneği */}
                                <button
                                    type="button"
                                    onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "cod" }))}
                                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-gray-50 ${shipping.odemeYontemi === "cod"
                                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                                        : "border-gray-100 text-gray-600"
                                        }`}
                                >
                                    <Truck className={`h-6 w-6 ${shipping.odemeYontemi === "cod" ? "text-indigo-600" : "text-gray-400"}`} />
                                    <span className="text-sm font-medium">Kapıda Ödeme</span>
                                    {shipping.odemeYontemi === "cod" && (
                                        <div className="absolute right-2 top-2 text-indigo-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>

                                {/* Havale Seçeneği */}
                                <button
                                    type="button"
                                    onClick={() => setShipping((s) => ({ ...s, odemeYontemi: "transfer" }))}
                                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-gray-50 ${shipping.odemeYontemi === "transfer"
                                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                                        : "border-gray-100 text-gray-600"
                                        }`}
                                >
                                    <Banknote className={`h-6 w-6 ${shipping.odemeYontemi === "transfer" ? "text-indigo-600" : "text-gray-400"}`} />
                                    <span className="text-sm font-medium">Havale / EFT</span>
                                    {shipping.odemeYontemi === "transfer" && (
                                        <div className="absolute right-2 top-2 text-indigo-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Ödeme yöntemi açıklaması (Opsiyonel UX) */}
                            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                                {shipping.odemeYontemi === "card" && "Güvenli 3D ödeme altyapısı ile kartınızdan çekim yapılır."}
                                {shipping.odemeYontemi === "cod" && "Ürünü teslim alırken kargo görevlisine nakit veya kartla ödeme yapabilirsiniz."}
                                {shipping.odemeYontemi === "transfer" && "Sipariş sonrası IBAN bilgilerimiz size iletilecektir. Ödeme onayı sonrası kargo yapılır."}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: Özet (Sticky) */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-8 space-y-6">

                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Sipariş Özeti</h2>
                                </div>

                                <div className="p-6">
                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                                        {(cartItems ?? []).map((it: any, idx: number) => (
                                            <div key={`${it.id ?? idx}`} className="flex items-start gap-4">
                                                {/* Ürün Resmi (Yoksa Placeholder) */}
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                    {it.image ? (
                                                        <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                            <Truck className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {it.title ?? it.name ?? "İsimsiz Ürün"}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500">Adet: {it.qty ?? 1}</p>
                                                </div>

                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatPrice(Number(it.price ?? 0) * Number(it.qty ?? 1))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="my-6 border-dashed border-gray-200" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Ara Toplam</span>
                                            <span>{formatPrice(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Kargo</span>
                                            <span className="text-green-600 font-medium">Ücretsiz</span>
                                        </div>
                                    </div>

                                    <hr className="my-6 border-gray-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-900">Toplam Tutar</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Aksiyon Butonları */}
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={submitOrder}
                                        disabled={busy}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-300 disabled:shadow-none"
                                    >
                                        {busy ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                İşleniyor...
                                            </>
                                        ) : (
                                            <>
                                                Siparişi Tamamla
                                                <CheckCircle2 className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => router.push("/cart")}
                                        disabled={busy}
                                        className="mt-3 w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                                    >
                                        Sepete Geri Dön
                                    </button>
                                </div>
                            </div>

                            {/* Güvenlik Rozeti */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ShieldCheck className="h-4 w-4" />
                                <span>256-bit SSL ile güvenli ödeme</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}