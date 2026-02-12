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

export default function LoginPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/";

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [msg, setMsg] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function loginEmail(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setMsg("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            setMsg("✅ Giriş başarılı. Yönlendiriliyor...");

            // küçük bir tick: auth state store vs. otursun
            setTimeout(() => router.replace(next), 50);
        } catch (err: any) {
            setMsg(err?.message ?? "Hata");
        } finally {
            setLoading(false);
        }
    }

    async function loginGoogle() {
        if (loading) return;
        setMsg("");
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setMsg("✅ Google ile giriş başarılı. Yönlendiriliyor...");
            setTimeout(() => router.replace(next), 50);
        } catch (err: any) {
            setMsg(err?.message ?? "Hata");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-md space-y-4 p-6">
            <h1 className="text-2xl font-bold">Login</h1>

            <div className="space-y-3 rounded-2xl border p-5">
                <button
                    className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/5"
                    onClick={loginGoogle}
                    disabled={loading}
                >
                    Continue with Google
                </button>

                <div className="h-px bg-black/10 dark:bg-white/10" />

                <form onSubmit={loginEmail} className="space-y-3">
                    <input
                        className="w-full rounded-xl border p-3"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <input
                        className="w-full rounded-xl border p-3"
                        placeholder="Password"
                        type="password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        autoComplete="current-password"
                    />
                    <button
                        className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/5"
                        disabled={loading}
                    >
                        {loading ? "..." : "Login"}
                    </button>
                </form>
            </div>

            {msg ? <p className="text-sm">{msg}</p> : null}

            <p className="text-sm opacity-70">
                Hesabın yok mu?{" "}
                <Link className="underline" href="/register">
                    Register
                </Link>
            </p>
        </main>
    );
}
