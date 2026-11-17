import { NextResponse } from "next/server";
import { z } from "zod";
import { EVENT, MAX_TICKETS_PER_ORDER, SITE_URL, tierById, type TierId } from "@/lib/event";
import { db, orderNumber, type OrderRow } from "@/lib/server/supabase";
import { createCheckout, splitName } from "@/lib/server/fedapay";
import { newAccessToken, newTicketCode } from "@/lib/server/codes";


const Body = z.object({
  buyer: z.object({
    name: z.string().trim().min(3, "Indiquez votre nom complet").max(120),
    email: z.string().trim().toLowerCase().email("Adresse email invalide").max(160),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro de téléphone invalide"),
    company: z.string().trim().max(160).optional().or(z.literal("")),
  }),
  tickets: z
    .array(
      z.object({
        tier: z.enum(["essentiel", "pro", "premium"]),
        holder: z.string().trim().min(3, "Nom du participant trop court").max(120),
      }),
    )
    .min(1, "Choisissez au moins un billet")
    .max(MAX_TICKETS_PER_ORDER, `${MAX_TICKETS_PER_ORDER} billets maximum par commande`),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides", issues: parsed.error.issues }, { status: 422 });
  }
  const { buyer, tickets } = parsed.data;

  // Prix toujours recalculés côté serveur.
  const lines = tickets.map((t, i) => ({ tier: t.tier as TierId, holder: t.holder, price: tierById(t.tier)!.price, position: i + 1 }));
  const amount = lines.reduce((s, l) => s + l.price, 0);

  const accessToken = newAccessToken();
  const { data: order, error } = await db()
    .from("orders")
    .insert({
      access_token: accessToken,
      buyer_name: buyer.name,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      buyer_company: buyer.company || null,
      amount,
    })
    .select("*")
    .single<OrderRow>();
  if (error || !order) {
    console.error("[orders] insert", error);
    return NextResponse.json({ error: "Impossible d'enregistrer la commande. Réessayez dans un instant." }, { status: 500 });
  }

  const { error: tErr } = await db()
    .from("tickets")
    .insert(lines.map((l) => ({ order_id: order.id, code: newTicketCode(l.tier), tier: l.tier, holder_name: l.holder, price: l.price, position: l.position })));
  if (tErr) {
    console.error("[orders] tickets insert", tErr);
    await db().from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Impossible d'enregistrer les billets. Réessayez dans un instant." }, { status: 500 });
  }

  try {
    const counts = lines.reduce<Record<string, number>>((acc, l) => ((acc[l.tier] = (acc[l.tier] ?? 0) + 1), acc), {});
    const summary = Object.entries(counts)
      .map(([t, n]) => `${n}× ${tierById(t)!.name}`)
      .join(", ");
    const { paymentUrl, transaction } = await createCheckout({
      amount,
      description: `${EVENT.name} — ${summary} (${orderNumber(order.number)})`.slice(0, 250),
      callbackUrl: `${SITE_URL}/commande/${order.id}?t=${accessToken}`,
      customer: { ...splitName(buyer.name), email: buyer.email },
      orderId: order.id,
    });
    await db().from("orders").update({ fedapay_transaction_id: String(transaction.id) }).eq("id", order.id);
    return NextResponse.json({ paymentUrl, orderId: order.id });
  } catch (err) {
    console.error("[orders] FedaPay", err);
    await db().from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: "Le service de paiement ne répond pas. Réessayez dans quelques minutes." }, { status: 502 });
  }
}
