import Nav from "./componentes-landing/Nav";
import Hero from "./componentes-landing/Hero";
import Bio from "./componentes-landing/Bio";
import Planes from "./componentes-landing/Planes";
import Testimonios from "./componentes-landing/Testimonios";
import Faq from "./componentes-landing/Faq";
import CtaFinal from "./componentes-landing/CtaFinal";
import Footer from "./componentes-landing/Footer";
import ModalWhatsapp from "./componentes-landing/ModalWhatsapp";
import { ModalProvider } from "./componentes-landing/ModalProvider";
import ObserverScript from "./componentes-landing/ObserverScript";
import { prisma } from "@/baseDatos/conexion";

export default async function LandingPage() {
  const entrenador = await prisma.entrenador.findFirst();

  return (
    <ModalProvider>
      <ObserverScript />

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 1. NAV */}
      <Nav />

      <main className="overflow-hidden">
        {/* 2. HERO */}
        <Hero imageUrl={entrenador?.landingHeroUrl} />

        {/* 3. BIO DEL ENTRENADOR */}
        <Bio imageUrl={entrenador?.landingBioUrl} />

        {/* 4. PLANES */}
        <Planes />

        {/* 5. TESTIMONIOS */}
        <Testimonios />

        {/* 6. FAQ */}
        <Faq />

        {/* 7. CTA FINAL */}
        <CtaFinal />
      </main>

      {/* 8. FOOTER */}
      <Footer />

      {/* 9. MODAL DE WHATSAPP */}
      <ModalWhatsapp />
    </ModalProvider>
  );
}
