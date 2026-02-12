"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Kullanıcı bilgisini store'a atıyoruz
            setUser(user);
        });
        return () => unsubscribe();
    }, [setUser]);

    return <>{children}</>;
}