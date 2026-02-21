"use client"
import { useModal } from './ModalProvider';
import { sitioConfig } from '../../../config/sitio.config';

export default function Planes() {
    const { openModal } = useModal();

    return (
        <section id="planes" className="bg-marino py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-16 fade-up">
                    <span className="text-naranja font-barlow-condensed font-bold tracking-[0.15em] text-xs uppercase block mb-2">
                        Asesorías
                    </span>
                    <h2 className="text-[2.5rem] font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight mb-8">
                        Elegí tu plan
                    </h2>

                    <div className="bg-marino-2 border-l-4 border-naranja p-6 max-w-3xl border-y border-y-marino-4 border-r border-r-marino-4 shadow-xl">
                        <p className="text-gris-claro font-medium m-0 leading-relaxed text-sm md:text-base">
                            Todos los planes incluyen el mismo nivel de seguimiento y feedback técnico. Lo que cambia es la profundidad del proceso.
                        </p>
                    </div>
                </div>

                {/* Planes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-stretch">

                    {/* Plan 1 - Start */}
                    <div className="group bg-marino-2 border border-marino-4 p-8 flex flex-col fade-up delay-100 hover:-translate-y-2 hover:border-naranja/40 hover:shadow-2xl hover:shadow-naranja/5 transition-all duration-500 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-naranja/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block mb-1">Nivel 1</span>
                        <h3 className="text-3xl font-barlow-condensed font-black text-blanco uppercase mb-2">Start ⭐</h3>
                        <p className="text-gris text-sm mb-6 border-b border-marino-4 pb-6 font-medium">Mensual · 30 días</p>

                        <div className="mb-6">
                            <span className="text-gris line-through text-lg block leading-none mb-1 font-bold">$15.000</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-barlow-condensed font-black text-naranja tracking-tight">$7.000</span>
                                <span className="text-naranja text-xs font-bold uppercase tracking-wider">primer mes</span>
                            </div>
                        </div>

                        <div className="bg-naranja/15 border border-naranja/30 text-naranja text-[0.65rem] font-bold uppercase px-3 py-1.5 inline-block mb-6 shadow-sm rounded">
                            🎉 Promoción primer mes
                        </div>

                        <p className="text-naranja font-semibold mb-6 text-sm">→ Ideal para empezar y conocer el sistema</p>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {["Plan personalizado", "Seguimiento directo", "Guía de entrenamiento", "Videollamada semanal"].map((b, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <span className="text-naranja text-lg leading-none transition-transform group-hover/item:scale-125">✓</span>
                                    <span className="text-gris-claro font-medium text-sm">{b}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => openModal("Nivel 1 - Start ⭐", "$7.000", "primer mes · luego $15.000/mes")}
                            className="mt-auto w-full border border-marino-4 group-hover:border-naranja group-hover:text-naranja transition-all text-blanco font-bold py-4 rounded-xl text-sm uppercase tracking-widest text-center bg-transparent"
                        >
                            Seleccionar
                        </button>
                    </div>

                    {/* Plan 2 - GymRat (Destacado) */}
                    <div className="group bg-marino-2 border border-naranja/50 p-8 flex flex-col fade-up delay-200 relative lg:scale-[1.05] z-10 hover:-translate-y-2 hover:border-naranja hover:shadow-2xl hover:shadow-naranja/20 transition-all duration-500 rounded-2xl overflow-hidden active:scale-100">
                        {/* Esquina glow mejorado */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-naranja/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>

                        <div className="absolute top-0 right-0 bg-naranja text-marino text-[0.65rem] font-black uppercase tracking-widest px-5 py-1.5 rounded-bl-xl shadow-lg">
                            Más popular
                        </div>

                        <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block mb-1">Nivel 2</span>
                        <h3 className="text-3xl font-barlow-condensed font-black text-blanco uppercase mb-2">GymRat 🧠</h3>
                        <p className="text-gris text-sm mb-6 border-b border-naranja/10 pb-6 font-medium">3 Meses · 90 días</p>

                        <div className="mb-6">
                            <span className="text-4xl font-barlow-condensed font-black text-naranja tracking-tight">$40.000</span>
                        </div>

                        <p className="text-naranja font-semibold mb-6 text-sm italic">→ Para entrenar con estructura y progresar en serio</p>

                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3">
                                <span className="text-naranja text-lg leading-none opacity-50">✓</span>
                                <span className="text-gris font-medium text-sm">Plan personalizado</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-naranja text-lg leading-none opacity-50">✓</span>
                                <span className="text-gris font-medium text-sm">Seguimiento directo</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-naranja text-lg leading-none opacity-50">✓</span>
                                <span className="text-gris font-medium text-sm">Guía de entrenamiento</span>
                            </li>
                            <li className="flex items-center gap-3 mb-2">
                                <span className="text-naranja text-lg leading-none opacity-50">✓</span>
                                <span className="text-gris font-medium text-sm">Videollamada semanal</span>
                            </li>
                            {["Planificación por mesociclo", "Explicación detallada", "Acompañamiento premium"].map((b, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <span className="text-naranja text-lg leading-none transition-transform group-hover/item:scale-125">✓</span>
                                    <span className="text-blanco font-bold text-sm tracking-tight">{b}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => openModal("Nivel 2 - GymRat 🧠", "$40.000", "3 meses")}
                            className="mt-auto w-full border border-naranja bg-naranja hover:bg-naranja-h transition-all text-marino font-black py-4 rounded-xl text-sm uppercase tracking-widest text-center shadow-lg shadow-naranja/20"
                        >
                            Seleccionar
                        </button>
                    </div>

                    {/* Plan 3 - Elite */}
                    <div className="group bg-marino-2 border border-marino-4 p-8 flex flex-col fade-up delay-300 hover:-translate-y-2 hover:border-naranja/40 hover:shadow-2xl hover:shadow-naranja/5 transition-all duration-500 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-naranja/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block mb-1">Nivel 3</span>
                        <h3 className="text-3xl font-barlow-condensed font-black text-blanco uppercase mb-2">Elite 🚀</h3>
                        <p className="text-gris text-sm mb-6 border-b border-marino-4 pb-6 font-medium">1 Año · 365 días</p>

                        <div className="mb-6">
                            <span className="text-4xl font-barlow-condensed font-black text-naranja tracking-tight">$125.000</span>
                            <span className="text-[0.6rem] text-naranja font-black uppercase tracking-widest block mt-2 bg-naranja/10 px-2 py-1 rounded w-fit italic">
                                💰 Ahorrás un 30% anual
                            </span>
                        </div>

                        <p className="text-naranja font-semibold mb-6 text-sm">→ Para llevar tu entrenamiento a un nivel avanzado</p>

                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3 mb-2">
                                <span className="text-gris text-lg leading-none opacity-50 font-bold">✓</span>
                                <span className="text-gris font-medium text-sm">Todo lo del plan GymRat</span>
                            </li>
                            {["Macrociclo completo", "Análisis estratégico", "Prioridad en soporte"].map((b, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <span className="text-naranja text-lg leading-none transition-transform group-hover/item:scale-125">✓</span>
                                    <span className="text-gris-claro font-medium text-sm">{b}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => openModal("Nivel 3 - Elite 🚀", "$125.000", "1 año")}
                            className="mt-auto w-full border border-marino-4 group-hover:border-naranja group-hover:text-naranja transition-all text-blanco font-bold py-4 rounded-xl text-sm uppercase tracking-widest text-center bg-transparent"
                        >
                            Seleccionar
                        </button>
                    </div>

                </div>

                {/* Consulta por WhatsApp para dudas */}
                <div className="mt-16 text-center fade-up">
                    <p className="text-gris text-sm font-medium mb-4">
                        ¿No estás seguro de qué plan elegir?
                    </p>
                    <a
                        href={`https://wa.me/${sitioConfig.whatsapp || "5493425555607"}?text=${encodeURIComponent("Hola Iñaki! Tengo dudas sobre qué plan elegir para empezar.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-naranja font-bold uppercase tracking-widest text-xs hover:text-naranja-h transition-colors border-b border-naranja/20 pb-1"
                    >
                        <span>💬</span> Consultar asesoría gratuita
                    </a>
                </div>
            </div>
        </section>
    );
}
