import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBearer(req: Request) {
    const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    return h.startsWith("Bearer ") ? h.slice(7) : null;
}

// SEPET GET
export async function GET(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");

        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const cartRef = adminDb.collection("carts").doc(uid);
        const cartSnap = await cartRef.get();

        const cartData: any = cartSnap.exists ? cartSnap.data() : {};
        const itemsRaw: Array<{ productId: string; qty: number }> = Array.isArray(cartData.items)
            ? cartData.items
            : [];

        if (!itemsRaw.length) {
            return NextResponse.json({ ok: true, items: [], total: 0 });
        }

        const productRefs = itemsRaw.map((it) =>
            adminDb.collection("products").doc(it.productId)
        );

        const productSnaps = await Promise.all(productRefs.map((r) => r.get()));

        const items: any[] = [];
        let total = 0;

        for (let i = 0; i < itemsRaw.length; i++) {
            const pSnap = productSnaps[i];
            if (!pSnap.exists) continue;

            const p: any = pSnap.data();
            const qty = Number(itemsRaw[i].qty ?? 1);

            const item = {
                id: pSnap.id,
                title: p.title ?? "",
                price: Number(p.price ?? 0),
                stock: Number(p.stock ?? 0),
                imageUrl: p.imageUrl ?? "",
                category: p.category ?? "",
                qty,
            };

            total += item.price * qty;
            items.push(item);
        }

        return NextResponse.json({ ok: true, items, total });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}

// SEPETE EKLE
export async function POST(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { productId, qtyDelta = 1 } = body;

        if (!productId) {
            return NextResponse.json({ ok: false, error: "productId gerekli" }, { status: 400 });
        }

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");

        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const cartRef = adminDb.collection("carts").doc(uid);

        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(cartRef);
            const data: any = snap.exists ? snap.data() : {};

            let items: Array<{ productId: string; qty: number }> = Array.isArray(data.items)
                ? data.items
                : [];

            const index = items.findIndex((x) => x.productId === productId);

            if (index >= 0) {
                items[index].qty += qtyDelta;
            } else {
                items.push({ productId, qty: qtyDelta });
            }

            items = items.filter((x) => x.qty > 0);

            tx.set(cartRef, { items, updatedAt: new Date() }, { merge: true });
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}

// ADET GÜNCELLE
export async function PUT(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { productId, qty } = body;

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");

        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const cartRef = adminDb.collection("carts").doc(uid);

        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(cartRef);
            const data: any = snap.exists ? snap.data() : {};

            let items: Array<{ productId: string; qty: number }> = Array.isArray(data.items)
                ? data.items
                : [];

            const index = items.findIndex((x) => x.productId === productId);

            if (index >= 0) {
                if (qty <= 0) {
                    items.splice(index, 1);
                } else {
                    items[index].qty = qty;
                }
            }

            tx.set(cartRef, { items, updatedAt: new Date() }, { merge: true });
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}

// ÜRÜN SİL
export async function DELETE(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");

        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const cartRef = adminDb.collection("carts").doc(uid);

        if (!productId) {
            await cartRef.set({ items: [] }, { merge: true });
            return NextResponse.json({ ok: true });
        }

        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(cartRef);
            const data: any = snap.exists ? snap.data() : {};

            let items: Array<{ productId: string; qty: number }> = Array.isArray(data.items)
                ? data.items
                : [];

            items = items.filter((x) => x.productId !== productId);

            tx.set(cartRef, { items, updatedAt: new Date() }, { merge: true });
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}