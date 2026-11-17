"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROGRAMME, tierById, type TierId } from "@/lib/event";

function OnlyBadge({ only }: { only: TierId[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {only.map((id) => {
        const t = tierById(id)!;
        return (
          <span key={id} className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: t.color, color: t.ink }}>
            {t.name.replace("Ticket ", "")}
          </span>
        );
      })}
    </span>
  );
}

export function Programme() {
  const [active, setActive] = useState("evenement");
  const day = PROGRAMME.find((d) => d.id === active)!;

  return (
    <section id="programme" className="grain relative overflow-hidden bg-navy-800 py-24 text-white sm:py-32">
      <div aria-hidden className="absolute -right-32 -top-48 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(254,114,0,0.35),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black leading-none tracking-[-0.02em]">Le programme</h2>
            <p className="mt-4 max-w-[52ch] text-lg text-navy-200">
              Une semaine de formation, la masterclass le samedi, puis la séance de levée de fonds le dimanche. Programme provisoire, les intervenants seront annoncés prochainement.
            </p>
          </div>
        </div>

        {/* Frise : la formation précède l'événement */}
        <div role="tablist" aria-label="Jours du programme" className="mt-14 grid gap-3 sm:grid-cols-3">
          {PROGRAMME.map((d) => {
            const on = d.id === active;
            return (
              <button
                key={d.id}
                role="tab"
                id={`tab-${d.id}`}
                aria-selected={on}
                aria-controls={`panel-${d.id}`}
                onClick={() => setActive(d.id)}
                className={`group relative rounded-2xl p-5 text-left transition-colors ${
                  on ? "bg-white text-ink" : "bg-white/[0.06] text-white ring-1 ring-inset ring-white/10 hover:bg-white/10"
                }`}
              >
                <span className={`text-sm ${on ? "text-muted" : "text-navy-300"}`}>{d.tag}</span>
                <span className="mt-1 block font-display text-2xl font-black tracking-tight sm:text-3xl">{d.date}</span>
                <span className={`mt-1 block text-sm font-medium ${on ? "text-orange-600" : "text-gold-300"}`}>{d.weekday}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={day.id}
              role="tabpanel"
              id={`panel-${day.id}`}
              aria-labelledby={`tab-${day.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid gap-10 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <h3 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{day.title}</h3>
                {day.intro && <p className="mt-4 max-w-[38ch] leading-relaxed text-navy-200">{day.intro}</p>}
                {day.only && (
                  <div className="mt-5">
                    <OnlyBadge only={day.only} />
                  </div>
                )}
              </div>
              <ol className="lg:col-span-8">
                {day.slots.map((s) => (
                  <li key={s.time + s.title} className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-white/12 py-5 sm:grid-cols-[7rem_1fr]">
                    <span className="font-display text-lg font-bold tabular-nums text-gold-300">{s.time}</span>
                    <div>
                      <p className="font-display text-lg font-semibold leading-snug sm:text-xl">{s.title}</p>
                      {s.detail && <p className="mt-1 text-navy-200">{s.detail}</p>}
                      {s.only && (
                        <div className="mt-2">
                          <OnlyBadge only={s.only} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
