import type {
  CrisisUpdate,
  FieldReport,
  TransferKind,
  TransferPayload,
} from "@/types";
import { signData, verifyPayload } from "./verification";

const PREFIX = "MOISS1:";

/** Build a signed transfer payload for a crisis update or field report. */
export function buildPayload(
  kind: TransferKind,
  data: CrisisUpdate | FieldReport
): TransferPayload {
  const { sig, pub } = signData(data);
  return { v: 1, kind, data, sig, pub, mode: "signed" };
}

/** Encode a payload into a compact, QR-friendly transfer code. */
export function encodePayload(payload: TransferPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin);
}

export interface DecodeResult {
  ok: boolean;
  payload?: TransferPayload;
  verified?: boolean;
  error?: string;
}

/** Decode a transfer code (from QR, image or pasted text) back to a payload. */
export function decodePayload(raw: string): DecodeResult {
  try {
    let text = raw.trim();
    if (text.startsWith(PREFIX)) text = text.slice(PREFIX.length);
    const bin = atob(text);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as TransferPayload;
    if (payload.v !== 1 || !payload.kind || !payload.data) {
      return { ok: false, error: "Unrecognised payload format." };
    }
    const verified = verifyPayload(payload);
    return { ok: true, payload, verified };
  } catch {
    return { ok: false, error: "Could not read transfer code." };
  }
}
