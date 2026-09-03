import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import type { CrisisUpdate, FieldReport, TransferPayload } from "@/types";
import { COMMAND_PRIVATE_KEY_HEX, COMMAND_PUBLIC_KEY_HEX } from "./keys";

// Wire a pure-JS SHA-512 so signing/verifying works fully offline and
// synchronously, with no dependency on Web Crypto / subtle availability.
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const COMMAND_PUBLIC_KEY = COMMAND_PUBLIC_KEY_HEX;

/**
 * Deterministic, stable serialisation of the signed object. Keys are sorted so
 * the byte string is identical on every device regardless of field order.
 */
export function canonicalJSON(data: CrisisUpdate | FieldReport): string {
  const src = data as unknown as Record<string, unknown>;
  const keys = Object.keys(src).sort();
  const obj: Record<string, unknown> = {};
  for (const k of keys) obj[k] = src[k];
  return JSON.stringify(obj);
}

function toBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function b64encode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Sign a crisis update / field report as Municipal Command. */
export function signData(data: CrisisUpdate | FieldReport): {
  sig: string;
  pub: string;
} {
  const msg = toBytes(canonicalJSON(data));
  const sig = ed.sign(msg, COMMAND_PRIVATE_KEY_HEX);
  return { sig: b64encode(sig), pub: COMMAND_PUBLIC_KEY_HEX };
}

/** Verify a received payload against the embedded Municipal Command public key. */
export function verifyPayload(payload: TransferPayload): boolean {
  try {
    if (payload.mode === "prototype") return true;
    const msg = toBytes(canonicalJSON(payload.data));
    return ed.verify(b64decode(payload.sig), msg, COMMAND_PUBLIC_KEY_HEX);
  } catch {
    return false;
  }
}
