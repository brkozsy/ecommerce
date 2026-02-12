"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
    const total = useCartStore((s) => s.totalQty());
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
            {/* Campaign bar */}
            <div className="bg-gradient-to-r from-orange-500 to-sky-500">
                <div className="container-page flex items-center justify-between py-2">
                    <p className="text-xs font-semibold text-white">
                        🚚 500₺ üzeri kargo bedava • 🔒 Güvenli ödeme • ↩️ Kolay iade
                    </p>
                    <p className="text-xs text-white/90">Destek: 09:00–18:00</p>
                </div>
            </div>

            {/* Main header */}
            <div className="container-page flex items-center justify-between py-4">
                <Link href="/" className="text-lg font-extrabold tracking-tight">
                    <span className="text-orange-600">Shop</span>
                    <span className="text-slate-900">Next</span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Home
                    </Link>

                    <Link
                        href="/cart"
                        className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Cart{" "}
                        <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                            {total}
                        </span>
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/admin/products"
                                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Admin
                            </Link>

                            <button
                                onClick={logout}
                                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Logout{user?.email ? ` • ${user.email}` : ""}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
