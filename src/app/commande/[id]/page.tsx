import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Footer } from "@/components/landing/Footer";
import { Confirmation } from "@/components/order/Confirmation";

export const metadata: Metadata = { title: "Vos billets", robots: { index: false } };

export default function ConfirmationPage(props: PageProps<"/commande/[id]">) {
  return (
    <>
      <SiteHeader solid />
      <main className="min-h-dvh bg-[#E7ECF3] pb-24 pt-28 sm:pt-32">
        <Suspense fallback={<div className="mx-auto h-[60vh] max-w-5xl" />}>
          <ConfirmationLoader params={props.params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function ConfirmationLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Confirmation orderId={id} />;
}
