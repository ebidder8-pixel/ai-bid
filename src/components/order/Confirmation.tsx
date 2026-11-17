"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ORGANIZER, formatFcfa, tierById, type TierId } from "@/lib/event";
import { TicketStrip } from "@/components/ticket/TicketStrip";

interface OrderView {
  status: "pending" | "paid" | "failed" | "cancelled";
  number: string;
  buyer: { name: string; email: string; company: string | null };
  amount: number;
  fees: number | null;
  paidAt: string | null;
  reference: string | null;
  tickets: { code: string; tier: TierId; holder: string; price: number; qr: string | null }[];
}

function Qr({ value }: { value: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0F2340", light: "#FBF8F3" } }).then(setSvg);
  }, [value]);
  return <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

const POLL_MS = 3000;
const POLL_MAX = 60; // ~3 minutes

export function Confirmation({ orderId }: { orderId: string }) {
  const token = useSearchParams().get("t");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}?t=${encodeURIComponent(token ?? "")}`, { cache: "no-store" });
        if (res.status === 404) return setNotFound(true);
        const data = (await res.json()) as OrderView;
        if (stop) return;
        setOrder(data);
        if (data.status !== "pending") return;
      } catch {
        /* réseau : on réessaie */
      }
      if (++tries.current >= POLL_MAX) return setGaveUp(true);
      timer = setTimeout(load, POLL_MS);
    };
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [orderId, token]);

  if (notFound) {
    return (
      <Panel title="Commande introuvable">
        Ce lien n&apos;est pas valide ou a été modifié. Utilisez le lien reçu par email, ou contactez-nous sur WhatsApp au {ORGANIZER.phone}.
      </Panel>
    );
  }

  if (!order || order.status === "pending") {
    return (
      <Panel title={gaveUp ? "Paiement en cours de confirmation" : "Confirmation du paiement…"} spinner={!gaveUp}>
        {gaveUp
          ? "FedaPay n'a pas encore confirmé votre paiement. Dès qu'il sera validé, vous recevrez vos billets par email. Vous pouvez aussi recharger cette page dans quelques minutes."
          : "Nous vérifions votre paiement auprès de FedaPay. Cela prend en général quelques secondes, ne fermez pas cette page."}
      </Panel>
    );
  }

  if (order.status !== "paid") {
    return (
      <Panel title={order.status === "failed" ? "Paiement refusé" : "Paiement annulé"}>
        Aucun montant n&apos;a été débité. Vous pouvez recommencer votre commande.
        <Link href="/#billets" className="mt-6 inline-block rounded-full bg-orange-500 px-7 py-3.5 font-display font-bold text-white hover:bg-orange-600">
          Choisir à nouveau mes billets
        </Link>
      </Panel>
    );
  }

  const paidDate = order.paidAt ? new Date(order.paidAt).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo" }) : undefined;
  const pdfHref = `/api/orders/${orderId}/pdf?t=${encodeURIComponent(token ?? "")}`;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="no-print flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#1E9E5A]/10 px-3 py-1 text-sm font-bold text-[#167A45]">
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
              <path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Paiement confirmé
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-navy-700 sm:text-5xl">
            {order.tickets.length > 1 ? `Vos ${order.tickets.length} billets sont prêts` : "Votre billet est prêt"}
          </h1>
          <p className="mt-3 max-w-[56ch] text-lg text-muted">
            Envoyé{order.tickets.length > 1 ? "s" : ""} à <strong className="text-ink">{order.buyer.email}</strong> avec le reçu. Présentez le QR code à
            l&apos;entrée, imprimé ou sur votre téléphone.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a href={pdfHref} className="rounded-full bg-orange-500 px-6 py-3.5 font-display font-bold text-white transition hover:bg-orange-600">
            Télécharger le PDF
          </a>
          <button type="button" onClick={() => window.print()} className="rounded-full bg-white px-6 py-3.5 font-display font-bold text-navy-700 ring-1 ring-navy-100 hover:bg-navy-50">
            Imprimer
          </button>
        </div>
      </div>

      <ol className="mt-12 space-y-8">
        {order.tickets.map((t, i) => (
          <li key={t.code} className="break-inside-avoid">
            <MobilePass
              tierId={t.tier}
              holder={t.holder}
              code={t.code}
              qr={t.qr ? <Qr value={t.qr} /> : null}
              index={`${i + 1}/${order.tickets.length}`}
            />
            <TicketStrip
              className="hidden sm:block print:block"
              tier={tierById(t.tier)!}
              holder={t.holder}
              company={order.buyer.company}
              code={t.code}
              qr={t.qr ? <Qr value={t.qr} /> : null}
              orderNo={order.number}
              paidAt={paidDate}
              index={`${i + 1}/${order.tickets.length}`}
            />
          </li>
        ))}
      </ol>

      <div className="no-print mt-12 grid gap-6 rounded-3xl bg-white p-7 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted">Reçu n°</p>
          <p className="font-display text-lg font-bold text-navy-700">{order.number}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Montant payé</p>
          <p className="font-display text-lg font-bold text-navy-700">{formatFcfa(order.amount + (order.fees ?? 0))}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Référence FedaPay</p>
          <p className="font-display text-lg font-bold text-navy-700">{order.reference ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

/** Version téléphone : QR en grand, lisible par le scanner à l'entrée. */
function MobilePass({ tierId, holder, code, qr, index }: { tierId: TierId; holder: string; code: string; qr: React.ReactNode; index: string }) {
  const tier = tierById(tierId)!;
  return (
    <div className="overflow-hidden rounded-3xl bg-paper shadow-[0_20px_40px_-20px_rgba(0,26,56,0.5)] sm:hidden print:hidden">
      <div className="relative bg-navy-800 px-6 pb-5 pt-5 text-white">
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: tier.color }} />
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-gold-300">AI-BID 2027 · 26–28 fév.</p>
          <p className="text-sm text-navy-200">{index}</p>
        </div>
        <p className="mt-3 truncate font-display text-2xl font-extrabold">{holder}</p>
        <p className="mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-bold" style={{ background: tier.color, color: tier.ink }}>
          {tier.name}
        </p>
      </div>
      <div aria-hidden className="perf-h mx-4 h-[6px] [--notch:#E7ECF3]" />
      <div className="px-6 pb-6 pt-5 text-center">
        <div className="mx-auto aspect-square w-full max-w-[260px] [&_svg]:h-full [&_svg]:w-full">{qr}</div>
        <p className="mt-4 font-sans text-lg font-bold tracking-wide text-ink">{code}</p>
        <p className="mt-1 text-xs text-muted">Billet nominatif · valable une fois</p>
      </div>
    </div>
  );
}

function Panel({ title, children, spinner }: { title: string; children: React.ReactNode; spinner?: boolean }) {
  return (
    <div className="mx-auto max-w-xl px-4 text-center">
      {spinner && <div aria-hidden className="mx-auto mb-8 h-12 w-12 animate-spin rounded-full border-4 border-navy-100 border-t-orange-500" />}
      <h1 className="font-display text-3xl font-black tracking-tight text-navy-700 sm:text-4xl">{title}</h1>
      <div className="mt-4 text-lg leading-relaxed text-muted" aria-live="polite">
        {children}
      </div>
    </div>
  );
}
