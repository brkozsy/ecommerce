"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
    Mail,
    Lock,
    Loader2,
    Zap,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { FirebaseError } from "firebase/app";

type LoginFormInputs = {
    email: string;
    pass: string;
    rememberMe: boolean;
};

const schema: yup.ObjectSchema<LoginFormInputs> = yup.object({
    email: yup.string().required("E-posta zorunlu").email("Geçerli bir e-posta girin"),
    pass: yup.string().required("Şifre zorunlu").min(6, "Şifre en az 6 karakter olmalı"),
    rememberMe: yup.boolean().default(false),
});

const getErrorMessage = (err: unknown) => {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case "auth/invalid-credential":
                return "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.";

            case "auth/too-many-requests":
                return "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.";
            default:
                return `Bir hata oluştu: ${err.message}`;
        }
    }
    if (err instanceof Error) return err.message;
    return "Beklenmedik bir hata oluştu.";
};

export default function LoginPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/home";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
    } = useForm<LoginFormInputs>({
        resolver: yupResolver(schema),
        defaultValues: { email: "", pass: "", rememberMe: false },
        mode: "onTouched",
    });

    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = async (values: LoginFormInputs) => {
        setSuccess(null);
        try {
            await signInWithEmailAndPassword(auth, values.email.trim(), values.pass);
            setSuccess("Giriş başarılı, yönlendiriliyorsunuz...");
            reset({ ...values, pass: "" });
            router.replace(next);
        } catch (err) {
            setError("root", { message: getErrorMessage(err) });
        }
    };

    const onGoogle = async () => {
        setSuccess(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setSuccess("Google ile giriş başarılı, yönlendiriliyorsunuz...");
            router.replace(next);
        } catch (err) {
            setError("root", { message: getErrorMessage(err) });
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

                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Giriş Yap</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Hesabın yok mu?{" "}
                        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Kayıt Ol
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

                    {success ? (
                        <div className="mb-6 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                            <CheckCircle2 className="mt-0.5 h-5 w-5" />
                            <span>{success}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                            {errors.email?.message ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Şifre</label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${errors.pass ? "border-red-200" : "border-gray-200"}`}
                                    {...register("pass")}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.pass?.message ? <p className="mt-1 text-xs text-red-600">{errors.pass.message}</p> : null}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    {...register("rememberMe")}
                                    disabled={isSubmitting}
                                />
                                Beni hatırla
                            </label>

                            <Link href="/home" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                Ana sayfaya dön
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-2 text-gray-500">veya</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onGoogle}
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            Google ile giriş yap
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}