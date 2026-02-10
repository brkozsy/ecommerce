"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function TopBar() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const totalQty = useCartStore((s) => s.totalQty());

    return (
        <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">E-commerce</Link>

            <div className="flex items-center gap-3">
                <Link className="rounded-2xl border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5" href="/cart">
                    Cart{totalQty ? ` (${totalQty})` : ""}
                </Link>

                {!loading && !user ? (
                    <Link className="rounded-2xl border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5" href="/login">
                        Login
                    </Link>
                ) : null}

                {!loading && user ? (
                    <button
                        className="rounded-2xl border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                        onClick={() => signOut(auth)}
                    >
                        Logout
                    </button>
                ) : null}
            </div>
        </div>
    );
}
