import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { OrderForm } from "@/components/order/OrderForm";

export const metadata: Metadata = { title: "Commander vos billets", robots: { index: false } };

export default function CommandePage() {
  return (
    <>
      <SiteHeader solid />
      <main className="min-h-dvh bg-[#E7ECF3] pb-24 pt-28 sm:pt-32">
        <Suspense fallback={<div className="mx-auto h-[60vh] max-w-6xl" />}>
          <OrderForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
