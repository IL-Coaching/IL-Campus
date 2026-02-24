"use client"
import { useModal } from './ModalProvider';
import { sitioConfig } from '../../../config/sitio.config';

interface Plan {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
    descripcion: string | null;
    beneficios: string[];
}

interface Props {
    planes: Plan[];
}

export default function Planes({ planes }: Props) {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-stretch">
                    {planes.map((plan, index) => {
                        const isDestacado = plan.nombre.toLowerCase().includes('popular') || plan.nombre.toLowerCase().includes('rat') || index === 1;

                        return (
                            <div
                                key={plan.id}
                                className={`group bg-marino-2 border ${isDestacado ? 'border-naranja/50 lg:scale-[1.05] z-10' : 'border-marino-4'} p-8 flex flex-col fade-up transition-all duration-500 rounded-2xl relative overflow-hidden hover:-translate-y-2 hover:border-naranja/40 hover:shadow-2xl ${isDestacado ? 'hover:shadow-naranja/20' : 'hover:shadow-naranja/5'}`}
                                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                            >
                                {isDestacado && (
                                    <>
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-naranja/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute top-0 right-0 bg-naranja text-marino text-[0.65rem] font-black uppercase tracking-widest px-5 py-1.5 rounded-bl-xl shadow-lg">
                                            Más popular
                                        </div>
                                    </>
                                )}

                                <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block mb-1">Nivel {index + 1}</span>
                                <h3 className="text-3xl font-barlow-condensed font-black text-blanco uppercase mb-2">{plan.nombre}</h3>
                                <p className="text-gris text-sm mb-6 border-b border-marino-4 pb-6 font-medium">Ciclo de {plan.duracionDias} días</p>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-barlow-condensed font-black text-naranja tracking-tight">${plan.precio.toLocaleString('es-AR')}</span>
                                        <span className="text-naranja text-xs font-bold uppercase tracking-wider">final</span>
                                    </div>
                                </div>

                                {plan.descripcion && (
                                    <p className="text-naranja font-semibold mb-6 text-sm italic">→ {plan.descripcion}</p>
                                )}

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.beneficios.map((b, i) => (
                                        <li key={i} className="flex items-start gap-3 group/item">
                                            <span className="text-naranja text-lg leading-none transition-transform group-hover/item:scale-125">✓</span>
                                            <span className="text-gris-claro font-medium text-sm">{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => openModal(plan.nombre, `$${plan.precio.toLocaleString('es-AR')}`, `${plan.duracionDias} días`)}
                                    className={`mt-auto w-full border transition-all font-bold py-4 rounded-xl text-sm uppercase tracking-widest text-center ${isDestacado ? 'bg-naranja text-marino border-naranja hover:bg-naranja-h' : 'bg-transparent text-blanco border-marino-4 group-hover:border-naranja group-hover:text-naranja'}`}
                                >
                                    Seleccionar
                                </button>
                            </div>
                        );
                    })}
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
