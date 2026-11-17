import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { Theme } from "@/components/landing/Theme";
import { Programme } from "@/components/landing/Programme";
import { Billets } from "@/components/landing/Billets";
import { Livre } from "@/components/landing/Livre";
import { Infos } from "@/components/landing/Infos";
import { Organisateur } from "@/components/landing/Organisateur";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Theme />
        <Programme />
        <Billets />
        <Livre />
        <Infos />
        <Organisateur />
      </main>
      <Footer />
    </>
  );
}
