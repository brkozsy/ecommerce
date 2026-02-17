import { NextResponse } from "next/server";

export const revalidate = 60;

function getIdFromUrl(req: Request) {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
}

function getBearer(req: Request) {
    const h =
        req.headers.get("authorization") ||
        req.headers.get("Authorization") ||
        "";
    return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(req: Request) {
    try {
        const id = getIdFromUrl(req);

        if (!id) {
            return NextResponse.json(
                { ok: false, error: "Invalid order id" },
                { status: 400 }
            );
        }

        const token = getBearer(req);
        if (!token) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");

        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const snap = await adminDb.collection("orders").doc(id).get();

        if (!snap.exists) {
            return NextResponse.json(
                { ok: false, error: "Order not found" },
                { status: 404 }
            );
        }

        const order = snap.data() as any;

        if (order.userId && order.userId !== uid) {
            return NextResponse.json(
                { ok: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        return NextResponse.json({ ok: true, order: { id: snap.id, ...order } });

    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message ?? "Server error" },
            { status: 500 }
        );
    }
}
