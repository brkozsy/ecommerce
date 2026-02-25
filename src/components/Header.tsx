"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingBag, LogOut, Zap, LayoutDashboard } from "lucide-react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export default function Header() {
    const router = useRouter();

    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const totalQty = useCartStore((s: any) => (s.totalQty ? s.totalQty() : 0));
    const user = useAuthStore((s: any) => s.user);

    const isAdmin =
        !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
        router.refresh();
    };

    if (!mounted)
        return <div className="h-20 w-full bg-white border-b border-gray-100"></div>;

    return (
        <>
            <div className="bg-indigo-900 text-white">
                <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-8">
                    <p className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-700 animate-pulse">
                            <Zap className="h-3 w-3 text-whites" />
                        </span>
                        <span>Sezon ortası indirimleri başladı!</span>
                    </p>
                </div>
            </div>

            <header
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
                    ? "border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm py-2"
                    : "border-b border-transparent bg-white py-4"
                    }`}
            >
                <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-8">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/home" className="flex items-center gap-2 group">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                                    <Zap className="h-5 w-5 fill-current" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    Tech<span className="text-indigo-600">Store</span>
                                </span>
                            </Link>

                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="hidden sm:flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 hover:bg-indigo-100 transition-colors"
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    Yönetim Paneli
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/cart"
                                className="group relative rounded-full p-2 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            >
                                <ShoppingBag className="h-6 w-6" />
                                {totalQty > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                                        {totalQty}
                                    </span>
                                )}
                            </Link>

                            <div className="h-6 w-px bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium text-gray-900 leading-none">
                                                {user.displayName || user.email?.split("@")[0]}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {isAdmin ? "Yönetici 🛡️" : "Üye"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="group flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600"
                                            title="Çıkış Yap"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-2"
                                        >
                                            Giriş
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            Kayıt Ol
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
