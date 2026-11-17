import Link from "next/link";
import { EVENT, ORGANIZER } from "@/lib/event";

export function Footer() {
  return (
    <footer className="no-print bg-navy-900 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-horizontal-dark.svg" alt="e-BIDDER" className="h-10 w-auto" />
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed">
              {EVENT.kind} {EVENT.name} · {EVENT.datesLabel} · {EVENT.venue}, Cotonou.
            </p>
          </div>
          <div className="md:col-span-4">
            <p className="font-display font-bold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={ORGANIZER.phoneHref} className="hover:text-white">
                  {ORGANIZER.phone}
                </a>
              </li>
              <li>
                <a href={ORGANIZER.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${ORGANIZER.email}`} className="hover:text-white">
                  {ORGANIZER.email}
                </a>
              </li>
              <li>{ORGANIZER.address}</li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="font-display font-bold text-white">Billetterie</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/#billets" className="hover:text-white">
                  Acheter des billets
                </Link>
              </li>
              <li>
                <Link href="/#infos" className="hover:text-white">
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <a href={ORGANIZER.site} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  ebidder.bj
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-navy-300">&copy; 2026 e-BIDDER. Tous droits réservés.</p>
      </div>
      <div aria-hidden className="h-2 bg-orange-500" />
    </footer>
  );
}
