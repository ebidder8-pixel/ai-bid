import { loadOrderWithToken } from "@/lib/server/orders";
import { generateOrderPdf } from "@/lib/server/ticket-pdf";
import { orderNumber } from "@/lib/server/supabase";


export async function GET(req: Request, ctx: RouteContext<"/api/orders/[id]/pdf">) {
  const { id } = await ctx.params;
  const res = await loadOrderWithToken(id, new URL(req.url).searchParams.get("t"));
  if (!res) return new Response("Commande introuvable", { status: 404 });
  if (res.order.status !== "paid") return new Response("Paiement non confirmé", { status: 409 });

  const pdf = await generateOrderPdf(res.order, res.tickets);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="AI-BID-2027-${orderNumber(res.order.number)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
