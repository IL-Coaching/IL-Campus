"use client"
import { useState } from 'react';
import {
    User,
    Target,
    Calendar,
    Stethoscope,
    Heart,
    Zap,
    ChevronLeft,
    ChevronRight,
    Info,
    ShieldAlert,
    Copy,
    CheckCircle2,
    Loader2,
    Microscope
} from 'lucide-react';

import { ClientePlanificacion } from '@/nucleo/tipos/planificacion.tipos';
import { generarLinkRecuperacionManual } from '@/nucleo/acciones/password.accion';
import { obtenerPorcentajesCalculados } from '@/nucleo/acciones/testeo.accion';
import { ZONAS_INTENSIDAD } from '@/nucleo/planificacion/zonas.constantes';

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
        { id: 5, icon: Zap, label: 'Ciclo' },
        { id: 4, icon: User, label: 'Métricas' },
        { id: 7, icon: Microscope, label: 'Perfil Científico' },
        { id: 6, icon: ShieldAlert, label: 'Cuenta' },
    ];

    const [generandoLink, setGenerandoLink] = useState(false);
    const [linkRecuperacion, setLinkRecuperacion] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);
    const [porcentajes, setPorcentajes] = useState<any>(null);
    const [loadingPct, setLoadingPct] = useState(false);

    const handleGenerarLink = async () => {
        setGenerandoLink(true);
        const result = await generarLinkRecuperacionManual(cliente.id);
        setGenerandoLink(false);

        if (result.success && result.link) {
            setLinkRecuperacion(result.link);
        } else {
            alert(result.error || "Ocurrió un error al generar el link.");
        }
    };

    const copiarLink = () => {
        if (!linkRecuperacion) return;
        navigator.clipboard.writeText(linkRecuperacion);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3000);
    };

    const fetchPorcentajes = async (ejercicioId: string) => {
        setLoadingPct(true);
        const res = await obtenerPorcentajesCalculados(cliente.id, ejercicioId);
        if (res.exito && res.porcentajes) {
            setPorcentajes(res.porcentajes);
        }
        setLoadingPct(false);
    };

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
                            <p className="text-[0.82rem] text-blanco font-bold">
                                {cliente?.formularioInscripcion?.objetivos?.principales?.join(', ') || 'No definido'}
                            </p>
                        </div>
                        {cliente?.formularioInscripcion?.objetivos?.motivacion && (
                            <div>
                                <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Motivación</span>
                                <p className="text-[0.82rem] text-gris-claro font-light leading-relaxed italic">
                                    &quot;{cliente.formularioInscripcion.objetivos.motivacion}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {tabActiva === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Sesiones por Semana</span>
                            <p className="text-[0.82rem] text-blanco font-bold">
                                {cliente?.formularioInscripcion?.disponibilidad?.sesionesSemanales || '--'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Duración Sesión</span>
                            <p className="text-[0.82rem] text-gris-claro font-medium">
                                {cliente?.formularioInscripcion?.disponibilidad?.tiempoSesion || '--'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Lugar y Equipamiento</span>
                            <p className="text-[0.82rem] text-blanco font-bold mb-2">
                                {cliente?.formularioInscripcion?.disponibilidad?.lugar || 'No especificado'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cliente?.formularioInscripcion?.disponibilidad?.equipamiento?.length ? (
                                    cliente.formularioInscripcion.disponibilidad.equipamiento.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 bg-marino-3 border border-marino-4 rounded text-[0.7rem] text-naranja border-naranja/30">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-gris italic">Sin equipamiento específico</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {tabActiva === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Salud / Condiciones</span>
                            <p className="text-[0.82rem] text-gris-claro leading-relaxed">
                                {cliente?.formularioInscripcion?.saludMedica?.condiciones?.join(', ') || 'Ninguna reportada'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Apto Médico</span>
                            <p className="text-[0.82rem] text-blanco font-bold uppercase">
                                {cliente?.formularioInscripcion?.saludMedica?.aptoMedico || 'No especificado'}
                            </p>
                        </div>
                    </div>
                )}

                {tabActiva === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 pb-10">
                        {/* Selector de ejercicio para métricas (Hardcoded de ejemplo o dinámico si hubiera lista) */}
                        <div className="space-y-2">
                            <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest block mb-1">Tabla de Porcentajes</span>
                            <select
                                onChange={(e) => fetchPorcentajes(e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-xs font-bold text-blanco outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Seleccionar ejercicio testeado...</option>
                                {/* Aquí deberían ir los ejercicios que tienen testeos. Por ahora mockeamos uno */}
                                <option value="sentadilla">Sentadilla Libre</option>
                            </select>
                        </div>

                        {loadingPct ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-naranja" /></div>
                        ) : porcentajes ? (
                            <div className="space-y-4">
                                <div className="bg-naranja/10 border border-naranja/20 p-4 rounded-2xl">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[0.6rem] font-black text-blanco uppercase">1RM Registrado</span>
                                        <span className="text-xl font-black text-naranja">{porcentajes.unRM} kg</span>
                                    </div>
                                    <p className="text-[0.55rem] text-gris font-bold uppercase tracking-widest">Testeo: {new Date(porcentajes.fechaTesteo).toLocaleDateString()}</p>
                                </div>

                                <div className="bg-marino-3/50 border border-marino-4 rounded-2xl overflow-hidden">
                                    <table className="w-full text-[0.65rem]">
                                        <thead className="bg-marino-4/50 text-gris-claro border-b border-marino-4">
                                            <tr>
                                                <th className="p-2 text-left">REPS</th>
                                                <th className="p-2 text-center">%</th>
                                                <th className="p-2 text-right">PESO</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-marino-4">
                                            {[
                                                { r: 1, p: 100, v: porcentajes.p100 },
                                                { r: 3, p: 90.6, v: porcentajes.p90_6 },
                                                { r: 5, p: 85.6, v: porcentajes.p85_6 },
                                                { r: 8, p: 78.6, v: porcentajes.p78_6 },
                                                { r: 10, p: 74.4, v: porcentajes.p74_4 },
                                                { r: 12, p: 70.3, v: porcentajes.p70_3 },
                                            ].map(row => (
                                                <tr key={row.r} className="hover:bg-marino-4 transition-colors">
                                                    <td className="p-2 font-bold text-blanco">{row.r} rep</td>
                                                    <td className="p-2 text-center text-gris">{row.p}%</td>
                                                    <td className="p-2 text-right font-black text-blanco">{row.v} kg</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="w-full py-2 bg-marino-4 text-[0.55rem] font-black text-gris uppercase tracking-widest rounded-lg hover:text-blanco transition-all">Ver Tabla Completa</button>
                            </div>
                        ) : (
                            <div className="p-6 bg-marino-3/50 border border-marino-4 border-dashed rounded-2xl text-center">
                                <Info size={24} className="text-gris mx-auto mb-3 opacity-30" />
                                <p className="text-[0.65rem] text-gris font-medium uppercase tracking-widest leading-relaxed">
                                    No hay testeos previos para este ejercicio.<br />Registrá un testeo para generar la tabla.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {tabActiva === 7 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 pb-6">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest block mb-1">Perfil de Respuesta</span>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {['BAJA', 'NORMAL', 'ALTA'].map(nivel => (
                                    <button
                                        key={nivel}
                                        className={`py-2.5 rounded-lg text-[0.6rem] font-black tracking-widest transition-all border ${(cliente as any).perfilRespuesta?.nivelRespuesta === nivel
                                            ? 'bg-naranja border-naranja text-marino shadow-lg shadow-naranja/20'
                                            : 'bg-marino-3 border-marino-4 text-gris hover:border-gris'
                                            }`}
                                    >
                                        {nivel}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-marino-3/50 border border-marino-4 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Info size={14} className="text-naranja" />
                                <span className="text-[0.6rem] font-black text-blanco uppercase tracking-[0.15em]">Guía del Coach</span>
                            </div>
                            <p className="text-[0.7rem] text-gris leading-relaxed font-medium">
                                Evalúa este perfil tras al menos <span className="text-blanco font-bold">8 semanas</span> de seguimiento.
                            </p>
                        </div>

                        {(cliente as any).formularioInscripcion?.datosPersonales?.edad >= 60 && (
                            <div className="p-4 bg-rojo/5 border border-rojo/20 rounded-xl">
                                <h5 className="text-[0.65rem] font-bold text-rojo uppercase flex items-center gap-2 mb-2">
                                    <Zap size={14} /> Adulto Mayor
                                </h5>
                                <p className="text-[0.7rem] text-gris font-medium leading-relaxed">
                                    Protocolo ACSM: Priorizar seguridad.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {tabActiva === 6 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <button
                            onClick={handleGenerarLink}
                            disabled={generandoLink}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-marino-3 border border-marino-4 hover:border-naranja/50 rounded-lg text-xs font-bold text-blanco uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {generandoLink ? <Loader2 size={16} className="animate-spin text-naranja" /> : <ShieldAlert size={16} className="text-gris" />}
                            Recuperar Cuenta
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
