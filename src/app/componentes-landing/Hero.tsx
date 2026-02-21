"use client"
import Link from 'next/link';
import { useModal } from './ModalProvider';
import { sitioConfig } from '../../../config/sitio.config';

export default function Hero() {
    const { openModal } = useModal();

    return (
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
            {/* Radial Glow Setup */}
            <div className="absolute top-1/4 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-naranja/5 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

            {/* Columna Izquierda */}
            <div className="z-10 fade-up order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-naranja/10 border border-naranja/30 mb-8">
                    <div className="w-2 h-2 rounded-full bg-naranja animate-pulse"></div>
                    <span className="text-blanco text-[0.7rem] font-bold uppercase tracking-widest leading-none mt-0.5">Asesorías online · {sitioConfig.ubicacion}</span>
                </div>

                <h1 className="text-5xl sm:text-[clamp(2.8rem,5vw,4.5rem)] font-barlow-condensed font-black uppercase text-blanco leading-[0.95] mb-6 tracking-tight">
                    Más que<br />entrenar:<br />
                    <span className="text-naranja">ENTENDER,</span><br />
                    <span className="text-naranja">ADAPTAR,</span><br />
                    <span className="text-naranja">PROGRESAR.</span>
                </h1>

                <p className="text-gris-claro font-light text-lg sm:text-xl max-w-lg mb-10 leading-relaxed">
                    Asesorías de entrenamiento 100% personalizadas basadas en ciencia.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <button
                        onClick={() => openModal("Nivel 1 - Start ⭐", "$7.000", "primer mes · luego $15.000/mes")}
                        className="w-full sm:w-auto bg-naranja text-marino font-bold px-8 py-4 rounded focus:outline-none hover:bg-naranja-h transition-colors text-center shadow-lg shadow-naranja/20"
                    >
                        Ver planes →
                    </button>
                    <Link
                        href="#bio"
                        className="text-blanco font-medium border-b border-naranja/30 hover:border-naranja transition-colors pb-1 text-sm uppercase tracking-wide"
                    >
                        Conocé al entrenador
                    </Link>
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="relative fade-up order-1 md:order-2 w-full max-w-sm mx-auto md:max-w-none">
                {/* SVG/Placeholder de 380x480 */}
                <div className="w-full aspect-[380/480] bg-marino-2 border border-marino-4 flex flex-col items-center justify-center text-gris-claro relative overflow-hidden shadow-2xl shadow-naranja/5">
                    {/* En producción sera un <Image src={...}> */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-barlow-condensed font-bold tracking-[0.2em] uppercase opacity-50 text-xs">Foto del entrenador</span>
                </div>

                {/* Stats flotantes */}
                <div className="absolute hidden lg:flex -bottom-6 -left-6 md:-bottom-8 md:-left-8 flex-col gap-4">
                    <div className="bg-marino-2 border border-marino-4 p-4 shadow-xl flex items-center gap-4">
                        <span className="text-4xl font-barlow-condensed font-black text-naranja leading-none">100%</span>
                        <span className="text-xs text-gris font-bold tracking-[0.1em] uppercase leading-tight font-barlow-condensed">Personalizado</span>
                    </div>
                    <div className="bg-marino-2 border border-marino-4 p-4 shadow-xl flex items-center gap-4 ml-8">
                        <span className="text-4xl font-barlow-condensed font-black text-naranja leading-none">+3</span>
                        <span className="text-xs text-gris font-bold tracking-[0.1em] uppercase leading-tight font-barlow-condensed">Planes<br />disponibles</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
