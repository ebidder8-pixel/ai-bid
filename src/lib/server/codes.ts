import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { env } from "./env";
import type { TierId } from "@/lib/event";

// Alphabet sans caractères ambigus (0/O, 1/I/L).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomCode(len: number): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

const TIER_PREFIX: Record<TierId, string> = { essentiel: "ESS", pro: "PRO", premium: "PRM" };

export function newTicketCode(tier: TierId): string {
  return `AIB27-${TIER_PREFIX[tier]}-${randomCode(6)}`;
}

export function newAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

function sign(code: string): string {
  return createHmac("sha256", env("TICKET_SECRET")).update(code).digest("base64url").slice(0, 16);
}

/** Contenu du QR code : code du billet + signature (un QR inventé est rejeté). */
export function qrPayload(code: string): string {
  return `${code}.${sign(code)}`;
}

export function parseQrPayload(raw: string): { code: string; valid: boolean } {
  const s = raw.trim();
  const dot = s.lastIndexOf(".");
  if (dot < 0) return { code: s.toUpperCase(), valid: false };
  const code = s.slice(0, dot);
  const sig = s.slice(dot + 1);
  const expected = sign(code);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return { code, valid: a.length === b.length && timingSafeEqual(a, b) };
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
