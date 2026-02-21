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

interface SidebarPerfilProps {
    cliente: any; // Tipar mejor luego
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
                            <p className="text-[0.82rem] text-gris-claro font-medium">{cliente?.formularioInscripcion?.objetivos?.principal || 'Pérdida de grasa'}</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Plazo Deseado</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">12 semanas</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Motivación Real</span>
                            <p className="text-[0.82rem] text-gris-claro font-light leading-relaxed italic">
                                &quot;Sentirme fuerte de nuevo y recuperar mi energía para jugar con mis hijos.&quot;
                            </p>
                        </div>
                    </div>
                )}

                {tabActiva === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Sesiones por Semana</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">4 días</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Duración Sesión</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">60 - 75 min</p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Equipamiento</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['Mancuernas', 'Barra', 'Poleas', 'Rack'].map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-marino-3 border border-marino-4 rounded text-[0.7rem] text-verde-ok border-verde-ok/30">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholders para el resto de tabs */}
                {tabActiva >= 2 && (
                    <div className="py-10 text-center text-gris italic text-xs">
                        Cargando datos del formulario...
                    </div>
                )}
            </div>
        </aside>
    );
}
