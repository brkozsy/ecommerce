"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const start = useAuthStore((s) => s.start);

    useEffect(() => {
        const unsub = start();
        return () => unsub();
    }, [start]);

    return <>{children}</>;
}
