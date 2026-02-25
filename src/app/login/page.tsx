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

// Form için tip tanımlamamız
type LoginFormInputs = {
    email: string;
    pass: string;
    rememberMe: boolean;
};

// Firebase hatalarını Türkçeleştiren yardımcı fonksiyon
import { FirebaseError } from "firebase/app"; // Tip kontrolü için gerekli

const getErrorMessage = (err: unknown) => {
    // Eğer hata bir FirebaseError ise
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

    // Standart bir JS Error ise
    if (err instanceof Error) return err.message;

    return "Beklenmedik bir hata oluştu.";
};
export default function LoginPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/home";

    // Başarı mesajını tutmak için sadece bunu bırakıyoruz
    // (Hata mesajları SWR'dan gelecek)
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // 1. React Hook Form Kurulumu
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>();

    // 2. SWR Mutation: E-Posta ile Giriş
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

                // SWR'ın yakalayabilmesi için hatayı fırlatıyoruz
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

    // 3. SWR Mutation: Google ile Giriş
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

    // Herhangi bir işlem devam ediyorsa loading true olsun
    const isLoading = isEmailLoading || isGoogleLoading;

    // SWR'dan gelen hataları veya bizim başarı mesajımızı birleştirelim
    const currentError = emailError?.message || googleError?.message;

    // Form Gönderim İşleyicisi
    const onSubmit = (data: LoginFormInputs) => {
        resetGoogleError(); // Önceki Google hatasını temizle
        triggerEmailLogin(data);
    };

    const handleGoogleLogin = () => {
        resetEmailError(); // Önceki Email hatasını temizle
        triggerGoogleLogin();
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
                        Tekrar Hoş Geldiniz
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Hesabınıza giriş yaparak alışverişe devam edin.
                    </p>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">

                    {/* Hata veya Başarı Mesajı Alanı */}
                    {(successMsg || currentError) && (
                        <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${successMsg
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {successMsg ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {successMsg || currentError}
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {/* Google SVG Logo */}
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
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">veya e-posta ile</span>
                            </div>
                        </div>

                        {/* RHF handleSubmit kullanımı */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="sr-only">Email</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        {...register("email", { required: "E-posta alanı zorunludur" })}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                        placeholder="E-posta Adresi"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="sr-only">Şifre</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        {...register("pass", { required: "Şifre alanı zorunludur" })}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                        placeholder="Şifre"
                                    />
                                </div>
                                {errors.pass && <p className="mt-1 text-xs text-red-500">{errors.pass.message}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        {...register("rememberMe")}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Beni hatırla
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Şifremi unuttum?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:shadow-none"
                            >
                                {isEmailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEmailLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                {!isEmailLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600">
                    Henüz hesabınız yok mu?{" "}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                        Hemen Kayıt Olun
                    </Link>
                </p>
            </div>
        </div>
    );
}