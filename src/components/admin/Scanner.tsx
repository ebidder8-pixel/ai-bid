"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TIERS, formatFcfa } from "@/lib/event";

type Result =
  | { result: "ok" | "already"; code: string; holder: string; tier: string; tierName: string; order: string; checkedInAt: string; by: string | null }
  | { result: "invalid" | "unpaid" | "unknown"; code: string; message: string };

type Stat = { tier: string; sold: number; checked_in: number; revenue: number };

const STYLE: Record<Result["result"], { bg: string; title: string }> = {
  ok: { bg: "bg-[#1E9E5A]", title: "Entrée validée" },
  already: { bg: "bg-[#E3961C]", title: "Déjà scanné" },
  invalid: { bg: "bg-[#C8261B]", title: "Billet invalide" },
  unpaid: { bg: "bg-[#C8261B]", title: "Billet non payé" },
  unknown: { bg: "bg-[#C8261B]", title: "Billet inconnu" },
};

const time = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Porto-Novo" });

export function Scanner({ label }: { label: string }) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);
  const last = useRef<{ v: string; t: number }>({ v: "", t: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [manual, setManual] = useState("");
  const [camError, setCamError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.status === 401) return router.refresh();
    if (res.ok) setStats((await res.json()).stats ?? []);
  }, [router]);

  const check = useCallback(
    async (payload: { qr?: string; code?: string }) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await fetch("/api/admin/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.status === 401) return router.refresh();
        const r = (await res.json()) as Result;
        setResult(r);
        navigator.vibrate?.(r.result === "ok" ? 80 : [60, 60, 60]);
        if (r.result === "ok") loadStats();
      } finally {
        busy.current = false;
      }
    },
    [loadStats, router],
  );

  useEffect(() => {
    const firstStats = setTimeout(loadStats, 0);
    let scanner: { start: () => Promise<void>; destroy: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const { default: QrScanner } = await import("qr-scanner");
      if (cancelled || !video.current) return;
      scanner = new QrScanner(
        video.current,
        (res: { data: string }) => {
          const now = Date.now();
          // Ignore le même code relu dans les 4 secondes.
          if (res.data === last.current.v && now - last.current.t < 4000) return;
          last.current = { v: res.data, t: now };
          check({ qr: res.data });
        },
        { preferredCamera: "environment", highlightScanRegion: true, maxScansPerSecond: 4, returnDetailedScanResult: true },
      );
      scanner.start().catch(() => setCamError("Caméra indisponible. Autorisez l'accès à la caméra, ou saisissez le numéro du billet."));
    })();
    return () => {
      cancelled = true;
      clearTimeout(firstStats);
      scanner?.destroy();
    };
  }, [check, loadStats]);

  const totals = stats.reduce((a, s) => ({ sold: a.sold + Number(s.sold), inside: a.inside + Number(s.checked_in), revenue: a.revenue + Number(s.revenue) }), { sold: 0, inside: 0, revenue: 0 });

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-black">Contrôle AI-BID 2027</p>
          <p className="text-sm text-navy-300">Poste : {label}</p>
        </div>
        <button
          className="rounded-full px-4 py-2 text-sm text-navy-200 ring-1 ring-white/20"
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE" });
            router.refresh();
          }}
        >
          Déconnexion
        </button>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-display text-2xl font-black tabular-nums">{totals.inside}</p>
          <p className="text-xs text-navy-300">entrés</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-display text-2xl font-black tabular-nums">{totals.sold}</p>
          <p className="text-xs text-navy-300">billets vendus</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="font-display text-lg font-black tabular-nums leading-8">{formatFcfa(totals.revenue).replace(" FCFA", "")}</p>
          <p className="text-xs text-navy-300">FCFA encaissés</p>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs text-navy-300">
        {TIERS.map((t) => {
          const s = stats.find((x) => x.tier === t.id);
          return (
            <span key={t.id} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              {t.short.charAt(0) + t.short.slice(1).toLowerCase()} {s?.checked_in ?? 0}/{s?.sold ?? 0}
            </span>
          );
        })}
      </div>

      <div className="relative mt-5 aspect-square overflow-hidden rounded-3xl bg-black">
        <video ref={video} className="h-full w-full object-cover" muted playsInline />
        {camError && <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-navy-200">{camError}</p>}
      </div>

      {result && (
        <button
          type="button"
          onClick={() => setResult(null)}
          className={`mt-5 rounded-3xl p-6 text-left ${STYLE[result.result].bg}`}
          aria-live="assertive"
        >
          <p className="font-display text-3xl font-black">{STYLE[result.result].title}</p>
          {"holder" in result ? (
            <>
              <p className="mt-3 font-display text-2xl font-bold">{result.holder}</p>
              <p className="mt-1 text-white/90">
                {result.tierName} · {result.code}
              </p>
              {result.result === "already" && (
                <p className="mt-2 font-medium">
                  Entré à {time(result.checkedInAt)}
                  {result.by ? ` (${result.by})` : ""}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-white/95">{result.message}</p>
          )}
          <p className="mt-4 text-sm text-white/75">Touchez pour effacer</p>
        </button>
      )}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) check({ code: manual.trim() });
          setManual("");
        }}
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value.toUpperCase())}
          placeholder="AIB27-PRO-XXXXXX"
          aria-label="Numéro du billet"
          autoCapitalize="characters"
          className="min-w-0 flex-1 rounded-full bg-white/10 px-5 py-3.5 font-medium tracking-wide text-white placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button className="rounded-full bg-orange-500 px-6 font-display font-bold hover:bg-orange-600">Vérifier</button>
      </form>
    </div>
  );
}
