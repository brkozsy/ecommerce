"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
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

const getErrorMessage = (err: unknown) => {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case 'auth/invalid-credential':
                return "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.";
            case 'auth/user-not-found':
                return "Böyle bir kullanıcı bulunamadı.";
            case 'auth/wrong-password':
                return "Şifre yanlış.";
            case 'auth/too-many-requests':
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

    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>();

    const {
        trigger: triggerEmailLogin,
        isMutating: isEmailLoading,
        error: emailError,
        reset: resetEmailError
    } = useSWRMutation(
        "auth/email-login",
        async (key, { arg }: { arg: LoginFormInputs }) => {
            try {
                await signInWithEmailAndPassword(auth, arg.email, arg.pass);
            } catch (err) {
                throw new Error(getErrorMessage(err));
            }
        },
        {
            onSuccess: () => {
                setSuccessMsg("Giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => router.replace(next), 1000);
            }
        }
    );

    const {
        trigger: triggerGoogleLogin,
        isMutating: isGoogleLoading,
        error: googleError,
        reset: resetGoogleError
    } = useSWRMutation(
        "auth/google-login",
        async () => {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } catch (err) {
                throw new Error(getErrorMessage(err));
            }
        },
        {
            onSuccess: () => {
                setSuccessMsg("Google ile giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => router.replace(next), 1000);
            }
        }
    );

    const isLoading = isEmailLoading || isGoogleLoading;
    const currentError = emailError?.message || googleError?.message;

    const onSubmit = (data: LoginFormInputs) => {
        resetGoogleError();
        triggerEmailLogin(data);
    };

    const handleGoogleLogin = () => {
        resetEmailError();
        triggerGoogleLogin();
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">

            <div className="absolute inset-0 z-0">
                <img
                    src="https://monetabs.com/wp-content/uploads/2024/08/e-ticaret-1.jpg"
                    alt="Background"
                    className="h-full w-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-gray-900/40" />
            </div>

            <div className="relative z-10 w-full max-w-105 space-y-8">
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
                        Tekrar Hoş Geldiniz
                    </h2>
                    <p className="mt-2 text-sm text-gray-300 font-medium">
                        Hesabınıza giriş yaparak alışverişe devam edin.
                    </p>
                </div>

                <div className="rounded-[2.5rem] border border-white/20 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/40">

                    {(successMsg || currentError) && (
                        <div className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold border ${successMsg
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {successMsg ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}                            <span>{successMsg || currentError}</span>
                        </div>
                    )}

                    <div className="space-y-6">

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="relative flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3.5 text-sm font-bold text-gray-700 transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google ile Devam Et</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                <span className="bg-white px-4 text-gray-400">veya e-posta ile</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1.5">E-posta</label>
                                <div className="relative group">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        {...register("email", { required: "E-posta alanı zorunludur" })}
                                        className="block w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none"
                                        placeholder="ornek@sirket.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.email.message}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-bold text-gray-900">Şifre</label>
                                    <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                        Şifremi Unuttum?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        autoComplete="current-password"
                                        {...register("pass", { required: "Şifre alanı zorunludur" })}
                                        className="block w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.pass && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.pass.message}</p>}
                            </div>

                            <div className="pt-2 space-y-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-600"
                                            {...register("rememberMe")}
                                            disabled={isLoading}
                                        />
                                        <CheckCircle2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Beni bu cihazda hatırla</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isEmailLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" /> Giriş Yapılıyor...
                                        </>
                                    ) : (
                                        <>
                                            Hesabıma Giriş Yap <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-300 font-medium">
                    Henüz hesabınız yok mu?{" "}
                    <Link href="/register" className="font-bold text-white hover:text-indigo-300 hover:underline transition-colors">
                        Hemen Kayıt Olun
                    </Link>
                </p>
            </div>
        </div>
    );
}