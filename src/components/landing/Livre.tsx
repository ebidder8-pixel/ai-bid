import { BOOK } from "@/lib/event";

/** Le livre offert à chaque participant — vraie couverture posée sur un volume en 3D. */
export function Livre() {
  return (
    <section className="relative overflow-hidden bg-paper py-24 sm:py-32">
      <div aria-hidden className="absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(30,111,192,0.18),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex justify-center lg:col-span-5">
          <a
            href={BOOK.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir la page du livre « ${BOOK.title} » (nouvel onglet)`}
            className="group relative block rounded-md [perspective:1800px]"
          >
            <div
              className="relative h-[426px] w-[270px] transition-transform duration-500 ease-out [transform:rotateY(-20deg)_rotateX(3deg)] [transform-style:preserve-3d] group-hover:[transform:rotateY(-12deg)_rotateX(2deg)_translateY(-6px)] sm:h-[474px] sm:w-[300px]"
            >
              {/* tranche */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-[26px] bg-[linear-gradient(90deg,#0E4E92,#1E6FC0_60%,#2B7BCB)]"
                style={{ transform: "rotateY(-90deg)", transformOrigin: "left" }}
              />
              {/* pages */}
              <div
                aria-hidden
                className="absolute inset-y-[3px] right-0 w-[24px] bg-[repeating-linear-gradient(90deg,#F4F1EA_0px,#F4F1EA_1px,#E2DDD2_1px,#E2DDD2_2px)]"
                style={{ transform: "rotateY(90deg)", transformOrigin: "right" }}
              />
              {/* couverture */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/livre-couverture.jpg"
                alt="Couverture du livre « Comment gagner des marchés publics ? » d'Aimé Jacquet SETO, édition 2026"
                className="absolute inset-0 h-full w-full rounded-r-[4px] object-cover shadow-[34px_44px_60px_-22px_rgba(0,26,56,0.55)]"
                loading="lazy"
              />
              <div aria-hidden className="absolute inset-y-0 left-[10px] w-[3px] bg-gradient-to-r from-black/25 to-white/20" />
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-r-[4px] bg-[linear-gradient(100deg,rgba(255,255,255,0.18)_0%,transparent_30%,transparent_70%,rgba(0,0,0,0.12)_100%)]" />
            </div>
          </a>
        </div>

        <div className="lg:col-span-7">
          <p className="font-display text-lg font-semibold text-orange-600">Offert avec chaque billet</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.02em] text-navy-700">
            Comment gagner des marchés publics&nbsp;?
          </h2>
          <p className="mt-3 font-display text-xl font-semibold text-[#1E6FC0]">Le guide pratique du stratège (GPS) · Aimé Jacquet SETO</p>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
            De la compréhension à la victoire sur les appels d&apos;offres : lire un dossier, constituer les pièces, éviter les causes de rejet et
            présenter une offre compétitive. Votre exemplaire vous est remis à l&apos;accueil, le premier jour.
          </p>
          <a
            href={BOOK.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-[#1E6FC0] underline decoration-[#1E6FC0]/30 underline-offset-4 transition hover:decoration-[#1E6FC0]"
          >
            En savoir plus sur le livre
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M6 3h7v7M13 3L4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-3">
            <div className="border-l-4 border-orange-500 pl-4">
              <dt className="text-sm text-muted">Édition</dt>
              <dd className="font-display text-xl font-bold text-navy-700">2026</dd>
            </div>
            <div className="border-l-4 border-[#1E6FC0] pl-4">
              <dt className="text-sm text-muted">Remis</dt>
              <dd className="font-display text-xl font-bold text-navy-700">À l&apos;accueil, le 27 février</dd>
            </div>
            <div className="border-l-4 border-navy-700 pl-4">
              <dt className="text-sm text-muted">Inclus dans</dt>
              <dd className="font-display text-xl font-bold text-navy-700">Les 3 formules</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
