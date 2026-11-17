import { NextResponse } from "next/server";
import { adminLabel } from "@/lib/server/admin";
import { parseQrPayload } from "@/lib/server/codes";
import { db, orderNumber } from "@/lib/server/supabase";
import { tierById } from "@/lib/event";


type Result =
  | { result: "ok" | "already"; code: string; holder: string; tier: string; tierName: string; order: string; checkedInAt: string; by: string | null }
  | { result: "invalid" | "unpaid" | "unknown"; code: string; message: string };

/**
 * Contrôle d'un billet à l'entrée.
 * - `qr` : contenu brut scanné (code + signature) → vérifié cryptographiquement ;
 * - `code` : saisie manuelle du n° de billet (si le QR est illisible).
 * `dryRun` : consulter sans valider l'entrée.
 */
export async function POST(req: Request) {
  const by = await adminLabel();
  if (!by) return NextResponse.json({ error: "Session expirée" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { qr?: string; code?: string; dryRun?: boolean };
  let code: string;
  if (body.qr) {
    const p = parseQrPayload(body.qr);
    if (!p.valid) return NextResponse.json<Result>({ result: "invalid", code: p.code, message: "QR code non reconnu : ce n'est pas un billet AI-BID 2027 valide." });
    code = p.code;
  } else if (body.code) {
    code = body.code.trim().toUpperCase();
  } else {
    return NextResponse.json({ error: "Code manquant" }, { status: 400 });
  }

  const { data: t } = await db()
    .from("tickets")
    .select("id, code, tier, holder_name, checked_in_at, checked_in_by, orders!inner(number, status)")
    .eq("code", code)
    .maybeSingle<{ id: string; code: string; tier: string; holder_name: string; checked_in_at: string | null; checked_in_by: string | null; orders: { number: number; status: string } }>();

  if (!t) return NextResponse.json<Result>({ result: "unknown", code, message: "Aucun billet avec ce numéro." });
  if (t.orders.status !== "paid") return NextResponse.json<Result>({ result: "unpaid", code, message: "Billet non payé : la commande n'a pas été réglée." });

  const base = { code: t.code, holder: t.holder_name, tier: t.tier, tierName: tierById(t.tier)?.name ?? t.tier, order: orderNumber(t.orders.number) };
  if (t.checked_in_at) {
    return NextResponse.json<Result>({ result: "already", ...base, checkedInAt: t.checked_in_at, by: t.checked_in_by });
  }
  if (body.dryRun) return NextResponse.json({ result: "valid", ...base });

  const now = new Date().toISOString();
  const { data: upd } = await db().from("tickets").update({ checked_in_at: now, checked_in_by: by }).eq("id", t.id).is("checked_in_at", null).select("checked_in_at, checked_in_by");
  if (!upd?.length) {
    const { data: again } = await db().from("tickets").select("checked_in_at, checked_in_by").eq("id", t.id).single();
    return NextResponse.json<Result>({ result: "already", ...base, checkedInAt: again?.checked_in_at ?? now, by: again?.checked_in_by ?? null });
  }
  return NextResponse.json<Result>({ result: "ok", ...base, checkedInAt: now, by });
}
