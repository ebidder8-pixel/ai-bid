/** Le livre offert à chaque participant — couverture dessinée en CSS. */
export function Livre() {
  return (
    <section className="relative overflow-hidden bg-paper py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex justify-center lg:col-span-5">
          <div className="relative [perspective:1600px]">
            <div className="relative h-[400px] w-[280px] sm:h-[440px] sm:w-[310px]" style={{ transform: "rotateY(-18deg) rotateX(4deg)" }}>
              {/* tranche */}
              <div className="absolute inset-y-0 -left-[22px] w-[22px] origin-right bg-gradient-to-r from-[#7A1A10] to-[#A62617]" style={{ transform: "rotateY(-90deg)", transformOrigin: "right" }} />
              {/* couverture */}
              <div className="absolute inset-0 overflow-hidden rounded-r-md bg-[linear-gradient(160deg,#E3961C_0%,#FE7200_30%,#C8261B_75%,#7A1A10_100%)] shadow-[30px_40px_60px_-20px_rgba(0,26,56,0.5)]">
                <div aria-hidden className="absolute inset-y-0 left-3 w-px bg-black/20" />
                <div aria-hidden className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-gold-300/40 blur-3xl" />
                <div className="relative flex h-full flex-col p-8 text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="self-start rounded-md bg-white px-2.5 py-1.5"><img src="/brand/logo-horizontal.svg" alt="" className="h-6 w-auto" /></span>
                  <p className="mt-auto font-display text-[2.15rem] font-black leading-[1.02] tracking-tight">
                    Comment gagner des marchés publics&nbsp;?
                  </p>
                  <div className="mt-5 h-1 w-14 rounded-full bg-navy-700" />
                  <p className="mt-4 text-sm font-medium text-white/85">Édition AI-BID 2027</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="font-display text-lg font-semibold text-orange-600">Offert avec chaque billet</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.02em] text-navy-700">
            Le livre «&nbsp;Comment gagner des marchés publics&nbsp;?&nbsp;»
          </h2>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
            Le guide de référence d&apos;e-BIDDER : comprendre un dossier d&apos;appel d&apos;offres, constituer les pièces, éviter les causes de rejet
            et présenter une offre compétitive. Il vous est remis à l&apos;accueil, le premier jour.
          </p>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-6">
            <div className="border-l-4 border-orange-500 pl-4">
              <dt className="text-sm text-muted">Remis</dt>
              <dd className="font-display text-xl font-bold text-navy-700">À l&apos;accueil, jour 1</dd>
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
