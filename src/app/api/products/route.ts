import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        // Yetki kontrolü


        // Firebase'den veri çekme
        const snap = await adminDb.collection("products").get();

        // Eğer koleksiyon boşsa hata verme, boş dizi dön
        if (snap.empty) {
            return NextResponse.json({ ok: true, items: [] });
        }

        const items = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            // Sayısal değerleri garantiye al
            price: Number(d.data().price || 0),
            stock: Number(d.data().stock || 0),
        }));

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        console.error("API_HATASI:", e); // Terminale (VS Code) bak, hata burada yazacak
        return NextResponse.json(
            { ok: false, error: e?.message || "Sunucu hatası oluştu" },
            { status: 500 }
        );
    }
}