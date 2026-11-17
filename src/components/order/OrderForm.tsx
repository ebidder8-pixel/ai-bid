"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MAX_TICKETS_PER_ORDER, TIERS, formatFcfa, tierById, type TierId } from "@/lib/event";

type Line = { key: string; tier: TierId; holder: string };

let uid = 0;
const newLine = (tier: TierId): Line => ({ key: `l${++uid}`, tier, holder: "" });

function initialLines(params: URLSearchParams): Line[] {
  const lines: Line[] = [];
  for (const t of TIERS) {
    const n = Math.max(0, Math.min(MAX_TICKETS_PER_ORDER, parseInt(params.get(t.id) ?? "0", 10) || 0));
    // Clés déterministes au premier rendu (identiques serveur / navigateur).
    for (let i = 0; i < n && lines.length < MAX_TICKETS_PER_ORDER; i++) lines.push({ key: `init-${lines.length}`, tier: t.id, holder: "" });
  }
  return lines.length ? lines : [{ key: "init-0", tier: "pro", holder: "" }];
}

const input =
  "mt-1.5 block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base text-ink shadow-sm ring-1 ring-inset ring-navy-100 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500";

export function OrderForm() {
  const params = useSearchParams();
  const [lines, setLines] = useState<Line[]>(() => initialLines(params));
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", company: "" });
  const [selfIsFirst, setSelfIsFirst] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // L'acheteur est le premier participant par défaut.
  const holderOf = (l: Line, i: number) => (i === 0 && selfIsFirst ? buyer.name : l.holder);

  const total = useMemo(() => lines.reduce((s, l) => s + tierById(l.tier)!.price, 0), [lines]);
  const counts = useMemo(() => TIERS.map((t) => ({ tier: t, n: lines.filter((l) => l.tier === t.id).length })), [lines]);

  const add = (tier: TierId) => lines.length < MAX_TICKETS_PER_ORDER && setLines((ls) => [...ls, newLine(tier)]);
  const removeOne = (tier: TierId) =>
    setLines((ls) => {
      const idx = ls.map((l) => l.tier).lastIndexOf(tier);
      if (idx < 0 || ls.length === 1) return ls;
      return ls.filter((_, i) => i !== idx);
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const missing = lines.findIndex((l, i) => holderOf(l, i).trim().length < 3);
    if (missing >= 0) {
      setError(`Indiquez le nom complet du participant n°${missing + 1}.`);
      document.getElementById(`holder-${lines[missing].key}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer, tickets: lines.map((l, i) => ({ tier: l.tier, holder: holderOf(l, i) })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.paymentUrl) throw new Error(data.error || "Le paiement n'a pas pu démarrer. Réessayez.");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement n'a pas pu démarrer. Réessayez.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8" noValidate>
      <div className="lg:col-span-7">
        <Link href="/#billets" className="text-sm font-medium text-navy-600 hover:text-orange-600">
          ← Revenir aux formules
        </Link>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-navy-700 sm:text-5xl">Vos billets</h1>
        <p className="mt-3 max-w-[52ch] text-lg text-muted">
          Vos coordonnées servent à vous envoyer les billets et le reçu. Chaque billet est nominatif.
        </p>

        <fieldset className="mt-10 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <legend className="sr-only">Vos coordonnées</legend>
          <h2 className="font-display text-xl font-extrabold text-navy-700">Vos coordonnées</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-ink">Nom complet</span>
              <input required autoComplete="name" className={input} value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Prénom et nom" />
            </label>
            <label>
              <span className="text-sm font-medium text-ink">Email</span>
              <input required type="email" autoComplete="email" inputMode="email" className={input} value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="vous@exemple.bj" />
            </label>
            <label>
              <span className="text-sm font-medium text-ink">Téléphone (WhatsApp)</span>
              <input required type="tel" autoComplete="tel" inputMode="tel" className={input} value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} placeholder="+229 01 00 00 00 00" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-ink">
                Entreprise <span className="font-normal text-muted">(facultatif, figure sur le reçu)</span>
              </span>
              <input autoComplete="organization" className={input} value={buyer.company} onChange={(e) => setBuyer({ ...buyer, company: e.target.value })} placeholder="Raison sociale" />
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <legend className="sr-only">Participants</legend>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy-700">Participants</h2>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={selfIsFirst} onChange={(e) => setSelfIsFirst(e.target.checked)} />
              Je participe moi-même
            </label>
          </div>
          <ol className="mt-6 space-y-4">
            {lines.map((l, i) => {
              const t = tierById(l.tier)!;
              const locked = i === 0 && selfIsFirst;
              return (
                <li key={l.key} className="flex items-stretch overflow-hidden rounded-2xl ring-1 ring-navy-100">
                  <div className="flex w-12 shrink-0 items-center justify-center font-display text-sm font-black" style={{ background: t.color, color: t.ink }}>
                    {i + 1}
                  </div>
                  <label className="flex-1 px-4 py-3">
                    <span className="text-xs font-bold" style={{ color: t.id === "essentiel" ? t.color : t.id === "pro" ? "#E05F00" : t.color }}>
                      {t.name}
                    </span>
                    <input
                      id={`holder-${l.key}`}
                      className="mt-0.5 block w-full border-0 bg-transparent p-0 text-base text-ink placeholder:text-navy-300 focus:outline-none focus:ring-0 disabled:text-ink"
                      value={holderOf(l, i)}
                      disabled={locked}
                      placeholder="Nom complet du participant"
                      onChange={(e) => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, holder: e.target.value } : x)))}
                    />
                  </label>
                </li>
              );
            })}
          </ol>
        </fieldset>
      </div>

      {/* Récapitulatif façon reçu */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-3xl bg-paper shadow-[0_30px_60px_-30px_rgba(0,26,56,0.45)]">
            <div className="bg-navy-800 px-7 py-6 text-white">
              <p className="font-display text-sm font-semibold text-gold-300">Récapitulatif</p>
              <p className="mt-1 font-display text-2xl font-black">AI-BID 2027</p>
              <p className="text-sm text-navy-200">26 – 28 février 2027 · Cotonou</p>
            </div>
            <div className="px-7 py-6">
              <ul className="space-y-4">
                {counts.map(({ tier, n }) => (
                  <li key={tier.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-1.5 rounded-full" style={{ background: tier.color }} />
                      <div>
                        <p className="font-display font-bold text-ink">{tier.name}</p>
                        <p className="text-sm text-muted">{formatFcfa(tier.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removeOne(tier.id)} disabled={n === 0 || lines.length === 1} aria-label={`Retirer un ${tier.name}`} className="h-9 w-9 rounded-full bg-white text-lg font-bold text-navy-700 ring-1 ring-navy-100 disabled:opacity-30">
                        −
                      </button>
                      <span className="w-6 text-center font-display text-lg font-bold tabular-nums">{n}</span>
                      <button type="button" onClick={() => add(tier.id)} disabled={lines.length >= MAX_TICKETS_PER_ORDER} aria-label={`Ajouter un ${tier.name}`} className="h-9 w-9 rounded-full bg-white text-lg font-bold text-navy-700 ring-1 ring-navy-100 disabled:opacity-30">
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div aria-hidden className="perf-h mx-4 h-[6px] [--notch:#E7ECF3]" />
            <div className="px-7 py-6">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">
                  Total · {lines.length} billet{lines.length > 1 ? "s" : ""}
                </span>
                <span className="font-display text-3xl font-black tabular-nums text-navy-700">{formatFcfa(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Des frais de paiement Mobile Money peuvent s&apos;ajouter, affichés par FedaPay avant validation.</p>

              {error && (
                <p role="alert" className="mt-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-sm font-medium text-[#A4231A]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="mt-6 w-full rounded-full bg-orange-500 py-4 font-display text-lg font-bold text-white shadow-[0_10px_30px_-10px_rgba(254,114,0,0.8)] transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70"
              >
                {sending ? "Ouverture du paiement…" : `Payer ${formatFcfa(total)}`}
              </button>
              <p className="mt-4 text-center text-xs text-muted">Paiement sécurisé par FedaPay · Mobile Money ou carte bancaire</p>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
