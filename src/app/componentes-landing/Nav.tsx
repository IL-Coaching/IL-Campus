"use client"
import Link from 'next/link';
import { sitioConfig } from '../../../config/sitio.config';

export default function Nav() {
    return (
        <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-marino-2/60 backdrop-blur-xl shadow-2xl shadow-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo (Izquierda) */}
                    <div className="flex items-center gap-4">
                        {/* Mancuerna CSS */}
                        <div className="flex items-center gap-1 text-gris-claro">
                            <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                            <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                            <div className="w-2 h-2 bg-gris-claro"></div>
                            <span className="text-3xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter">IL</span>
                            <div className="w-2 h-2 bg-gris-claro"></div>
                            <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        </div>
                        {/* Textos */}
                        <Link href="/" className="hidden sm:flex flex-col cursor-pointer">
                            <span className="text-[0.65rem] font-bold tracking-widest text-gris uppercase">Personal Trainer</span>
                            <span className="text-sm font-barlow-condensed font-bold tracking-wide text-naranja uppercase leading-none">{sitioConfig.entrenador}</span>
                        </Link>
                    </div>

                    {/* Links (Derecha) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/#bio" className="text-sm font-medium text-blanco hover:text-naranja transition-colors">El Entrenador</Link>
                        <Link href="/#planes" className="text-sm font-medium text-blanco hover:text-naranja transition-colors">Planes</Link>
                        <Link href="/#testimonios" className="text-sm font-medium text-blanco hover:text-naranja transition-colors">Resultados</Link>
                        <Link href="/#faq" className="text-sm font-medium text-blanco hover:text-naranja transition-colors">FAQ</Link>
                        <Link href="/ingresar" className="bg-naranja text-marino font-bold px-5 py-2 rounded text-sm hover:bg-naranja-h transition-colors shadow-lg shadow-naranja/20">
                            Campus
                        </Link>
                    </div>

                    {/* CTA Mobile */}
                    <div className="md:hidden flex items-center">
                        <Link href="/ingresar" className="bg-naranja text-marino font-bold px-4 py-2 rounded text-sm hover:bg-naranja-h transition-colors">
                            Campus
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}