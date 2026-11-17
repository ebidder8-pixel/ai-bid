import { AUDIENCE, EVENT } from "@/lib/event";

const STEPS = [
  {
    verb: "Analysez",
    body: "Lire un dossier d'appel d'offres de 200 pages en quelques minutes : critères de qualification, pièces exigées, délais, clauses éliminatoires.",
  },
  {
    verb: "Préparez",
    body: "Monter le dossier administratif, l'offre technique et l'offre financière avec des modèles et des assistants IA, sans repartir de zéro à chaque fois.",
  },
  {
    verb: "Vérifiez",
    body: "Contrôler la conformité avant le dépôt : pièce manquante, date expirée, montant incohérent. Les erreurs qui éliminent une offre se voient avant l'ouverture des plis.",
  },
];

const ADVANTAGES = ["Formation", "Démonstrations", "Cas pratiques", "Échanges", "Networking"];

export function Theme() {
  return (
    <section id="theme" className="relative overflow-hidden bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="font-display text-lg font-semibold text-orange-600 lg:col-span-3 lg:pt-3">Le thème</p>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.9rem)] font-extrabold leading-[1.04] tracking-[-0.02em] text-navy-700 lg:col-span-9">
            {EVENT.theme}.
          </h2>
        </div>

        <ol className="mt-20 grid gap-px overflow-hidden rounded-3xl bg-navy-100 sm:mt-24 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.verb} className="relative bg-white p-8 sm:p-10">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-sm font-bold text-orange-500">Étape {i + 1}</span>
                {i < STEPS.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-orange-500/60 to-transparent lg:block" />}
              </div>
              <h3 className="mt-6 font-display text-4xl font-black tracking-tight text-navy-700 sm:text-5xl">{s.verb}</h3>
              <p className="mt-4 max-w-[42ch] text-[1.05rem] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-24 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-700 sm:text-4xl">Pour qui ?</h2>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted">
              Pour celles et ceux qui répondent aux appels d&apos;offres publics, ou qui veulent s&apos;y mettre, et qui en ont assez de perdre des
              marchés sur un détail.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ul className="flex flex-wrap gap-3">
              {AUDIENCE.map((a) => (
                <li key={a} className="rounded-full bg-navy-700 px-5 py-3 font-display text-lg font-semibold text-white sm:text-xl">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-medium text-muted">Au programme</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {ADVANTAGES.map((a) => (
                <li key={a} className="rounded-full border-2 border-gold-500/70 bg-gold-100/60 px-5 py-2.5 font-display text-base font-semibold text-navy-800">
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
