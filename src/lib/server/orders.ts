import "server-only";
import { db, type OrderRow, type TicketRow } from "./supabase";
import { getTransaction } from "./fedapay";
import { generateOrderPdf } from "./ticket-pdf";
import { sendTicketsEmail } from "./email";
import { safeEqual } from "./codes";

export async function loadOrder(id: string): Promise<{ order: OrderRow; tickets: TicketRow[] } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data: order } = await db().from("orders").select("*").eq("id", id).maybeSingle<OrderRow>();
  if (!order) return null;
  const { data: tickets } = await db().from("tickets").select("*").eq("order_id", id).order("position");
  return { order, tickets: (tickets ?? []) as TicketRow[] };
}

/** Charge une commande en vérifiant le jeton d'accès privé du lien. */
export async function loadOrderWithToken(id: string, token: string | null) {
  const res = await loadOrder(id);
  if (!res || !token || !safeEqual(res.order.access_token, token)) return null;
  return res;
}

/**
 * Vérifie la transaction auprès de FedaPay (jamais sur la parole du client ou du
 * webhook) et, si elle est approuvée, passe la commande en "paid" puis envoie
 * les billets. Idempotent : webhook et page de confirmation peuvent l'appeler
 * en parallèle, un seul gagne la transition et un seul envoie l'email.
 */
export async function confirmOrder(orderId: string): Promise<OrderRow["status"]> {
  const res = await loadOrder(orderId);
  if (!res) throw new Error("Commande introuvable");
  const { order } = res;
  if (order.status === "paid") {
    await ensureEmailSent(orderId);
    return "paid";
  }
  if (!order.fedapay_transaction_id) return order.status;

  const tx = await getTransaction(order.fedapay_transaction_id);
  const status = (tx.status ?? "").toLowerCase();

  if (status === "approved" || status === "transferred") {
    if (tx.amount !== order.amount) {
      console.error(`[orders] Montant incohérent pour ${orderId}: FedaPay ${tx.amount} ≠ commande ${order.amount}`);
      return order.status;
    }
    const { data: won } = await db()
      .from("orders")
      .update({
        status: "paid",
        paid_at: tx.approved_at ?? new Date().toISOString(),
        fedapay_reference: tx.reference ?? null,
        fees: tx.fees ?? null,
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .select("id");
    if (won?.length) console.info(`[orders] ${orderId} payée`);
    await ensureEmailSent(orderId);
    return "paid";
  }

  if (["declined", "canceled", "cancelled", "refunded", "expired"].includes(status)) {
    await db().from("orders").update({ status: status === "declined" ? "failed" : "cancelled" }).eq("id", orderId).eq("status", "pending");
    return status === "declined" ? "failed" : "cancelled";
  }
  return "pending";
}

/** Réserve l'envoi (email_sent_at) avant d'envoyer, le libère en cas d'échec. */
async function ensureEmailSent(orderId: string) {
  const claimedAt = new Date().toISOString();
  const { data: claimed } = await db()
    .from("orders")
    .update({ email_sent_at: claimedAt })
    .eq("id", orderId)
    .eq("status", "paid")
    .is("email_sent_at", null)
    .select("id");
  if (!claimed?.length) return;
  try {
    const res = await loadOrder(orderId);
    if (!res) return;
    const pdf = await generateOrderPdf(res.order, res.tickets);
    await sendTicketsEmail(res.order, res.tickets, pdf);
  } catch (err) {
    console.error(`[orders] Envoi email échoué pour ${orderId}`, err);
    await db().from("orders").update({ email_sent_at: null }).eq("id", orderId).eq("email_sent_at", claimedAt);
  }
}
