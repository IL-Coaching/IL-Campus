"use client"
import { useState } from 'react';
import {
    User,
    Target,
    Calendar,
    Stethoscope,
    Heart,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';



import { ClientePlanificacion } from '@/nucleo/tipos/planificacion.tipos';

interface SidebarPerfilProps {
    cliente: ClientePlanificacion;
}

export default function SidebarPerfil({ cliente }: SidebarPerfilProps) {
    const [colapsado, setColapsado] = useState(false);
    const [tabActiva, setTabActiva] = useState(0);

    const TABS = [
        { id: 0, icon: Target, label: 'Objetivos' },
        { id: 1, icon: Calendar, label: 'Disponibilidad' },
        { id: 2, icon: Stethoscope, label: 'Salud' },
        { id: 3, icon: Heart, label: 'Preferencias' },
        { id: 4, icon: User, label: 'Métricas' },
    ];

    if (colapsado) {
        return (
            <aside className="w-12 bg-marino-2 border-r border-marino-4 flex flex-col items-center py-4 transition-all duration-250">
                <button onClick={() => setColapsado(false)} className="text-naranja hover:text-naranja-h p-2">
                    <ChevronRight size={20} />
                </button>
            </aside>
        );
    }

    return (
        <aside className="w-[280px] bg-marino-2 border-r border-marino-4 flex flex-col h-full transition-all duration-250 overflow-hidden">
            <div className="p-4 border-b border-marino-4 flex items-center justify-between">
                <h3 className="font-barlow-condensed font-bold uppercase text-xs tracking-widest text-gris">Perfil del Cliente</h3>
                <button onClick={() => setColapsado(true)} className="text-gris hover:text-blanco">
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* TABS ICONS */}
            <div className="flex border-b border-marino-4 bg-marino-3/30">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabActiva(tab.id)}
                        className={`flex-1 py-3 flex justify-center transition-colors ${tabActiva === tab.id ? 'bg-marino-2 text-naranja border-b-2 border-naranja' : 'text-gris hover:text-blanco'
                            }`}
                        title={tab.label}
                    >
                        <tab.icon size={18} />
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {tabActiva === 0 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Objetivo Principal</span>
                            <p className="text-[0.82rem] text-blanco font-bold">{cliente?.formularioInscripcion?.objetivos?.principal || 'No definido'}</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Plazo Deseado</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">{cliente?.formularioInscripcion?.objetivos?.plazo || 'Sin especificar'}</p>
                        </div>
                        {cliente?.formularioInscripcion?.objetivos?.motivacionReal && (
                            <div>
                                <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Motivación Real</span>
                                <p className="text-[0.82rem] text-gris-claro font-light leading-relaxed italic">
                                    &quot;{cliente.formularioInscripcion.objetivos.motivacionReal}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {tabActiva === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Sesiones por Semana</span>
                            <p className="text-[0.82rem] text-blanco font-bold">{cliente?.formularioInscripcion?.disponibilidad?.diasSemana || '--'} días</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Duración Sesión</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">{cliente?.formularioInscripcion?.disponibilidad?.minutosSesion || '--'} min</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Equipamiento</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {cliente?.formularioInscripcion?.disponibilidad?.equipamiento?.length ? (
                                    cliente.formularioInscripcion.disponibilidad.equipamiento.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 bg-marino-3 border border-marino-4 rounded text-[0.7rem] text-naranja border-naranja/30">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-gris italic">No especificado</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholders para el resto de tabs */}
                {tabActiva === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Lesiones / Patologías</span>
                            <p className="text-[0.82rem] text-gris-claro leading-relaxed">
                                {cliente?.formularioInscripcion?.saludMedica?.lesiones || 'Ninguna reportada'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Medicación</span>
                            <p className="text-[0.82rem] text-gris-claro leading-relaxed">
                                {cliente?.formularioInscripcion?.saludMedica?.medicacion || 'Ninguna'}
                            </p>
                        </div>
                    </div>
                )}

                {tabActiva === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Ocupación</span>
                            <p className="text-[0.82rem] text-blanco font-bold">
                                {cliente?.formularioInscripcion?.estiloDeVida?.ocupacion || 'No especificada'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Estrés (1-10)</span>
                            <p className="text-[0.82rem] text-gris-claro">
                                {cliente?.formularioInscripcion?.estiloDeVida?.estres || '--'} / 10
                            </p>
                        </div>
                    </div>
                )}

                {tabActiva === 4 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div className="p-4 bg-naranja/5 border border-naranja/10 rounded-xl text-center">
                            <p className="text-xs text-gris italic">Gráfica de métricas corporales llegará pronto.</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
