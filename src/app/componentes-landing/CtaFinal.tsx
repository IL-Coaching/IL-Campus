"use client"
import { Instagram } from 'lucide-react';
import { useModal } from './ModalProvider';
import { sitioConfig } from "../../../config/sitio.config";

export default function CtaFinal() {
    const { openModal } = useModal();

    return (
        <section className="bg-marino-2 border-y border-marino-4 py-32 flex flex-col items-center justify-center text-center px-4">
            <div className="fade-up max-w-2xl">
                <h2 className="text-4xl sm:text-6xl font-barlow-condensed font-black uppercase text-blanco mb-4 tracking-tight">
                    ¿Listo para <span className="text-naranja">EMPEZAR?</span>
                </h2>

                <p className="text-gris-claro text-lg sm:text-xl font-light mb-10">
                    Primer mes a $7.000. Sin excusas, con estructura.
                </p>

                <button
                    onClick={() => openModal("Nivel 1 - Start ⭐", "$7.000", "primer mes")}
                    className="inline-block bg-naranja hover:bg-naranja-h transition-colors text-marino font-bold uppercase tracking-wide py-4 px-10 rounded shadow-2xl shadow-naranja/20 mb-12 sm:text-lg"
                >
                    Quiero empezar →
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-marino-4/50">
                    <div className="flex items-center gap-3 group">
                        <Instagram size={20} className="text-gris group-hover:text-naranja transition-colors" />
                        <a href="https://instagram.com/il.coaching" target="_blank" rel="noopener noreferrer" className="text-blanco font-bold font-barlow-condensed tracking-widest uppercase hover:text-naranja transition-colors">
                            @il.coaching
                        </a>
                    </div>

                    <div className="flex items-center gap-3 group">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gris group-hover:text-verde transition-colors"
                        >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <a href={`https://wa.me/${sitioConfig.whatsapp || "5493425555607"}`} target="_blank" rel="noopener noreferrer" className="text-blanco font-bold font-barlow-condensed tracking-widest uppercase hover:text-naranja transition-colors">
                            {sitioConfig.whatsapp ? sitioConfig.whatsapp.replace(/^549/, "") : "342-5555607"}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
