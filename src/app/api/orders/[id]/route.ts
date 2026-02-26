import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBearer(req: Request) {
    const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { id } = await ctx.params;
        if (!id) return NextResponse.json({ ok: false, error: "Order id missing" }, { status: 400 });

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const ref = adminDb.collection("orders").doc(id);
        const snap = await ref.get();

        if (!snap.exists) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

        const data: any = snap.data();
        if (data.userId !== uid) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

        const createdAt = data.createdAt?.toDate?.()
            ? data.createdAt.toDate().getTime()
            : Number(data.createdAt ?? Date.now());

        return NextResponse.json({ ok: true, order: { id: snap.id, ...data, createdAt } });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}