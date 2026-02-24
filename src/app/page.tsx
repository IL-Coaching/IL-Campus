export const dynamic = 'force-dynamic';

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
  const entrenador = await prisma.entrenador.findFirst({
    include: {
      configLanding: true,
      planes: {
        where: { visible: true },
        orderBy: { creadoEn: "asc" }
      }
    }
  });

  const configD = entrenador?.configLanding;
  const planesVisibles = entrenador?.planes || [];

  // ── MODO MANTENIMIENTO ────────────────────────────────────────────────────
  if (configD?.modoMantenimiento) {
    return (
      <div className="min-h-screen bg-marino flex flex-col items-center justify-center relative overflow-hidden px-6">
        {/* Ruido de fondo */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* Glow naranja */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-naranja/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center max-w-xl">
          {/* Marca */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-naranja rounded-xl flex items-center justify-center shadow-lg shadow-naranja/30">
              <span className="text-marino font-black text-xl font-barlow-condensed">IL</span>
            </div>
            <span className="text-blanco font-barlow-condensed font-black text-2xl uppercase tracking-widest">IL-Coaching</span>
          </div>

          {/* Icono escudo */}
          <div className="w-20 h-20 bg-marino-2 border border-marino-4 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-naranja">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-barlow-condensed font-black uppercase text-blanco tracking-tight leading-tight mb-4">
            Estamos <span className="text-naranja">mejorando</span><br />tu experiencia
          </h1>

          <p className="text-gris-claro text-base font-medium leading-relaxed mb-10">
            Nuestro equipo está trabajando en mejoras para ofrecerte una experiencia aún más completa.
            Volvemos muy pronto. ¡Gracias por tu paciencia!
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-marino-4" />
            <span className="text-[0.6rem] font-black text-gris uppercase tracking-[0.3em]">Mientras tanto</span>
            <div className="flex-1 h-px bg-marino-4" />
          </div>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || "5491112345678"}?text=Hola%20IL-Coaching%2C%20vi%20que%20la%20web%20est%C3%A1%20en%20mantenimiento.%20%C2%BFPuedo%20obtener%20m%C3%A1s%20info%3F`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-naranja hover:bg-naranja/90 text-marino font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-naranja/25 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactanos por WhatsApp
          </a>

          <p className="mt-8 text-[0.7rem] text-gris font-medium">
            ¿Sos alumno de IL-Campus?{" "}
            <a href="/auth/login" className="text-naranja hover:underline font-bold">
              Accedé desde aquí →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── LANDING NORMAL ────────────────────────────────────────────────────────
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
        <Hero
          imageUrl={configD?.heroImagenUrl}
          titulo={configD?.heroTitulo}
          subtitulo={configD?.heroSubtitulo}
        />

        {/* 3. BIO DEL ENTRENADOR */}
        <Bio
          imageUrl={configD?.bioImagenUrl}
          texto={configD?.bioTexto}
        />

        {/* 4. PLANES */}
        <Planes planes={planesVisibles} />

        {/* 5. TESTIMONIOS */}
        <Testimonios testimoniosData={configD?.testimonios} />

        {/* 6. FAQ */}
        <Faq faqsData={configD?.faqs} />

        {/* 7. CTA FINAL */}
        <CtaFinal />
      </main>

      {/* 8. FOOTER */}
      <Footer footerTexto={configD?.footerTexto} />

      {/* 9. MODAL DE WHATSAPP */}
      <ModalWhatsapp />
    </ModalProvider>
  );
}
