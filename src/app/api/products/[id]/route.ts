import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

function num(v: any, fallback?: number) {
    if (v === undefined || v === null || v === "") return fallback;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : fallback;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    try {


        const { id } = await ctx.params;

        const ref = adminDb.collection("products").doc(id);
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json({ ok: false, error: "Ürün bulunamadı" }, { status: 404 });
        }

        const p: any = snap.data() || {};

        const item = {
            id: snap.id,
            title: p.title ?? "",
            category: p.category ?? "",
            price: num(p.price, 0),
            stock: num(p.stock, 0),
            imageUrl: p.imageUrl ?? null,
            description: p.description ?? null,
            isActive: p.isActive !== false,
            createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : null,
            updatedAt: p.updatedAt?.toDate ? p.updatedAt.toDate().toISOString() : null,
        };

        return NextResponse.json({ ok: true, item });
    } catch (e: any) {
        const msg = String(e?.message || e);
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}

export async function PATCH(req: Request, ctx: Ctx) {
    try {
        await requireAdmin();
        const { id } = await ctx.params;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

        const patch: any = {};
        if (body.title !== undefined) patch.title = String(body.title).trim();
        if (body.category !== undefined) patch.category = String(body.category).trim();
        if (body.description !== undefined) patch.description = String(body.description || "").trim() || null;
        if (body.imageUrl !== undefined) patch.imageUrl = String(body.imageUrl || "").trim() || null;
        if (body.price !== undefined) patch.price = num(body.price, NaN);
        if (body.stock !== undefined) patch.stock = Math.max(0, Math.floor(num(body.stock, 0) ?? 0));
        if (body.isActive !== undefined) patch.isActive = !!body.isActive;

        if (patch.title !== undefined && !patch.title) {
            return NextResponse.json({ ok: false, error: "Başlık gerekli" }, { status: 400 });
        }

        patch.updatedAt = new Date();

        await adminDb.collection("products").doc(id).set(patch, { merge: true });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    try {
        await requireAdmin();
        const { id } = await ctx.params;

        await adminDb.collection("products").doc(id).delete();
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}