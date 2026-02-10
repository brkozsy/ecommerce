import { create } from "zustand";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type AuthState = {
    user: User | null;
    loading: boolean;
    start: () => () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    start: () => {
        const unsub = onAuthStateChanged(auth, (u) => {
            set({ user: u, loading: false });
        });
        return unsub;
    },
}));
