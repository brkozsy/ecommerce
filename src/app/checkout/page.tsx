"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useForm, watch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { getCart } from "@/lib/api/cart";
import { createOrderFromCart } from "@/lib/api/orders";
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Truck,
    Building2,
    MapPin,
    Phone,
    User,
    Lock,
    ShieldCheck,
    Package
} from "lucide-react";

type FormData = {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    paymentMethod: "card" | "cod" | "transfer";
};

const schema: yup.ObjectSchema<FormData> = yup.object({
    fullName: yup.string().required("Ad Soyad zorunlu").min(3, "En az 3 karakter giriniz"),
    phone: yup.string().required("Telefon zorunlu").matches(/^\+?[0-9\s()-]{10,}$/, "Geçerli bir telefon numarası giriniz"),
    city: yup.string().required("Şehir zorunlu").min(2, "Geçerli bir şehir giriniz"),
    address: yup.string().required("Adres zorunlu").min(10, "Açık adres en az 10 karakter olmalıdır"),
    paymentMethod: yup.mixed<FormData["paymentMethod"]>().oneOf(["card", "cod", "transfer"]).required(),
});

const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken();
}

export default function CheckoutPage() {
    const router = useRouter();
    const user = useAuthStore((s: any) => s.user);

    const { data: cart, isLoading } = useSWR(
        user ? "cart" : null,
        async () => {
            const token = await tokenOrThrow();
            return await getCart(token);
        },
        { revalidateOnFocus: false }
    );

    const items = cart?.items ?? [];
    const total = useMemo(
        () => cart?.total ?? items.reduce((s: number, it: any) => s + it.price * it.qty, 0),
        [cart?.total, items]
    );

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string>("");
    const [ok, setOk] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: { fullName: "", phone: "", city: "", address: "", paymentMethod: "card" },
        mode: "onSubmit",
    });

    // Seçili ödeme yöntemini anlık takip etmek için
    const selectedPayment = watch("paymentMethod");

    async function onSubmit(values: FormData) {
        try {
            setMsg("");
            setOk(false);

            if (!user) {
                router.push("/login?next=/checkout");
                return;
            }

            if (!items.length) {
                setMsg("Sepetiniz boş. Lütfen önce ürün ekleyin.");
                setOk(false);
                return;
            }

            setBusy(true);
            const token = await tokenOrThrow();

            const { id } = await createOrderFromCart(token, {
                shipping: {
                    adSoyad: values.fullName,
                    telefon: values.phone,
                    sehir: values.city,
                    adres: values.address,
                },
                payment: { method: values.paymentMethod },
            });

            await mutate("cart");
            setOk(true);
            setMsg("Siparişiniz başarıyla alındı. Yönlendiriliyorsunuz...");
            setTimeout(() => router.replace(`/orders/${id}`), 1500);
        } catch (e: any) {
            const message = e?.message === "Stok yetersiz"
                ? "Bazı ürünlerde stok tükenmiş. Lütfen sepetinizi güncelleyin."
                : e?.message || "Sipariş oluşturulurken beklenmeyen bir hata oluştu.";
            setOk(false);
            setMsg(message);
        } finally {
            setBusy(false);
        }
    }

    // GİRİŞ YAPILMAMIŞ DURUM
    if (!user) {
        return (
            <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-xl shadow-gray-200/40 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Lock className="h-7 w-7 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Güvenli Ödeme</h1>
                    <p className="text-gray-500 text-sm mb-8">Siparişinizi tamamlamak ve takip edebilmek için giriş yapmanız gerekmektedir.</p>
                    <button
                        onClick={() => router.push("/login?next=/checkout")}
                        className="w-full rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-black transition-colors shadow-lg shadow-gray-200"
                    >
                        Giriş Yap / Üye Ol
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFAFB] py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Başlık */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Ödeme Adımı</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Siparişinizi tamamlamak için son adım.</p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">

                    {/* SOL KOLON: FORM */}
                    <div className="lg:col-span-7">

                        {/* Uyarı ve Mesajlar */}
                        {msg && (
                            <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
                                <div className="flex items-center gap-3">
                                    {ok ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                                    <p>{msg}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* TESLİMAT BİLGİLERİ KARTI */}
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <MapPin className="h-5 w-5 text-indigo-600" /> Teslimat Bilgileri
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                            <User className="h-4 w-4 text-gray-400" /> Ad Soyad
                                        </label>
                                        <input
                                            {...register("fullName")}
                                            className={`w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:ring-4 outline-none ${errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 bg-gray-50/50 focus:bg-white"}`}
                                            placeholder="Teslim alacak kişinin adı"
                                        />
                                        {errors.fullName && <p className="text-xs font-medium text-red-500">{errors.fullName.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                            <Phone className="h-4 w-4 text-gray-400" /> Telefon
                                        </label>
                                        <input
                                            {...register("phone")}
                                            className={`w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:ring-4 outline-none ${errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 bg-gray-50/50 focus:bg-white"}`}
                                            placeholder="05XX XXX XX XX"
                                        />
                                        {errors.phone && <p className="text-xs font-medium text-red-500">{errors.phone.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4 text-gray-400" /> Şehir
                                        </label>
                                        <input
                                            {...register("city")}
                                            className={`w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:ring-4 outline-none ${errors.city ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 bg-gray-50/50 focus:bg-white"}`}
                                            placeholder="İl / İlçe"
                                        />
                                        {errors.city && <p className="text-xs font-medium text-red-500">{errors.city.message}</p>}
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700">Açık Adres</label>
                                        <textarea
                                            {...register("address")}
                                            rows={3}
                                            className={`w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:ring-4 outline-none resize-none ${errors.address ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 bg-gray-50/50 focus:bg-white"}`}
                                            placeholder="Mahalle, sokak, apartman ve daire numarası..."
                                        />
                                        {errors.address && <p className="text-xs font-medium text-red-500">{errors.address.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* ÖDEME YÖNTEMİ KARTI */}
                            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <CreditCard className="h-5 w-5 text-indigo-600" /> Ödeme Yöntemi
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${selectedPayment === "card" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}>
                                        <input type="radio" value="card" {...register("paymentMethod")} className="sr-only" />
                                        <CreditCard className={`h-6 w-6 ${selectedPayment === "card" ? "text-indigo-600" : "text-gray-400"}`} />
                                        <span className="text-sm font-bold">Kredi Kartı</span>
                                        {selectedPayment === "card" && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />}
                                    </label>

                                    <label className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${selectedPayment === "cod" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}>
                                        <input type="radio" value="cod" {...register("paymentMethod")} className="sr-only" />
                                        <Truck className={`h-6 w-6 ${selectedPayment === "cod" ? "text-indigo-600" : "text-gray-400"}`} />
                                        <span className="text-sm font-bold text-center">Kapıda Ödeme</span>
                                        {selectedPayment === "cod" && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />}
                                    </label>

                                    <label className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${selectedPayment === "transfer" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}>
                                        <input type="radio" value="transfer" {...register("paymentMethod")} className="sr-only" />
                                        <Building2 className={`h-6 w-6 ${selectedPayment === "transfer" ? "text-indigo-600" : "text-gray-400"}`} />
                                        <span className="text-sm font-bold text-center">Havale / EFT</span>
                                        {selectedPayment === "transfer" && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-600" />}
                                    </label>
                                </div>
                                {errors.paymentMethod && <p className="mt-3 text-xs font-medium text-red-500 text-center">{errors.paymentMethod.message}</p>}
                            </div>

                            {/* GİZLİ SUBMİT BUTONU (Formun enter ile çalışması için) */}
                            <button type="submit" id="checkout-submit" className="hidden" />
                        </form>
                    </div>

                    {/* SAĞ KOLON: SİPARİŞ ÖZETİ */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/30 overflow-hidden">
                            <div className="p-6 sm:p-8 bg-gray-50/50 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Sipariş Özeti</h2>
                            </div>

                            <div className="p-6 sm:p-8">
                                {isLoading ? (
                                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
                                ) : items.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-gray-500">Sepetinizde ürün bulunmuyor.</div>
                                ) : (
                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                        {items.map((it: any) => (
                                            <div key={it.id} className="flex items-center gap-4 py-2">
                                                <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center relative">
                                                    {it.imageUrl ? (
                                                        <img src={it.imageUrl} alt={it.title} className="h-full w-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-gray-300" />
                                                    )}
                                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                                        {it.qty}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{it.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatPrice(it.price)} / adet</p>
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatPrice(it.price * it.qty)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 border-t border-gray-100 pt-6 space-y-3">
                                    <div className="flex justify-between text-sm font-medium text-gray-500">
                                        <span>Ara Toplam</span>
                                        <span className="text-gray-900">{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-gray-500">
                                        <span>Kargo</span>
                                        <span className="text-emerald-600 font-bold">Ücretsiz</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                                        <span className="text-base font-bold text-gray-900">Ödenecek Tutar</span>
                                        <span className="text-2xl font-black text-indigo-600">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Formu tetikleyen Ana Buton */}
                                <button
                                    onClick={() => document.getElementById("checkout-submit")?.click()}
                                    disabled={busy || isLoading || items.length === 0}
                                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200"
                                >
                                    {busy ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" /> Sipariş Onaylanıyor...
                                        </>
                                    ) : (
                                        "Siparişi Onayla ve Bitir"
                                    )}
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 border-t border-gray-50 pt-6">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">256-Bit SSL Güvenli Ödeme</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}