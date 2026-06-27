import { NextResponse } from "next/server";
import { getRelayStatus } from "@/lib/relay-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRelayStatus());
}
