import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/server/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type CartItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

type Body = {
    idToken: string;
    items: CartItem[];
};

export async function POST(req: Request) {
    const body = (await req.json()) as Body;

    if (!body?.idToken) {
        return NextResponse.json({ error: "Missing idToken" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(body.idToken);
    const uid = decoded.uid;

    if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = body.items.reduce(
        (s, i) => s + Number(i.price) * Number(i.qty),
        0
    );

    const ref = adminDb.collection("orders").doc();

    await ref.set({
        uid,
        items: body.items,
        total,
        status: "created",
        createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ orderId: ref.id }, { status: 201 });
}
