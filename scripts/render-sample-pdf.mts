// Génère un PDF d'exemple (sans base ni paiement) : npx tsx --conditions=react-server scripts/render-sample-pdf.mts out.pdf
import { writeFile } from "fs/promises";
process.env.TICKET_SECRET ??= "dev-secret";
const { generateOrderPdf } = await import("../src/lib/server/ticket-pdf");
const order = {
  id: "00000000-0000-0000-0000-000000000000", number: 42, access_token: "x", status: "paid" as const,
  buyer_name: "Aïcha Dossou-Yovo", buyer_email: "aicha@exemple.bj", buyer_phone: "+229 01 97 00 00 00",
  buyer_company: "BTP Ouémé Construction SARL", amount: 170000, fees: 2550,
  fedapay_transaction_id: "308412", fedapay_reference: "trx_k2Ld9_1739", paid_at: new Date().toISOString(),
  email_sent_at: null, created_at: new Date().toISOString(),
};
const mk = (i: number, tier: "essentiel" | "pro" | "premium", name: string, price: number, code: string) =>
  ({ id: String(i), order_id: order.id, code, tier, holder_name: name, price, position: i, checked_in_at: null, checked_in_by: null });
const tickets = [
  mk(1, "premium", "Aïcha Dossou-Yovo", 100000, "AIB27-PRM-7K3M9Q"),
  mk(2, "pro", "Koffi Mensah", 50000, "AIB27-PRO-H4TQ2W"),
  mk(3, "essentiel", "Rachidatou Bello", 20000, "AIB27-ESS-9XPZ5C"),
];
await writeFile(process.argv[2] ?? "sample.pdf", await generateOrderPdf(order, tickets));
console.log("ok");
