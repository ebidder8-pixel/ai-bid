import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { TierId } from "@/lib/event";

export interface OrderRow {
  id: string;
  number: number;
  access_token: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_company: string | null;
  amount: number;
  fees: number | null;
  fedapay_transaction_id: string | null;
  fedapay_reference: string | null;
  paid_at: string | null;
  email_sent_at: string | null;
  created_at: string;
}

export interface TicketRow {
  id: string;
  order_id: string;
  code: string;
  tier: TierId;
  holder_name: string;
  price: number;
  position: number;
  checked_in_at: string | null;
  checked_in_by: string | null;
}

let client: SupabaseClient | null = null;

/** Client service_role — serveur uniquement, contourne RLS. */
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function orderNumber(n: number): string {
  return `AIB27-${String(n).padStart(6, "0")}`;
}
