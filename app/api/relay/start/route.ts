import { NextResponse } from "next/server";
import { startRelay } from "@/lib/relay-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const result = await startRelay();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
