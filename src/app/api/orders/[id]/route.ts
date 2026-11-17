import { NextResponse } from "next/server";
import { confirmOrder, loadOrderWithToken } from "@/lib/server/orders";
import { orderNumber } from "@/lib/server/supabase";
import { qrPayload } from "@/lib/server/codes";


/** État de la commande (page de confirmation). Re-vérifie FedaPay tant qu'elle est en attente. */
export async function GET(req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");
  let res = await loadOrderWithToken(id, token);
  if (!res) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  if (res.order.status === "pending" || (res.order.status === "paid" && !res.order.email_sent_at)) {
    try {
      await confirmOrder(id);
      res = (await loadOrderWithToken(id, token))!;
    } catch (err) {
      console.error("[orders] verify", err);
    }
  }

  const { order, tickets } = res;
  const paid = order.status === "paid";
  return NextResponse.json({
    status: order.status,
    number: orderNumber(order.number),
    buyer: { name: order.buyer_name, email: order.buyer_email, company: order.buyer_company },
    amount: order.amount,
    fees: order.fees,
    paidAt: order.paid_at,
    reference: order.fedapay_reference,
    tickets: tickets.map((t) => ({
      code: t.code,
      tier: t.tier,
      holder: t.holder_name,
      price: t.price,
      qr: paid ? qrPayload(t.code) : null,
    })),
  });
}
