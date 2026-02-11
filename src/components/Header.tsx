"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";

import Container from "@/components/Container";
import Button from "@/components/ui/Button";

import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function Header() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const totalQty = useCartStore((s) => s.totalQty());

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="text-lg font-semibold tracking-tight text-white">
                    E-commerce
                </Link>

                <div className="flex items-center gap-2">
                    <Link href="/cart" className="relative">
                        <Button variant="secondary" size="sm">
                            Cart
                        </Button>

                        {totalQty > 0 && (
                            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-xs font-semibold text-black">
                                {totalQty}
                            </span>
                        )}
                    </Link>

                    {!loading && !user ? (
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                    ) : null}

                    {!loading && user ? (
                        <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
                            Logout
                        </Button>
                    ) : null}
                </div>
            </Container>
        </header>
    );
}
