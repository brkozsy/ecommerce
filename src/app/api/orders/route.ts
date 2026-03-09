import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/server/sendOrderEmail";

export const dynamic = "force-dynamic";

function getBearer(req: Request) {
    const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

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
            const createdAt = data.createdAt?.toDate?.()
                ? data.createdAt.toDate().getTime()
                : Number(data.createdAt ?? Date.now());

            return { id: d.id, ...data, createdAt };
        });

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message ?? "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const token = getBearer(req);
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
        }

        const { adminAuth, adminDb } = await import("@/lib/server/firebase/admin");
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;
        const customerEmail = decoded.email ?? "";

        const shipping = body.shipping ?? {};
        const payment = body.payment ?? {};

        const cartRef = adminDb.collection("carts").doc(uid);

        const result = await adminDb.runTransaction(async (tx) => {
            const cartSnap = await tx.get(cartRef);
            const cartData: any = cartSnap.exists ? cartSnap.data() : {};
            const cartItems: Array<{ productId: string; qty: number }> = Array.isArray(cartData.items)
                ? cartData.items
                : [];

            if (!cartItems.length) throw new Error("Sepet boş");

            const productRefs = cartItems.map((it) => adminDb.collection("products").doc(it.productId));
            const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));

            const orderItems: Array<{
                id: string;
                title: string;
                price: number;
                qty: number;
                imageUrl: string;
                category: string;
            }> = [];

            for (let i = 0; i < cartItems.length; i++) {
                const it = cartItems[i];
                const pSnap = productSnaps[i];
                if (!pSnap.exists) throw new Error("Ürün bulunamadı");

                const p: any = pSnap.data();
                const stock = Number(p.stock ?? 0);
                const qty = Math.max(1, Math.floor(Number(it.qty ?? 1)));

                if (!Number.isFinite(stock)) throw new Error("Ürün stoğu geçersiz");
                if (qty > stock) throw new Error("Stok yetersiz");

                orderItems.push({
                    id: pSnap.id,
                    title: String(p.title ?? ""),
                    price: Number(p.price ?? 0),
                    qty,
                    imageUrl: p.imageUrl ?? "",
                    category: p.category ?? "",
                });
            }

            for (let i = 0; i < cartItems.length; i++) {
                const it = cartItems[i];
                const pRef = productRefs[i];
                const pSnap = productSnaps[i];
                const p: any = pSnap.data();
                const stock = Number(p.stock ?? 0);
                const qty = Math.max(1, Math.floor(Number(it.qty ?? 1)));
                tx.update(pRef, { stock: stock - qty });
            }

            const total = orderItems.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);

            const orderRef = adminDb.collection("orders").doc();

            tx.set(orderRef, {
                userId: uid,
                items: orderItems,
                total,
                status: "pending",
                shipping,
                payment,
                createdAt: new Date(),
            });

            tx.set(cartRef, { items: [], updatedAt: new Date() }, { merge: true });

            return {
                orderId: orderRef.id,
                total,
                items: orderItems,
            };
        });

        try {
            await sendOrderEmail({
                orderId: result.orderId,
                customerEmail,
                total: result.total,
                items: result.items.map((item) => ({
                    title: item.title,
                    price: item.price,
                    qty: item.qty,
                })),
            });
        } catch (mailError) {
            console.error("Sipariş maili gönderilemedi:", mailError);
        }

        return NextResponse.json({ ok: true, id: result.orderId }, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Server error";

        if (msg === "Stok yetersiz") {
            return NextResponse.json({ ok: false, error: msg }, { status: 409 });
        }

        if (msg === "Sepet boş") {
            return NextResponse.json({ ok: false, error: msg }, { status: 400 });
        }

        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}