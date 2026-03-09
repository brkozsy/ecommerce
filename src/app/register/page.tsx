"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { User, Mail, Lock, ArrowRight, Loader2, Zap, AlertCircle } from "lucide-react";

type FormData = {
    name: string;
    email: string;
    password: string;
};

const schema: yup.ObjectSchema<FormData> = yup.object({
    name: yup.string().required("Ad Soyad zorunlu").min(2, "En az 2 karakter"),
    email: yup.string().required("E-posta zorunlu").email("Geçerli bir e-posta girin"),
    password: yup.string().required("Şifre zorunlu").min(6, "Şifre en az 6 karakter olmalı"),
});

export default function RegisterPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onTouched",
    });

    const onSubmit = async (values: FormData) => {
        try {
            const email = values.email.trim();
            const password = values.password;

            const cred = await createUserWithEmailAndPassword(auth, email, password);

            const displayName = values.name.trim();
            if (displayName) {
                await updateProfile(cred.user, { displayName });
            }

            router.replace("/");
        } catch (error: any) {
            const msg =
                error?.code === "auth/email-already-in-use"
                    ? "Bu e-posta adresi zaten kullanımda."
                    : error?.code === "auth/weak-password"
                        ? "Şifreniz çok zayıf (en az 6 karakter olmalı)."
                        : error?.code === "auth/invalid-email"
                            ? "Geçersiz e-posta formatı."
                            : error?.message || "Kayıt sırasında bir hata oluştu.";

            setError("root", { message: msg });
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">

            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    className="h-full w-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-gray-900/40" />
            </div>

            <div className="relative z-10 w-full max-w-420px space-y-8">

                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition-transform group-hover:scale-110">
                            <Zap className="h-7 w-7 fill-current" />
                        </div>
                        <span className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                            Tech<span className="text-indigo-400">Store</span>
                        </span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                        Aramıza Katılın
                    </h2>
                    <p className="mt-2 text-sm text-gray-300 font-medium">
                        Yeni bir hesap oluşturarak ayrıcalıklardan faydalanın.
                    </p>
                </div>

                <div className="rounded-[2.5rem] border border-white/20 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/40">

                    {errors.root?.message && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold border border-red-200 bg-red-50 text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <span>{errors.root.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Ad Soyad</label>
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    {...register("name")}
                                    className={`block w-full rounded-2xl border bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none shadow-sm ${errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 hover:border-gray-300"}`}
                                    placeholder="Adınız ve Soyadınız"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">E-posta</label>
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    {...register("email")}
                                    className={`block w-full rounded-2xl border bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none shadow-sm ${errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 hover:border-gray-300"}`}
                                    placeholder="ornek@sirket.com"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Şifre</label>
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    {...register("password")}
                                    className={`block w-full rounded-2xl border bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none shadow-sm ${errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 hover:border-gray-300"}`}
                                    placeholder="En az 6 karakter"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" /> Kayıt Yapılıyor...
                                    </>
                                ) : (
                                    <>
                                        Hesap Oluştur <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-300 font-medium">
                    Zaten hesabınız var mı?{" "}
                    <Link href="/login" className="font-bold text-white hover:text-indigo-300 hover:underline transition-colors">
                        Giriş Yapın
                    </Link>
                </p>
            </div>
        </div>
    );
}