import Link from "next/link";
import { EVENT, TIERS } from "@/lib/event";
import { TicketStrip, SampleQr } from "@/components/ticket/TicketStrip";
import { HeroTicket } from "./HeroTicket";
import { Countdown } from "./Countdown";

export function Hero() {
  const pro = TIERS[1];
  return (
    <section className="grain relative isolate overflow-hidden bg-navy-900 text-white">
      {/* Photo de salle + le feu du kakemono */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/salle.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_40%]" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,26,56,0.55)_0%,rgba(0,26,56,0.75)_55%,#001A38_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(200,38,27,0.85)_0%,rgba(254,114,0,0.45)_35%,transparent_65%)] mix-blend-multiply" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_8%_10%,rgba(254,114,0,0.55),transparent_70%)]" />

      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pb-24 lg:pt-32">
        <div className="lg:col-span-6">
          <p className="font-display text-base font-semibold text-gold-300 sm:text-lg">e-BIDDER présente</p>

          <h1 className="relative mt-14 sm:mt-20">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[0.62em] left-[0.12em] -rotate-6 font-script text-[clamp(3rem,9vw,6.5rem)] leading-none text-gold-300 drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
            >
              masterclass
            </span>
            <span className="sr-only">Masterclass </span>
            <span className="block font-display text-[clamp(4.2rem,24vw,10.5rem)] font-black leading-[0.86] tracking-[-0.035em]">
              AI-BID
              <br />
              2027
            </span>
          </h1>

          <p className="mt-8 max-w-[34ch] font-display text-xl font-semibold leading-snug text-white sm:text-2xl">{EVENT.tagline}.</p>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-navy-100 sm:text-lg">
            Une journée de masterclass à Cotonou pour découvrir concrètement comment l&apos;IA aide à analyser les DAO, préparer ses offres
            plus vite et réduire les erreurs.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
            <div>
              <dt className="text-sm text-navy-200">Date</dt>
              <dd className="font-display text-xl font-bold sm:text-2xl">{EVENT.datesLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-navy-200">Lieu</dt>
              <dd className="font-display text-xl font-bold sm:text-2xl">{EVENT.venue}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#billets"
              className="rounded-full bg-orange-500 px-7 py-4 font-display text-lg font-bold text-white shadow-[0_10px_30px_-8px_rgba(254,114,0,0.7)] transition hover:bg-orange-600"
            >
              Réserver mes billets
            </Link>
            <Link href="#programme" className="rounded-full px-5 py-4 font-display text-lg font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">
              Voir le programme
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 lg:pl-4">
          <HeroTicket>
            <TicketStrip tier={pro} holder="Votre nom ici" company="Votre entreprise" code="AIB27-PRO-XXXXXX" qr={<SampleQr />} />
          </HeroTicket>
          <Countdown target={EVENT.startsAt} />
        </div>
      </div>
    </section>
  );
}
