/**
 * Client helpers for the LOCAL FAST SYNC relay (`/api/transfer`).
 *
 * Priority order for moving a transfer:
 *   1. LOCAL SYNC   — same LAN/hotspot, a 4-char code
 *   2. DATA QR      — universal, no network at all
 *   3. TRANSFER CODE — paste, last resort
 *
 * Every function fails soft: if the relay is unreachable the caller falls back
 * to the QR. The live demo never depends on this.
 */

export function makeSyncCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
  let out = "";
  for (let i = 0; i < 4; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function pushLocal(code: string, transfer: string): Promise<boolean> {
  try {
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, transfer }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullLocal(code: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/transfer?code=${encodeURIComponent(code.toUpperCase())}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { transfer?: string };
    return body.transfer ?? null;
  } catch {
    return null;
  }
}
