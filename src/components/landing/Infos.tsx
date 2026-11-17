import { EVENT, FAQ, ORGANIZER } from "@/lib/event";

export function Infos() {
  return (
    <section id="infos" className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-none tracking-[-0.02em] text-navy-700">
            Infos pratiques
          </h2>
          <dl className="mt-10 divide-y divide-navy-100 border-y border-navy-100">
            {[
              ["Date", EVENT.datesLabel, "La masterclass, ouverte à tous les billets"],
              ["Lieu", EVENT.venue, EVENT.city],
              ["Horaires", EVENT.hoursShort, "Accueil dès 08h00 · ouverture à 09h00"],
              ["Formation (Pro & Premium)", EVENT.training.datesLabel, `${EVENT.training.hours} · ${EVENT.training.venue}`],
              ["Levée de fonds (Premium)", EVENT.fundraising.datesLabel, `${EVENT.fundraising.hours} · séance réservée aux tickets Premium`],
            ].map(([k, v, d]) => (
              <div key={k} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted sm:pt-1">{k}</dt>
                <dd>
                  <p className="font-display text-xl font-bold text-navy-700">{v}</p>
                  <p className="mt-0.5 text-muted">{d}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted">Lieu et horaires provisoires : ils seront confirmés par email à tous les participants.</p>
          <a
            href={`${ORGANIZER.whatsapp}?text=${encodeURIComponent("Bonjour, j'ai une question sur AI-BID 2027.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#1FAF55] px-6 py-3.5 font-display font-bold text-white transition hover:bg-[#178F45]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z" />
            </svg>
            Une question ? Écrivez-nous
          </a>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-navy-700">Questions fréquentes</h3>
          <div className="mt-6 divide-y divide-navy-100 border-y border-navy-100">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold text-ink">
                  {f.q}
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
