import "server-only";
import { Resend } from "resend";
import { EVENT, ORGANIZER, SITE_URL, formatFcfa, tierById } from "@/lib/event";
import { orderNumber, type OrderRow, type TicketRow } from "./supabase";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Envoie les billets par email. Sans RESEND_API_KEY : log seulement (dev). */
export async function sendTicketsEmail(order: OrderRow, tickets: TicketRow[], pdf: Uint8Array): Promise<void> {
  const link = `${SITE_URL}/commande/${order.id}?t=${order.access_token}`;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn(`[email] RESEND_API_KEY absente — email non envoyé à ${order.buyer_email}. Lien : ${link}`);
    return;
  }
  const resend = new Resend(key);
  const n = tickets.length;
  const rows = tickets
    .map((t) => {
      const tier = tierById(t.tier)!;
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #E3E8EF"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${tier.color};margin-right:8px"></span>${esc(tier.name)}</td><td style="padding:10px 0;border-bottom:1px solid #E3E8EF">${esc(t.holder_name)}</td><td style="padding:10px 0;border-bottom:1px solid #E3E8EF;font-family:monospace">${t.code}</td></tr>`;
    })
    .join("");

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#EEF1F6;font-family:Roboto,Arial,sans-serif;color:#0F2340">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F6;padding:24px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#003366;padding:28px 32px;color:#fff">
<div style="color:#EFBB59;font-size:14px;font-weight:600">Masterclass</div>
<div style="font-size:34px;font-weight:900;letter-spacing:-0.5px;margin-top:4px">AI-BID 2027</div>
<div style="color:#C9D6EA;font-size:14px;margin-top:6px">${EVENT.datesLabel} · ${EVENT.venue}, Cotonou</div>
</td></tr>
<tr><td style="height:6px;background:#FE7200"></td></tr>
<tr><td style="padding:28px 32px">
<p style="font-size:16px;margin:0 0 12px">Bonjour ${esc(order.buyer_name.split(" ")[0])},</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 20px">Votre paiement est confirmé. ${n > 1 ? `Vos ${n} billets sont` : "Votre billet est"} en pièce jointe (PDF). Il sert aussi de reçu. Présentez le QR code à l'entrée, imprimé ou sur votre téléphone.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}</table>
<p style="font-size:14px;margin:20px 0 4px;color:#5B6B82">Commande ${orderNumber(order.number)} · Total ${formatFcfa(order.amount)}</p>
<p style="margin:24px 0"><a href="${link}" style="background:#FE7200;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;font-size:15px">Voir mes billets en ligne</a></p>
<p style="font-size:13px;line-height:1.6;color:#5B6B82;margin:0">Une question ? WhatsApp ${ORGANIZER.phone} · ${ORGANIZER.email}</p>
</td></tr></table></td></tr></table></body></html>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM?.trim() || "AI-BID 2027 <billets@ai-bidder.com>",
    to: order.buyer_email,
    replyTo: ORGANIZER.email,
    subject: n > 1 ? `Vos ${n} billets AI-BID 2027 — ${orderNumber(order.number)}` : `Votre billet AI-BID 2027 — ${orderNumber(order.number)}`,
    html,
    attachments: [{ filename: `AI-BID-2027-${orderNumber(order.number)}.pdf`, content: Buffer.from(pdf) }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
