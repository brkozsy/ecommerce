"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    Github
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/";

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Email/Password Giriş
    async function loginEmail(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;

        setMsg(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            setMsg({ type: 'success', text: "Giriş başarılı! Yönlendiriliyorsunuz..." });

            // State oturması için kısa bekleme
            setTimeout(() => router.replace(next), 1000);
        } catch (err: any) {
            let errorMessage = "Giriş yapılamadı.";
            if (err.code === 'auth/invalid-credential') errorMessage = "E-posta veya şifre hatalı.";
            else if (err.code === 'auth/user-not-found') errorMessage = "Böyle bir kullanıcı bulunamadı.";
            else if (err.code === 'auth/wrong-password') errorMessage = "Şifre yanlış.";

            setMsg({ type: 'error', text: errorMessage });
            setLoading(false);
        }
    }

    // Google Giriş
    async function loginGoogle() {
        if (loading) return;

        setMsg(null);
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setMsg({ type: 'success', text: "Google ile giriş başarılı! Yönlendiriliyorsunuz..." });
            setTimeout(() => router.replace(next), 1000);
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.message ?? "Google girişi başarısız." });
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">

                {/* Header / Logo */}
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

                {/* Form Container */}
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">

                    {/* Mesaj Alanı */}
                    {msg && (
                        <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${msg.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {msg.text}
                        </div>
                    )}

                    <div className="space-y-6">

                        {/* Google Button */}
                        <button
                            onClick={loginGoogle}
                            disabled={loading}
                            className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {/* Google SVG Logo */}
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Google ile Devam Et</span>
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">veya e-posta ile</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={loginEmail} className="space-y-4">
                            <div>
                                <label className="sr-only">Email</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                        placeholder="E-posta Adresi"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="sr-only">Şifre</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                        placeholder="Şifre"
                                        value={pass}
                                        onChange={(e) => setPass(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
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
                                disabled={loading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:shadow-none"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Link */}
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