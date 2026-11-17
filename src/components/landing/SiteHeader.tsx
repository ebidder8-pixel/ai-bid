"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#programme", label: "Programme" },
  { href: "/#billets", label: "Billets" },
  { href: "/#infos", label: "Infos pratiques" },
];

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-navy-900/95 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white" aria-label="AI-BID 2027, accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-dark.svg" alt="e-BIDDER" className="h-8 w-auto sm:h-9" />
          <span className="hidden h-6 w-px bg-white/25 sm:block" />
          <span className="hidden font-display text-lg font-black tracking-tight sm:block">AI-BID 2027</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[0.95rem] font-medium text-navy-100 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link
            href="/#billets"
            className="rounded-full bg-orange-500 px-5 py-2.5 font-display text-[0.95rem] font-bold text-white transition-colors hover:bg-orange-600"
          >
            Réserver ma place
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" className="border-t border-white/10 px-4 pb-6 pt-2 md:hidden" aria-label="Navigation mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-lg font-medium text-white">
              {l.label}
            </Link>
          ))}
          <Link
            href="/#billets"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-orange-500 py-3 text-center font-display font-bold text-white"
          >
            Réserver ma place
          </Link>
        </nav>
      )}
    </header>
  );
}
