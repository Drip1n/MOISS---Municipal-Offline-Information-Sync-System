import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import type { CrisisUpdate, FieldReport } from "@/types";
import { COMMAND_PRIVATE_KEY_HEX, COMMAND_PUBLIC_KEY_HEX } from "./keys";

// Pure-JS SHA-512 so signing / verifying works fully offline and synchronously,
// with no dependency on Web Crypto being available.
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const COMMAND_PUBLIC_KEY = COMMAND_PUBLIC_KEY_HEX;

/**
 * Deterministic serialisation of the signed object — keys sorted so the byte
 * string is identical on every device regardless of field order or transport
 * shape (V1 verbose and V2 compact sign the same bytes).
 */
export function canonicalJSON(data: CrisisUpdate | FieldReport): string {
  const src = data as unknown as Record<string, unknown>;
  const obj: Record<string, unknown> = {};
  for (const k of Object.keys(src).sort()) obj[k] = src[k];
  return JSON.stringify(obj);
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

/** Sign a crisis update / field report as Municipal Command. Returns base64 sig. */
export function signData(data: CrisisUpdate | FieldReport): string {
  const msg = new TextEncoder().encode(canonicalJSON(data));
  return b64encode(ed.sign(msg, COMMAND_PRIVATE_KEY_HEX));
}

/** Verify a signature against the pre-provisioned municipality public key. */
export function verifySignature(
  data: CrisisUpdate | FieldReport,
  sigB64: string
): boolean {
  try {
    const msg = new TextEncoder().encode(canonicalJSON(data));
    return ed.verify(b64decode(sigB64), msg, COMMAND_PUBLIC_KEY_HEX);
  } catch {
    return false;
  }
}
