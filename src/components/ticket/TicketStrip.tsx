import type { CSSProperties, ReactNode } from "react";
import { EVENT, formatFcfa, type Tier } from "@/lib/event";

/**
 * Le billet, version paysage — même dessin que le PDF.
 * Toutes les tailles sont en `cqw` : le billet se met à l'échelle comme un
 * objet, quelle que soit sa largeur (hero, confirmation, mobile).
 * Les encoches sont de vrais trous (mask), visibles sur n'importe quel fond.
 */
export function TicketStrip({
  tier,
  holder,
  company,
  code,
  qr,
  orderNo,
  paidAt,
  index,
  className = "",
  style,
}: {
  tier: Tier;
  holder: string;
  company?: string | null;
  code: string;
  /** SVG du QR code (markup), ou null pour un motif d'exemple. */
  qr: ReactNode;
  orderNo?: string;
  paidAt?: string;
  index?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const CUT = 73.6; // % de la largeur où se trouve la perforation
  const hole = "2.1cqw";
  const mask = [
    `radial-gradient(circle at ${CUT}% 0, transparent ${hole}, #000 calc(${hole} + 0.5px))`,
    `radial-gradient(circle at ${CUT}% 100%, transparent ${hole}, #000 calc(${hole} + 0.5px))`,
  ].join(",");
  const premium = tier.id === "premium";

  return (
    <div className={`@container w-full ${className}`} style={style}>
      <div
        className="relative flex aspect-[806/304] w-full overflow-hidden text-white shadow-[0_2cqw_5cqw_-1cqw_rgba(0,15,34,0.55)]"
        style={{
          borderRadius: "1.4cqw",
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        {/* Corps */}
        <div className="relative h-full overflow-hidden bg-navy-900" style={{ width: `${CUT}%` }}>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#001A38_0%,#00254D_55%,#003366_100%)]" />
          <div className="absolute -left-[8cqw] -top-[18cqw] h-[36cqw] w-[46cqw] rounded-full bg-orange-500/35 blur-[7cqw]" />
          <div className="absolute -bottom-[20cqw] right-[2cqw] h-[30cqw] w-[34cqw] rounded-full bg-[#C8261B]/25 blur-[7cqw]" />
          {/* Filigrane : le « 27 » en creux, comme sur un billet imprimé */}
          <span
            aria-hidden
            className="absolute -bottom-[7cqw] right-[1cqw] font-display font-black leading-none text-white/[0.05]"
            style={{ fontSize: "30cqw", letterSpacing: "-1.5cqw" }}
          >
            27
          </span>
          <div className="absolute inset-0 rounded-l-[1.4cqw] ring-1 ring-inset ring-white/10" />

          {/* Bande de formule */}
          <div className="absolute inset-y-0 left-0 flex w-[4.2cqw] items-center justify-center" style={{ background: tier.color }}>
            <span
              className="font-display whitespace-nowrap font-black"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "1.55cqw", letterSpacing: "0.5cqw", color: tier.ink }}
            >
              TICKET {tier.short}
            </span>
          </div>

          <div className="relative flex h-full flex-col pl-[7.4cqw] pr-[2.6cqw] pt-[2.6cqw] pb-[2.4cqw]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.8cqw]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-horizontal-dark.svg" alt="e-BIDDER" style={{ height: "2.9cqw" }} />
                <span className="text-navy-200" style={{ fontSize: "1.1cqw" }}>
                  présente
                </span>
              </div>
              {index && (
                <span className="font-display font-semibold text-navy-200" style={{ fontSize: "1.1cqw" }}>
                  {index}
                </span>
              )}
            </div>

            <div className="mt-[1.8cqw] flex items-end gap-[1cqw]">
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-gold-300" style={{ fontSize: "1.5cqw" }}>
                  Masterclass
                </p>
                <p className="font-display font-black leading-[0.9]" style={{ fontSize: "6.4cqw", letterSpacing: "-0.12cqw" }}>
                  AI-BID 2027
                </p>
                <p className="mt-[1.1cqw] max-w-[46cqw] font-medium leading-snug text-navy-100" style={{ fontSize: "1.25cqw" }}>
                  {EVENT.theme}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-navy-300" style={{ fontSize: "1cqw" }}>
                Participant
              </p>
              <p className="truncate font-display font-extrabold leading-tight" style={{ fontSize: "2.6cqw" }}>
                {holder}
              </p>
              {company && (
                <p className="truncate text-navy-200" style={{ fontSize: "1.15cqw" }}>
                  {company}
                </p>
              )}
              <div className="mt-[1.4cqw] flex gap-[2.6cqw] border-t border-white/20 pt-[1.2cqw]">
                {[
                  ["Dates", EVENT.datesLabel],
                  ["Lieu", `${EVENT.venueShort}, Cotonou`],
                  ["Horaires", "08h30 – 17h30"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-navy-300" style={{ fontSize: "0.95cqw" }}>
                      {k}
                    </p>
                    <p className="font-display font-semibold whitespace-nowrap" style={{ fontSize: "1.3cqw" }}>
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Talon */}
        <div className="relative flex h-full flex-1 flex-col bg-paper text-ink" style={{ padding: "2.2cqw 2.2cqw 1.4cqw" }}>
          <div className="absolute inset-x-0 top-0" style={{ height: "1cqw", background: tier.color }} />
          <div className="absolute inset-y-[2.6cqw] left-0 border-l-[0.25cqw] border-dotted border-navy-300/70" />
          <p className="font-display font-extrabold leading-none" style={{ fontSize: "1.6cqw", color: premium ? tier.color : undefined }}>
            {tier.name}
          </p>
          <p className="mt-[0.5cqw] font-display font-semibold" style={{ fontSize: "1.25cqw", color: tier.id === "pro" ? "#E05F00" : "#5B6B82" }}>
            {formatFcfa(tier.price)}
          </p>
          <div className="mx-auto mt-[1.4cqw] aspect-square w-[14.2cqw] text-ink [&_svg]:h-full [&_svg]:w-full">{qr}</div>
          <p className="mt-[1cqw] text-center font-sans font-bold tracking-wide" style={{ fontSize: "1.3cqw" }}>
            {code}
          </p>
          {orderNo && (
            <div className="mt-[1cqw] space-y-[0.3cqw] text-muted" style={{ fontSize: "0.95cqw" }}>
              <p className="flex justify-between">
                <span>Reçu n°</span>
                <span className="font-medium text-ink">{orderNo}</span>
              </p>
              {paidAt && (
                <p className="flex justify-between">
                  <span>Payé le</span>
                  <span className="font-medium text-ink">{paidAt}</span>
                </p>
              )}
            </div>
          )}
          <p className="mt-auto text-center text-muted" style={{ fontSize: "0.85cqw" }}>
            Billet nominatif · valable une fois
          </p>
        </div>
      </div>
    </div>
  );
}

/** Motif de QR décoratif (billet d'exemple) — pas un vrai code. */
export function SampleQr() {
  // Motif fixe 21×21 avec les trois repères d'un QR.
  const n = 21;
  const cells: [number, number][] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.52) cells.push([x, y]);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  );
}

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#FBF8F3" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
}
