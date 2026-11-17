"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    j: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    min: Math.floor((ms / 60_000) % 60),
  };
}

/** Compte à rebours (rendu côté client uniquement pour éviter un écart d'hydratation). */
export function Countdown({ target }: { target: string }) {
  const t = new Date(target).getTime();
  const [v, setV] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setV(diff(t));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [t]);

  const cells: [string, string][] = v
    ? [
        [String(v.j), v.j > 1 ? "jours" : "jour"],
        [String(v.h).padStart(2, "0"), "heures"],
        [String(v.min).padStart(2, "0"), "minutes"],
      ]
    : [
        ["–", "jours"],
        ["–", "heures"],
        ["–", "minutes"],
      ];

  return (
    <div className="mt-10 flex items-end justify-center gap-6 sm:mt-12 lg:justify-start lg:pl-6" aria-live="off">
      <p className="max-w-[9ch] text-sm leading-tight text-navy-200">Ouverture des portes dans</p>
      {cells.map(([n, l]) => (
        <div key={l} className="text-center">
          <p className="font-display text-4xl font-black tabular-nums leading-none text-white sm:text-5xl">{n}</p>
          <p className="mt-1 text-xs text-navy-200">{l}</p>
        </div>
      ))}
    </div>
  );
}
