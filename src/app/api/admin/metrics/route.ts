import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase/admin";
import { requireAdmin } from "@/lib/server/auth/adminGuard";

export const runtime = "nodejs";

async function safeCount(col: string) {
    try {
        const snap = await adminDb.collection(col).count().get();
        return Number(snap.data().count || 0);
    } catch {
        const snap = await adminDb.collection(col).get();
        return snap.size;
    }
}

export async function GET(req: Request) {
    try {
        await requireAdmin(req);

        const [ordersCount, productsCount] = await Promise.all([
            safeCount("orders"),
            safeCount("products"),
        ]);

        const ordersSnap = await adminDb.collection("orders").get();

        let pendingCount = 0;
        let revenue = 0;

        ordersSnap.forEach((d) => {
            const o: any = d.data();
            if (o?.status === "pending") pendingCount += 1;
            if (typeof o?.total === "number") revenue += o.total;
        });

        return NextResponse.json({
            ok: true,
            metrics: { ordersCount, pendingCount, productsCount, revenue },
        });
    } catch (e: any) {
        const msg = String(e?.message || e);
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ ok: false, error: msg }, { status });
    }
}