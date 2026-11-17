import Link from "next/link";
import { ORGANIZER } from "@/lib/event";

export function Organisateur() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#C8261B_0%,#FE7200_55%,#E3961C_100%)] py-24 text-white sm:py-28">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="lg:col-span-7">
          <p className="font-display text-lg font-semibold text-white/85">Organisé par e-BIDDER</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.3rem)] font-black leading-[1.04] tracking-[-0.02em]">
            La plateforme béninoise de montage et de gestion des dossiers de soumission.
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-white/90">
            e-BIDDER accompagne les entreprises dans leurs réponses aux appels d&apos;offres : veille, analyse des dossiers, montage des offres et
            vérification avant dépôt, avec des outils d&apos;intelligence artificielle. AI-BID 2027 met cette expérience au service de tous les
            soumissionnaires.
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
    </section>
  );
}
