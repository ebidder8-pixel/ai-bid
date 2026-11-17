import Link from "next/link";
import { ORGANIZER, SIGNATURE } from "@/lib/event";

export function Organisateur() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#C8261B_0%,#FE7200_55%,#E3961C_100%)] py-24 text-white sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <blockquote className="max-w-[26ch] font-display text-[clamp(2rem,4.4vw,3.6rem)] font-black leading-[1.05] tracking-[-0.02em]">
          «&nbsp;{SIGNATURE.replace(/\.$/, "")}.&nbsp;»
        </blockquote>

        <div className="mt-14 grid gap-12 border-t border-white/30 pt-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="font-display text-lg font-bold">Porteur de l&apos;initiative : e-BIDDER</p>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-white/90">
              AI-BID 2027 veut devenir un lieu de rencontre entre entreprises, professionnels des marchés publics, experts, acteurs du numérique,
              institutions et partenaires, autour des nouvelles technologies appliquées à la commande publique.
            </p>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-white/90">
              e-BIDDER est la plateforme béninoise de montage et de gestion des dossiers de soumission : veille, analyse des dossiers, montage
              des offres et vérification avant dépôt.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9">
            <Link
              href="#billets"
              className="rounded-full bg-navy-900 px-8 py-4 text-center font-display text-lg font-bold text-white transition hover:bg-navy-950"
            >
              Réserver mes billets
            </Link>
            <a
              href={ORGANIZER.site}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/15 px-8 py-4 text-center font-display text-lg font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/25"
            >
              Découvrir e-BIDDER
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
