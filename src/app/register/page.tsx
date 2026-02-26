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
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                            <Zap className="h-6 w-6 fill-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">
                            Tech<span className="text-indigo-600">Store</span>
                        </span>
                    </Link>

                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Hesap Oluştur
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Zaten hesabın var mı?{" "}
                        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Giriş Yap
                        </Link>
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                    {errors.root?.message ? (
                        <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5" />
                            <span>{errors.root.message}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
                            <div className="relative mt-2">
                                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Burak Özsoy"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-200" : "border-gray-200"}`}
                                    {...register("name")}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.name?.message ? (
                                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">E-posta</label>
                            <div className="relative mt-2">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="mail@ornek.com"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? "border-red-200" : "border-gray-200"}`}
                                    {...register("email")}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.email?.message ? (
                                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Şifre</label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? "border-red-200" : "border-gray-200"}`}
                                    {...register("password")}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.password?.message ? (
                                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            {isSubmitting ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}