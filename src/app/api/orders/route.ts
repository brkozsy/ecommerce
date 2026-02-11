import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBearer(req: Request) {
    const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const snap = await adminDb
            .collection("orders")
            .where("userId", "==", uid)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const items = snap.docs.map((d) => {
            const data: any = d.data();
            const createdAt =
                data.createdAt?.toDate?.() ? data.createdAt.toDate().getTime() : data.createdAt ?? Date.now();

            return { id: d.id, ...data, createdAt };
        });

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });

        const { items, total, shipping, payment } = body as any;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ ok: false, error: "Items boş" }, { status: 400 });
        }

        const safeTotal =
            typeof total === "number"
                ? total
                : items.reduce((s: number, it: any) => s + Number(it.price) * Number(it.qty), 0);

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");
        const decoded = await adminAuth.verifyIdToken(token);

        const doc = {
            userId: decoded.uid,
            items: items.map((it: any) => ({
                id: String(it.id ?? ""),
                title: String(it.title ?? ""),
                price: Number(it.price ?? 0),
                qty: Number(it.qty ?? 1),
            })),
            total: Number(safeTotal),
            status: "pending",
            shipping: shipping ?? {},
            payment: payment ?? {},
            createdAt: new Date(),
        };

        const ref = await adminDb.collection("orders").add(doc);

        return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}
