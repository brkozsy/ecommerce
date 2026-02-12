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

export async function PATCH(req: Request, ctx: Ctx) {
    try {
        await requireAdmin();
        const { id } = await ctx.params;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

        const patch: any = {};
        if (body.title !== undefined) patch.title = String(body.title).trim();
        if (body.description !== undefined) patch.description = String(body.description || "").trim() || null;
        if (body.imageUrl !== undefined) patch.imageUrl = String(body.imageUrl || "").trim() || null;
        if (body.price !== undefined) patch.price = num(body.price, NaN);
        if (body.stock !== undefined) patch.stock = num(body.stock, 0);
        if (body.isActive !== undefined) patch.isActive = !!body.isActive;

        if (patch.title !== undefined && !patch.title) {
            return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
        }
        if (patch.price !== undefined && !Number.isFinite(patch.price)) {
            return NextResponse.json({ ok: false, error: "price must be number" }, { status: 400 });
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
