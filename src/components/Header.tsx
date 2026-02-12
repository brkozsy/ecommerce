"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

export default function Header() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            if (!user) {
                setUserEmail(null);
                setIsAdmin(false);
                return;
            }

            setUserEmail(user.email);

            const adminEmails =
                process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

            setIsAdmin(adminEmails.includes(user.email || ""));
        });

        return () => unsub();
    }, []);

    async function handleLogout() {
        await signOut(auth);
    }

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight text-white"
                >
                    E-commerce
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-3">

                    {/* Admin Butonu */}
                    {isAdmin && (
                        <Link href="/admin">
                            <button className="rounded-xl bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition">
                                Admin Panel
                            </button>
                        </Link>
                    )}

                    {/* Cart */}
                    <Link href="/cart">
                        <button className="rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition">
                            Cart
                        </button>
                    </Link>

                    {/* Login / Logout */}
                    {!userEmail ? (
                        <Link href="/login">
                            <button className="rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition">
                                Login
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
