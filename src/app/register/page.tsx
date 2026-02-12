"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

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
                    ? "Bu e-posta zaten kayıtlı."
                    : error?.code === "auth/weak-password"
                        ? "Şifre çok zayıf (en az 6 karakter)."
                        : error?.code === "auth/invalid-email"
                            ? "E-posta formatı geçersiz."
                            : error?.message || "Kayıt olurken hata oluştu.";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-md p-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm text-black">
                <h1 className="text-2xl font-bold">Kayıt Ol</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Hesap oluştur ve alışverişe başla.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Ad Soyad</label>
                        <input
                            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Burak Özsoy"
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">E-posta</label>
                        <input
                            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@mail.com"
                            type="email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Şifre</label>
                        <input
                            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            placeholder="en az 6 karakter"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={6}
                        />
                    </div>

                    {err ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {err}
                        </div>
                    ) : null}

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                    >
                        {loading ? "Oluşturuluyor..." : "Kayıt Ol"}
                    </button>
                </form>

                <p className="mt-4 text-sm text-zinc-600">
                    Zaten hesabın var mı?{" "}
                    <Link className="font-semibold text-orange-600 hover:underline" href="/login">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </main>
    );
}
