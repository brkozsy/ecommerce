"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [msg, setMsg] = useState<string>("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg("");
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            setMsg("✅ Kayıt başarılı. Artık giriş yaptın.");
        } catch (err: any) {
            setMsg(err?.message ?? "Hata");
        }
    }

    return (
        <main className="mx-auto max-w-md p-6 space-y-4">
            <h1 className="text-2xl font-bold">Register</h1>

            <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border p-5">
                <input className="w-full rounded-xl border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="w-full rounded-xl border p-3" placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                <button className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5">
                    Create account
                </button>


            </form>

            {msg ? <p className="text-sm">{msg}</p> : null}

            <p className="text-sm opacity-70">
                Hesabın var mı? <Link className="underline" href="/login">Login</Link>
            </p>
        </main>
    );
}
