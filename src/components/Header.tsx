"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import useSWR from "swr";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { getCart } from "@/lib/api/cart";
import { ShoppingBag, LogOut, Zap, LayoutDashboard, User } from "lucide-react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

async function tokenOrThrow() {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");
    return await u.getIdToken();
}

function getUserLabel(u: any) {
    const name = (u?.displayName || "").trim();
    const email = (u?.email || "").trim();
    return name || email || "Hesap";
}

function getUserSub(u: any) {
    const name = (u?.displayName || "").trim();
    const email = (u?.email || "").trim();
    if (name && email) return email;
    return "";
}

export default function Header() {
    const router = useRouter();

    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const user = useAuthStore((s: any) => s.user);

    const { data: cart } = useSWR(
        user ? "cart" : null,
        async () => {
            const token = await tokenOrThrow();
            return await getCart(token);
        },
        { revalidateOnFocus: false }
    );

    const totalQty = useMemo(() => {
        const items = cart?.items ?? [];
        return items.reduce((s, it) => s + Number(it.qty ?? 0), 0);
    }, [cart?.items]);

    const isAdmin =
        !!user?.email && ADMIN_EMAILS.includes(String(user.email).toLowerCase());

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
        return <div className="h-20 w-full bg-white border-b border-gray-100" />;

    const label = user ? getUserLabel(user) : "";
    const sub = user ? getUserSub(user) : "";

    return (
        <>
            <div className="bg-indigo-900 text-white">
                <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-8 py-2">
                    <p className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-700">
                            <Zap className="h-3 w-3" />
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
                        <Link href="/home" className="inline-flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                                <Zap className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-900">
                                Tech<span className="text-indigo-600">Store</span>
                            </span>
                        </Link>

                        <nav className="flex items-center gap-3">
                            {user ? (
                                <div className="hidden items-center gap-3 sm:flex">
                                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="leading-tight">
                                            <div className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                                                {label}
                                            </div>
                                            {sub ? (
                                                <div className="text-xs text-gray-500 max-w-[180px] truncate">
                                                    {sub}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {isAdmin ? (
                                <Link
                                    href="/admin"
                                    className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Admin
                                </Link>
                            ) : null}

                            <Link
                                href="/cart"
                                className="relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Sepet
                                {user && totalQty > 0 ? (
                                    <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                                        {totalQty}
                                    </span>
                                ) : null}
                            </Link>

                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Çıkış
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Giriş
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
                                    >
                                        Kayıt Ol
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        </>
    );
}