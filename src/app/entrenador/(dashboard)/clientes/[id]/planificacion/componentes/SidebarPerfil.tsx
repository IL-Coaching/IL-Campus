"use client"
import { useState } from 'react';
import {
    User,
    Target,
    Calendar,
    Stethoscope,
    Heart,
    Zap, // Added Zap for Ciclo
    ChevronLeft,
    ChevronRight,
    Info // Added Info for notes
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
        { id: 5, icon: Zap, label: 'Ciclo' }, // New tab
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

                {tabActiva === 5 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest block">Ciclo Menstrual</span>
                            <span className={`px-2 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-widest ${cliente?.cicloMenstrual?.activo ? 'bg-naranja/10 text-naranja border border-naranja/20' : 'bg-marino-3 text-gris border border-marino-4'}`}>
                                {cliente?.cicloMenstrual?.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="bg-marino-3/50 border border-marino-4 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="text-[0.55rem] text-gris font-bold uppercase tracking-widest block mb-2">Último Inicio</label>
                                <input
                                    type="date"
                                    defaultValue={cliente?.cicloMenstrual?.fechaInicioUltimoCiclo ? new Date(cliente.cicloMenstrual.fechaInicioUltimoCiclo).toISOString().split('T')[0] : ''}
                                    className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[0.55rem] text-gris font-bold uppercase tracking-widest block mb-2">Duración Promedio (Días)</label>
                                <input
                                    type="number"
                                    defaultValue={cliente?.cicloMenstrual?.duracionCiclo || 28}
                                    className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                                />
                            </div>
                            <button className="w-full py-2 bg-naranja/10 border border-naranja/30 rounded-lg text-[0.65rem] font-black text-naranja uppercase tracking-widest hover:bg-naranja hover:text-marino transition-all">
                                Guardar Configuración
                            </button>
                        </div>

                        <div className="p-4 bg-marino-3/30 border border-marino-4 border-dashed rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={14} className="text-naranja" />
                                <span className="text-[0.6rem] font-black text-blanco uppercase tracking-widest">Nota Técnica</span>
                            </div>
                            <p className="text-[0.7rem] text-gris leading-relaxed font-medium">
                                El sistema ajusta automáticamente las recomendaciones de intensidad RIR en la planificación basándose en la fase proyectada del ciclo.
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
