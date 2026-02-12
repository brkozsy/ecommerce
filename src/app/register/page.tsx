"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    Zap,
    AlertCircle
} from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);

            const displayName = name.trim();
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
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

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
                        Aramıza Katılın
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Hesap oluşturun, fırsatları kaçırmayın.
                    </p>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">

                    <form onSubmit={onSubmit} className="space-y-5">

                        <div>
                            <label className="sr-only">Ad Soyad</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                    placeholder="Ad Soyad"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="sr-only">E-posta</label>
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
                                    autoComplete="email"
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
                                    minLength={6}
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                    placeholder="Şifre (En az 6 karakter)"
                                    value={pw}
                                    onChange={(e) => setPw(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {err && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>{err}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:shadow-none"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
                            {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </button>
                    </form>

                </div>

                <p className="text-center text-sm text-gray-600">
                    Zaten bir hesabınız var mı?{" "}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                        Giriş Yapın
                    </Link>
                </p>
            </div>
        </div>
    );
}