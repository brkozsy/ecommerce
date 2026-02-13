"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["admin@techstore.com", "burakozsoy@gmail.com", "seninmailin@hotmail.com"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            setIsChecking(false);
        }
    }, [loading]);

    if (loading || isChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    if (!isAdmin) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="rounded-full bg-red-100 p-4">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Erişim Reddedildi</h1>
                <p className="mt-2 max-w-md text-gray-500">
                    Bu paneli görüntülemek için yetkiniz bulunmuyor.
                </p>
                <div className="mt-2 rounded-lg bg-gray-200 px-3 py-1 text-sm font-mono text-gray-700">
                    Giriş: {user?.email || "Yok"}
                </div>
                <Link
                    href="/"
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Mağazaya Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}