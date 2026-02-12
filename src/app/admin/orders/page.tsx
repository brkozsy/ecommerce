"use client";

import useSWR from "swr";
import { auth } from "@/lib/firebase/client";
import { useEffect, useState } from "react";

async function authedJson(url: string) {
    const u = auth.currentUser;
    if (!u) throw new Error("LOGIN_REQUIRED");

    const token = await u.getIdToken();
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text().catch(() => "");

    // ✅ Backend JSON döndürüyorsa yakalayalım
    if (!res.ok) {
        try {
            const j = text ? JSON.parse(text) : null;
            const err = j?.error || j?.message || "";
            // adminGuard "FORBIDDEN" / "UNAUTHENTICATED" döndürüyorsa
            if (err) throw new Error(err);
        } catch {
            // text JSON değilse
        }

        // ✅ status'a göre anlamlı error
        if (res.status === 401) throw new Error("UNAUTHENTICATED");
        if (res.status === 403) throw new Error("FORBIDDEN");

        throw new Error(text || `Request failed (${res.status})`);
    }

    return text ? JSON.parse(text) : null;
}

export default function AdminOrdersPage() {
    const [email, setEmail] = useState<string>("(loading...)");

    useEffect(() => {
        // auth state geldikçe email'i güncelle
        const unsub = auth.onAuthStateChanged((u) => {
            setEmail(u?.email || "(login değil)");
        });
        return () => unsub();
    }, []);

    const { data, error, isLoading, mutate } = useSWR("/api/admin/orders", authedJson);

    if (isLoading) return <div>Yükleniyor...</div>;

    if (error) {
        const msg = String((error as any)?.message || error);

        return (
            <div className="space-y-2">
                <p className="text-sm opacity-80">
                    Login email: <b>{email}</b>
                </p>

                {msg.includes("LOGIN_REQUIRED") || msg.includes("UNAUTHENTICATED") ? (
                    <div>Admin için giriş yapmalısın.</div>
                ) : msg.includes("FORBIDDEN") ? (
                    <div>
                        Yetkin yok (admin değilsin). <br />
                        <span className="text-xs opacity-70">
                            Çözüm: .env.local içindeki ADMIN_EMAILS ile yukarıdaki login email birebir aynı olmalı (tırnaksız) ve
                            server restart edilmeli.
                        </span>
                    </div>
                ) : (
                    <div className="text-red-600">Hata: {msg}</div>
                )}
            </div>
        );
    }

    const items = data?.items || [];

    return (
        <div className="space-y-4">
            <p className="text-sm opacity-80">
                Login email: <b>{email}</b>
            </p>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Orders</h2>
                <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => mutate()}>
                    Yenile
                </button>
            </div>

            <div className="rounded-xl border p-4">
                <pre className="text-xs">{JSON.stringify(items, null, 2)}</pre>
            </div>
        </div>
    );
}
