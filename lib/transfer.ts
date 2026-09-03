import type {
  CrisisUpdate,
  FieldReport,
  TransferKind,
} from "@/types";
import { signData, verifySignature } from "./verification";

/**
 * Transport codec.
 *
 *   internal readable object  ->  compact wire object  ->  base64  ->  QR / code
 *
 * The signature is computed over the canonical JSON of the INTERNAL object, so
 * it stays valid no matter which transport shape carries it. The public key is
 * NOT transported — every device is pre-provisioned with it.
 */

const V2 = "MOISS2:";
const V1 = "MOISS1:"; // legacy — still decodable

type CompactUpdate = {
  i: string;
  t: string;
  a: string;
  c: string;
  p: CrisisUpdate["priority"];
  m: string;
  u: string;
  n: string;
};
type CompactReport = {
  i: string;
  t: string;
  y: FieldReport["type"];
  p: FieldReport["priority"];
  l: string;
  x: string;
  o: string;
};
type WireV2 =
  | { v: 2; k: "u"; d: CompactUpdate; s: string }
  | { v: 2; k: "r"; d: CompactReport; s: string };

function toCompact(
  kind: TransferKind,
  data: CrisisUpdate | FieldReport
): CompactUpdate | CompactReport {
  if (kind === "crisis_update") {
    const u = data as CrisisUpdate;
    return { i: u.id, t: u.createdAt, a: u.area, c: u.category, p: u.priority, m: u.message, u: u.validUntil, n: u.nextUpdate };
  }
  const r = data as FieldReport;
  return { i: r.id, t: r.createdAt, y: r.type, p: r.priority, l: r.location, x: r.description, o: r.sourceNcp };
}

function fromCompact(w: WireV2): CrisisUpdate | FieldReport {
  if (w.k === "u") {
    const d = w.d;
    return { id: d.i, createdAt: d.t, area: d.a, category: d.c, priority: d.p, message: d.m, validUntil: d.u, nextUpdate: d.n };
  }
  const d = w.d;
  return { id: d.i, createdAt: d.t, type: d.y, priority: d.p, location: d.l, description: d.x, sourceNcp: d.o };
}

function b64(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function unb64(text: string): string {
  const bin = atob(text);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Sign + encode into a compact V2 transfer code. */
export function buildTransfer(
  kind: TransferKind,
  data: CrisisUpdate | FieldReport
): string {
  const s = signData(data);
  const wire: WireV2 = {
    v: 2,
    k: kind === "crisis_update" ? "u" : "r",
    d: toCompact(kind, data) as CompactUpdate & CompactReport,
    s,
  };
  return V2 + b64(JSON.stringify(wire));
}

export interface DecodeResult {
  ok: boolean;
  kind?: TransferKind;
  data?: CrisisUpdate | FieldReport;
  verified?: boolean;
  error?: string;
}

/** Decode a transfer code from QR, image or pasted text (V2, with V1 fallback). */
export function readTransfer(raw: string): DecodeResult {
  try {
    const text = raw.trim();

    if (text.startsWith(V2)) {
      const wire = JSON.parse(unb64(text.slice(V2.length))) as WireV2;
      if (wire.v !== 2 || (wire.k !== "u" && wire.k !== "r") || !wire.d || !wire.s) {
        return { ok: false, error: "Unrecognised transfer format." };
      }
      const kind: TransferKind = wire.k === "u" ? "crisis_update" : "field_report";
      const data = fromCompact(wire);
      return { ok: true, kind, data, verified: verifySignature(data, wire.s) };
    }

    if (text.startsWith(V1)) {
      const legacy = JSON.parse(unb64(text.slice(V1.length))) as {
        kind?: string;
        data?: CrisisUpdate | FieldReport;
        sig?: string;
      };
      if (!legacy.kind || !legacy.data || !legacy.sig) {
        return { ok: false, error: "Unrecognised transfer format." };
      }
      const kind: TransferKind =
        legacy.kind === "field_report" ? "field_report" : "crisis_update";
      return {
        ok: true,
        kind,
        data: legacy.data,
        verified: verifySignature(legacy.data, legacy.sig),
      };
    }

    return { ok: false, error: "Not a MOISS transfer code." };
  } catch {
    return { ok: false, error: "Could not read transfer code." };
  }
}
