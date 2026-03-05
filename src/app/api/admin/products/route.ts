import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        await requireAdmin(req);

        if (!adminDb) {
            throw new Error("Firestore Admin SDK başlatılamadı.");
        }

        const snap = await adminDb.collection("products").orderBy("createdAt", "desc").get();

        const items = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                title: data.title ?? "Başlıksız Ürün",
                category: data.category ?? "Genel",
                price: Number(data.price ?? 0),
                stock: Number(data.stock ?? 0),
                isActive: data.isActive !== false,
                imageUrl: data.imageUrl ?? null,
            };
        });

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        console.error("--- ADMIN API GET HATASI ---", e);
        return NextResponse.json(
            { ok: false, error: e?.message || "Sunucu hatası" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await requireAdmin(req);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ ok: false, error: "Geçersiz veri formatı" }, { status: 400 });
        }


        const productData = {
            title: String(body.title || "").trim(),
            category: String(body.category || "").trim(),
            description: String(body.description || "").trim() || null,
            price: Number(body.price || 0),
            stock: Math.floor(Number(body.stock || 0)),
            imageUrl: body.imageUrl?.trim() || null,
            isActive: body.isActive !== false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!productData.title || !productData.category) {
            return NextResponse.json({ ok: false, error: "Başlık ve Kategori alanları zorunludur." }, { status: 400 });
        }

        const docRef = await adminDb.collection("products").add(productData);

        return NextResponse.json({
            ok: true,
            message: "Ürün başarıyla oluşturuldu",
            id: docRef.id
        });

    } catch (e: any) {
        console.error("--- ADMIN API POST HATASI ---", e);
        return NextResponse.json(
            { ok: false, error: e?.message || "Ürün eklenirken sunucu hatası oluştu" },
            { status: 500 }
        );
    }
}