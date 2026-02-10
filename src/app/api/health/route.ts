export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { adminApp } from "@/lib/server/firebase/admin";

export async function GET() {
    return NextResponse.json({ ok: true, app: !!adminApp });
}
