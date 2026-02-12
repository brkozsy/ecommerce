"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

function cn(...c: Array<string | false | null | undefined>) {
    return c.filter(Boolean).join(" ");
}

function initials(email?: string | null) {
    if (!email) return "U";
    const s = email.split("@")[0] || "U";
    return (s[0] || "U").toUpperCase();
}

export default function ProfileMenu() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const user = useAuthStore((s) => s.user);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const logout = useAuthStore((s) => s.logout);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    if (!isLoggedIn) {
        return (
            <Link
                href="/login"
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
                Giriş
            </Link>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm hover:bg-slate-50"
                )}
            >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-50 text-sm font-bold text-orange-700 ring-1 ring-orange-200">
                    {initials(user?.email)}
                </div>

                <div className="hidden max-w-[200px] text-left sm:block">
                    <div className="truncate text-sm font-semibold text-slate-900">
                        {user?.email ?? "Hesap"}
                    </div>
                    <div className="text-[11px] text-slate-500">Hesabım</div>
                </div>

                <div className="text-slate-500">▾</div>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
                    <div className="px-4 py-3">
                        <div className="text-xs text-slate-500">Giriş yapan</div>
                        <div className="truncate text-sm font-semibold text-slate-900">
                            {user?.email}
                        </div>
                    </div>

                    <div className="h-px bg-black/5" />

                    <div className="p-2">
                        <Link
                            href="/account"
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Profil
                        </Link>
                        <Link
                            href="/orders"
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Siparişlerim
                        </Link>
                        <Link
                            href="/admin"
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Admin Panel
                        </Link>

                        <div className="my-2 h-px bg-black/5" />

                        <button
                            onClick={async () => {
                                setOpen(false);
                                await logout();
                                router.push("/");
                            }}
                            className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
