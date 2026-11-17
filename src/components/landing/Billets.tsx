"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_TICKETS_PER_ORDER, TIERS, formatFcfa, type Tier, type TierId } from "@/lib/event";

type Cart = Record<TierId, number>;

function Stepper({ tier, value, onChange, max }: { tier: Tier; value: number; onChange: (n: number) => void; max: number }) {
  const dark = tier.id === "premium";
  const btn = `inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold transition disabled:opacity-30 ${
    dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-navy-50 text-navy-700 hover:bg-navy-100"
  }`;
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value === 0} aria-label={`Retirer un ${tier.name}`}>
        −
      </button>
      <output aria-live="polite" aria-label={`Nombre de ${tier.name}`} className="w-8 text-center font-display text-2xl font-bold tabular-nums">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Ajouter un ${tier.name}`}>
        +
      </button>
    </div>
  );
}

function TierTicket({ tier, qty, setQty, max }: { tier: Tier; qty: number; setQty: (n: number) => void; max: number }) {
  const premium = tier.id === "premium";
  const hole = "14px";
  // Encoches à la hauteur de la perforation (au-dessus du talon : 116px du bas).
  const mask = `radial-gradient(circle at 0 calc(100% - 116px), transparent ${hole}, #000 calc(${hole} + 0.5px)), radial-gradient(circle at 100% calc(100% - 116px), transparent ${hole}, #000 calc(${hole} + 0.5px))`;

  return (
    <article
      aria-labelledby={`tier-${tier.id}`}
      className={`relative flex flex-col overflow-hidden rounded-[22px] ${
        premium ? "bg-[#2A1150] text-white lg:-my-6" : "bg-white text-ink"
      } shadow-[0_30px_60px_-30px_rgba(0,26,56,0.45)] ${qty > 0 ? "ring-4" : "ring-0"}`}
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect", ["--tw-ring-color" as string]: tier.color }}
    >
      {/* En-tête de couleur */}
      <header className="relative overflow-hidden px-7 pb-7 pt-7" style={{ background: premium ? "linear-gradient(135deg,#4B2283,#2A1150)" : tier.color, color: "#fff" }}>
        {premium && <div aria-hidden className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-gold-300/30 blur-3xl" />}
        <p className="relative font-display text-sm font-bold" style={{ color: premium ? "#EFBB59" : "rgba(255,255,255,0.85)" }}>
          AI-BID 2027 · Cotonou
        </p>
        <h3 id={`tier-${tier.id}`} className="relative mt-3 font-display text-3xl font-black tracking-tight">
          {tier.name}
        </h3>
        <p className="relative mt-1 text-[0.95rem] text-white/85">{tier.pitch}</p>
        <p className="relative mt-6 font-display font-black leading-none tracking-tight" style={{ color: premium ? "#EFBB59" : "#fff" }}>
          <span className="text-5xl">{tier.price.toLocaleString("fr-FR")}</span>
          <span className="ml-2 text-lg font-bold">FCFA</span>
        </p>
      </header>

      {/* Inclus */}
      <div className="flex-1 px-7 py-7">
        <ul className="space-y-3">
          {tier.included.map((line) => (
            <li key={line} className="flex gap-3 text-[0.98rem] leading-snug">
              <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden>
                <circle cx="10" cy="10" r="10" fill={premium ? "#EFBB59" : tier.color} opacity={premium ? 1 : 0.14} />
                <path d="M6 10.4l2.6 2.5L14 7.5" fill="none" stroke={premium ? "#2A1150" : tier.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={premium ? "text-white/90" : "text-ink"}>{line}</span>
            </li>
          ))}
        </ul>
        <div className={`mt-6 rounded-2xl p-4 ${premium ? "bg-white/[0.07]" : "bg-gold-100/60"}`}>
          <p className={`font-display text-sm font-bold ${premium ? "text-gold-300" : "text-gold-500"}`}>{premium ? "Bonus Premium" : "Bonus"}</p>
          <ul className={`mt-1.5 space-y-1 text-[0.92rem] ${premium ? "text-white/85" : "text-navy-800"}`}>
            {tier.bonus.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Perforation + talon */}
      <div aria-hidden className={`perf-h mx-6 h-[6px] ${premium ? "[--notch:#140827]" : "[--notch:#DCE3EE]"}`} />
      <footer className="flex h-[110px] items-center justify-between gap-4 px-7">
        <div>
          <p className={`text-sm ${premium ? "text-white/70" : "text-muted"}`}>{qty > 0 ? "Sous-total" : "Combien de places ?"}</p>
          <p className="font-display text-lg font-bold tabular-nums">{qty > 0 ? formatFcfa(qty * tier.price) : "—"}</p>
        </div>
        <Stepper tier={tier} value={qty} onChange={setQty} max={max} />
      </footer>
    </article>
  );
}

export function Billets() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ essentiel: 0, pro: 0, premium: 0 });
  const count = cart.essentiel + cart.pro + cart.premium;
  const total = useMemo(() => TIERS.reduce((s, t) => s + cart[t.id] * t.price, 0), [cart]);

  const setQty = (id: TierId) => (n: number) =>
    setCart((c) => {
      const others = count - c[id];
      return { ...c, [id]: Math.max(0, Math.min(n, MAX_TICKETS_PER_ORDER - others)) };
    });

  const go = () => {
    const q = new URLSearchParams();
    TIERS.forEach((t) => cart[t.id] && q.set(t.id, String(cart[t.id])));
    router.push(`/commande?${q.toString()}`);
  };

  return (
    <section id="billets" className="relative bg-[#E7ECF3] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black leading-none tracking-[-0.02em] text-navy-700 lg:col-span-7">
            Choisissez vos billets
          </h2>
          <p className="max-w-[48ch] text-lg leading-relaxed text-muted lg:col-span-5">
            Tous les billets donnent accès aux trois jours et au livre «&nbsp;Comment gagner des marchés publics&nbsp;?&nbsp;». Vous pouvez
            en prendre plusieurs, de formules différentes, dans la même commande.
          </p>
        </div>

        <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-3 lg:gap-6">
          {TIERS.map((t) => (
            <TierTicket key={t.id} tier={t} qty={cart[t.id]} setQty={setQty(t.id)} max={MAX_TICKETS_PER_ORDER - (count - cart[t.id])} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Paiement sécurisé par FedaPay : Mobile Money (MTN, Moov, Celtiis) ou carte bancaire. Billet et reçu PDF envoyés par email.
        </p>
      </div>

      {/* Barre de commande */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="no-print fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full bg-navy-900 py-2.5 pl-6 pr-2.5 text-white shadow-[0_20px_50px_-10px_rgba(0,15,34,0.6)] ring-1 ring-white/10">
              <div className="min-w-0">
                <p className="truncate text-sm text-navy-200">
                  {TIERS.filter((t) => cart[t.id])
                    .map((t) => `${cart[t.id]} ${t.short.charAt(0) + t.short.slice(1).toLowerCase()}`)
                    .join(" · ")}
                </p>
                <p className="font-display text-lg font-black tabular-nums sm:text-xl">{formatFcfa(total)}</p>
              </div>
              <button
                type="button"
                onClick={go}
                className="shrink-0 rounded-full bg-orange-500 px-6 py-3.5 font-display text-base font-bold text-white transition hover:bg-orange-600 sm:px-8 sm:text-lg"
              >
                Continuer ({count})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
