import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

// Porté depuis SOLUTION/backend/src/modules/fedapay (client fetch éprouvé :
// recherche du client existant, retry, déballage des réponses "v1/...").

const REQUEST_TIMEOUT_MS = 15_000;
const LOOKUP_TIMEOUT_MS = 5_000;

export interface FedapayTransaction {
  id: number;
  reference?: string;
  merchant_reference?: string;
  amount: number;
  fees?: number;
  amount_debited?: number;
  status?: string;
  approved_at?: string | null;
}

interface CustomerInput {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
}

class FedapayError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: Record<string, unknown>) {
    super(message);
    this.name = "FedapayError";
  }
}

const apiKey = () => env("FEDAPAY_API_KEY");
const baseUrl = () =>
  env("FEDAPAY_ENV", "sandbox").toLowerCase() === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";

export function splitName(full: string): { firstname: string; lastname: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: parts[0] };
  return { firstname: parts.slice(0, -1).join(" "), lastname: parts[parts.length - 1] };
}

export async function createCheckout(input: {
  amount: number;
  description: string;
  callbackUrl: string;
  customer: CustomerInput;
  orderId: string;
}): Promise<{ paymentUrl: string; transaction: FedapayTransaction }> {
  const merchantReference = `aibid_${input.orderId}_${Date.now()}`;
  const existingId = await findCustomerIdByEmail(input.customer.email);

  const body = (customer: unknown, ref: string) =>
    JSON.stringify({
      description: input.description,
      amount: input.amount,
      currency: { iso: "XOF" },
      callback_url: input.callbackUrl,
      customer,
      merchant_reference: ref,
      metadata: { order_id: input.orderId },
    });

  const customerPayload = existingId ? { id: existingId } : { firstname: input.customer.firstname, lastname: input.customer.lastname, email: input.customer.email };

  let transaction: FedapayTransaction;
  try {
    transaction = await request<FedapayTransaction>("/transactions", { method: "POST", body: body(customerPayload, merchantReference) });
  } catch (err) {
    // Le client existe mais la recherche a échoué : FedaPay refuse l'email en doublon.
    if (isEmailUnavailableError(err) && !existingId) {
      const retryId = await findCustomerIdByEmail(input.customer.email);
      if (!retryId) throw err;
      transaction = await request<FedapayTransaction>("/transactions", { method: "POST", body: body({ id: retryId }, `${merchantReference}_r`) });
    } else {
      throw err;
    }
  }

  if (!transaction?.id) throw new Error("FedaPay a retourné une transaction sans identifiant");

  const token = await request<{ url: string }>(`/transactions/${transaction.id}/token`, { method: "POST" });
  if (!token.url) throw new Error("FedaPay n'a pas retourné l'URL de paiement");
  return { paymentUrl: token.url, transaction };
}

export function getTransaction(id: number | string): Promise<FedapayTransaction> {
  return request<FedapayTransaction>(`/transactions/${id}`, { method: "GET" });
}

async function findCustomerIdByEmail(email: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl()}/customers?filters[email]=${encodeURIComponent(email)}&per_page=1`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { "v1/customers"?: Array<{ id?: number }> };
    return data["v1/customers"]?.[0]?.id ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl()}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
        cache: "no-store",
      });
      const raw = await res.text();
      let data: unknown = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new FedapayError(`Réponse non-JSON de FedaPay (${res.status})`, res.status);
      }
      if (!res.ok) {
        const obj = (data ?? {}) as Record<string, unknown>;
        const msg = typeof (obj.message ?? obj.error) === "string" ? String(obj.message ?? obj.error) : `FedaPay API error (${res.status})`;
        console.error(`[FedaPay] ${res.status} ${path} | ${raw.slice(0, 500)}`);
        throw new FedapayError(msg, res.status, obj.errors as Record<string, unknown> | undefined);
      }
      return unwrap(data) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("FedaPay request failed");
      if (attempt === 0 && isRetryable(lastError)) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError ?? new Error("FedaPay request failed");
}

function isEmailUnavailableError(err: unknown): boolean {
  if (!(err instanceof FedapayError)) return false;
  const e = err.errors?.email as string[] | undefined;
  return Array.isArray(e) && e.some((s) => typeof s === "string" && s.toLowerCase().includes("disponible"));
}

function isRetryable(err: Error): boolean {
  const m = err.message.toLowerCase();
  return (
    err.name === "AbortError" ||
    /abort|timeout|network|fetch|econnreset|econnrefused|api error \(5|non-json|transaction non trouv/.test(m)
  );
}

function unwrap(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const obj = data as Record<string, unknown>;
  const k = Object.keys(obj).find((key) => key.startsWith("v1/"));
  return k && obj[k] && typeof obj[k] === "object" ? obj[k] : data;
}

/**
 * Vérifie la signature d'un webhook FedaPay (algorithme du SDK officiel) :
 * header `X-FEDAPAY-SIGNATURE: t=<ts>,s=<hmac>`, HMAC-SHA256(secret, `${t}.${body}`).
 */
export function verifyWebhookSignature(rawBody: string, header: string | null, secret: string, toleranceSeconds = 300): boolean {
  if (!header || !secret) return false;
  let ts = -1;
  const sigs: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    if (k === "t") ts = parseInt(v, 10);
    if (k === "s") sigs.push(v);
  }
  if (ts === -1 || sigs.length === 0) return false;
  const expected = createHmac("sha256", secret).update(`${ts}.${rawBody}`, "utf8").digest("hex");
  const ok = sigs.some((s) => {
    const a = Buffer.from(s);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
  if (!ok) return false;
  return toleranceSeconds <= 0 || Math.floor(Date.now() / 1000) - ts <= toleranceSeconds;
}
