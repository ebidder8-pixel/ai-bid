import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/server/fedapay";
import { confirmOrder } from "@/lib/server/orders";
import { db } from "@/lib/server/supabase";
import { env } from "@/lib/server/env";


/**
 * Webhook FedaPay (événement transaction.approved, etc.).
 * Protégé par la signature X-FEDAPAY-SIGNATURE ; le statut est toujours
 * re-vérifié auprès de l'API FedaPay dans confirmOrder().
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-fedapay-signature"), env("FEDAPAY_WEBHOOK_SECRET"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let event: { name?: string; entity?: { id?: number | string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const txId = event.entity?.id;
  if (!txId || !event.name?.startsWith("transaction.")) return NextResponse.json({ ignored: true });

  const { data: order } = await db().from("orders").select("id").eq("fedapay_transaction_id", String(txId)).maybeSingle<{ id: string }>();
  if (!order) return NextResponse.json({ ignored: true, reason: "unknown transaction" });

  const status = await confirmOrder(order.id);
  return NextResponse.json({ ok: true, status });
}
