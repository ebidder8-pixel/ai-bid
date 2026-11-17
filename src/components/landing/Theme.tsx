import { AUDIENCE, DISCOVER, EVENT, FORMAT } from "@/lib/event";

const STEPS = [
  {
    verb: "Analysez",
    body: "Lire un DAO en quelques minutes avec l'IA et en sortir l'essentiel : critères de qualification, exigences, pièces obligatoires, délais.",
  },
  {
    verb: "Préparez",
    body: "Monter l'offre technique et l'offre financière avec l'assistance de l'IA, sans repartir de zéro à chaque appel d'offres.",
  },
  {
    verb: "Vérifiez",
    body: "Contrôler le dossier avant le dépôt : pièce manquante, document expiré, montant incohérent. Les erreurs se corrigent avant l'ouverture des plis.",
  },
];

export function Theme() {
  return (
    <section
      id="theme"
      className="relative overflow-hidden bg-paper py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 className="font-display text-[clamp(2.4rem,4.4vw,3.6rem)] font-black leading-none tracking-[-0.03em] text-orange-500 lg:col-span-3 lg:pt-1">
            Le thème
          </h2>
          <div className="lg:col-span-9">
            <p className="font-display text-[clamp(2rem,4.6vw,3.9rem)] font-extrabold leading-[1.04] tracking-[-0.02em] text-navy-700">
              {EVENT.theme}.
            </p>
            <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-muted sm:text-xl">
              Monter une offre de marché public prend du temps : des dizaines de
              documents à analyser, des pièces à réunir, une offre technique et
              financière à préparer, des délais stricts. AI-BID 2027 montre
              comment une utilisation maîtrisée de l&apos;IA fait gagner ce
              temps et améliore la qualité du dossier.
            </p>
          </div>
        </div>

        <ol className="mt-20 grid gap-px overflow-hidden rounded-3xl bg-navy-100 sm:mt-24 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.verb} className="relative bg-white p-8 sm:p-10">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-sm font-bold text-orange-500">
                  Étape {i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 bg-gradient-to-r from-orange-500/60 to-transparent lg:block"
                  />
                )}
              </div>
              <h3 className="mt-6 font-display text-4xl font-black tracking-tight text-navy-700 sm:text-5xl">
                {s.verb}
              </h3>
              <p className="mt-4 max-w-[42ch] text-[1.05rem] leading-relaxed text-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        {/* Ce que vous allez découvrir */}
        <div className="mt-24 grid gap-12 rounded-[2rem] bg-navy-700 p-8 text-white sm:p-12 lg:grid-cols-12 lg:gap-10 lg:p-14">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              Ce que vous allez découvrir
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-navy-100">
              Vous repartez avec une idée claire de ce que l&apos;IA peut
              réellement faire pour vous dans le montage de vos offres, et avec
              des outils et des méthodes à utiliser dès le lendemain.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:col-span-7">
            {DISCOVER.map((d) => (
              <li
                key={d}
                className="flex gap-3 border-t border-white/15 pt-4 text-[1.05rem] leading-snug"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden
                >
                  <circle cx="10" cy="10" r="10" fill="#FE7200" />
                  <path
                    d="M6 10.4l2.6 2.5L14 7.5"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-700 sm:text-4xl">
              Pour qui ?
            </h2>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted">
              Pour toutes celles et ceux qui répondent aux appels d&apos;offres
              publics, ou qui veulent s&apos;y mettre, et qui veulent le faire
              plus vite et avec moins d&apos;erreurs.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ul className="flex flex-wrap gap-3">
              {AUDIENCE.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-navy-700 px-5 py-3 font-display text-lg font-semibold text-white sm:text-xl"
                >
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-medium text-muted">Le format</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {FORMAT.map((a) => (
                <li
                  key={a}
                  className="rounded-full border-2 border-gold-500/70 bg-gold-100/60 px-5 py-2.5 font-display text-base font-semibold text-navy-800"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
