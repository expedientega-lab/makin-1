import { NextResponse } from "next/server";
import { stopRelay } from "@/lib/relay-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const result = await stopRelay();
  return NextResponse.json(result);
}
