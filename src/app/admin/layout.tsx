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
                <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-gray-900">Erişim Reddedildi</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Bu sayfaya erişmek için yönetici yetkisine sahip olmalısın.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Anasayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
