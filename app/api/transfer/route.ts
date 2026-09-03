import { NextResponse } from "next/server";

/**
 * LOCAL FAST SYNC relay — an in-memory hand-off between two devices on the same
 * LAN / hotspot (Command laptop hosts it; courier phone pulls from it).
 *
 * Deliberately trivial: no database, no external services, no auth. It only
 * moves an already-signed transfer code, which the receiver verifies anyway.
 * Entries expire after 15 minutes. Contents are lost on server restart — that
 * is fine, the Data QR path is the source of truth.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Entry = { transfer: string; ts: number };
const TTL_MS = 15 * 60 * 1000;

// Survives dev hot-reload by hanging off globalThis.
const store: Map<string, Entry> =
  (globalThis as { __moissRelay?: Map<string, Entry> }).__moissRelay ??
  ((globalThis as { __moissRelay?: Map<string, Entry> }).__moissRelay = new Map());

function sweep() {
  const now = Date.now();
  for (const [k, v] of store) if (now - v.ts > TTL_MS) store.delete(k);
}

export async function POST(req: Request) {
  try {
    const { code, transfer } = (await req.json()) as {
      code?: string;
      transfer?: string;
    };
    if (
      !code ||
      !/^[A-Z0-9]{4,8}$/.test(code) ||
      typeof transfer !== "string" ||
      transfer.length > 8000
    ) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }
    sweep();
    store.set(code, { transfer, ts: Date.now() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.toUpperCase() ?? "";
  sweep();
  const entry = store.get(code);
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ transfer: entry.transfer });
}
