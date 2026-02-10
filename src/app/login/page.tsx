"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [msg, setMsg] = useState<string>("");

    async function loginEmail(e: React.FormEvent) {
        e.preventDefault();
        setMsg("");
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            setMsg("✅ Giriş başarılı.");
        } catch (err: any) {
            setMsg(err?.message ?? "Hata");
        }
    }

    async function loginGoogle() {
        setMsg("");
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setMsg("✅ Google ile giriş başarılı.");
        } catch (err: any) {
            setMsg(err?.message ?? "Hata");
        }
    }

    return (
        <main className="mx-auto max-w-md p-6 space-y-4">
            <h1 className="text-2xl font-bold">Login</h1>

            <div className="rounded-2xl border p-5 space-y-3">
                <button
                    className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5"
                    onClick={loginGoogle}
                >
                    Continue with Google
                </button>

                <div className="h-px bg-black/10 dark:bg-white/10" />

                <form onSubmit={loginEmail} className="space-y-3">
                    <input className="w-full rounded-xl border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="w-full rounded-xl border p-3" placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                    <button className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5">
                        Login
                    </button>
                </form>
            </div>

            {msg ? <p className="text-sm">{msg}</p> : null}

            <p className="text-sm opacity-70">
                Hesabın yok mu? <Link className="underline" href="/register">Register</Link>
            </p>
        </main>
    );
}
