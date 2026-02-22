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
    Info, // Added Info for notes
    ShieldAlert,
    Copy,
    CheckCircle2,
    Loader2
} from 'lucide-react';

import { ClientePlanificacion } from '@/nucleo/tipos/planificacion.tipos';
import { generarLinkRecuperacionManual } from '@/nucleo/acciones/password.accion';

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
        { id: 6, icon: ShieldAlert, label: 'Cuenta' },
    ];

    const [generandoLink, setGenerandoLink] = useState(false);
    const [linkRecuperacion, setLinkRecuperacion] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);

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

                {/* Placeholders para el resto de tabs */}
                {tabActiva === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Salud / Condiciones</span>
                            <p className="text-[0.82rem] text-gris-claro leading-relaxed">
                                {cliente?.formularioInscripcion?.saludMedica?.condiciones?.join(', ') || 'Ninguna reportada'}
                            </p>
                        </div>
                        {cliente?.formularioInscripcion?.saludMedica?.otrasCondiciones && (
                            <div>
                                <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Otras Observaciones</span>
                                <p className="text-[0.82rem] text-gris-claro leading-relaxed">
                                    {cliente.formularioInscripcion.saludMedica.otrasCondiciones}
                                </p>
                            </div>
                        )}
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Apto Médico</span>
                            <p className="text-[0.82rem] text-blanco font-bold uppercase">
                                {cliente?.formularioInscripcion?.saludMedica?.aptoMedico || 'No especificado'}
                            </p>
                        </div>
                    </div>
                )}

                {tabActiva === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Actividad Diaria</span>
                            <p className="text-[0.82rem] text-blanco font-bold">
                                {cliente?.formularioInscripcion?.estiloDeVida?.actividad || 'No especificada'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[0.65rem] text-naranja font-bold uppercase tracking-widest block mb-1">Calidad de Sueño</span>
                            <p className="text-[0.82rem] text-gris-claro">
                                {cliente?.formularioInscripcion?.estiloDeVida?.sueno || '--'}
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

                {tabActiva === 6 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert size={16} className="text-naranja" />
                                <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest block">Acceso y Seguridad</span>
                            </div>
                            <p className="text-[0.7rem] text-gris leading-relaxed font-medium mb-4">
                                Si el cliente olvidó su contraseña o nunca la generó, puedes crear un link de un solo uso válido por 24 horas y enviárselo manualmente.
                            </p>

                            {!linkRecuperacion ? (
                                <button
                                    onClick={handleGenerarLink}
                                    disabled={generandoLink}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-marino-3 border border-marino-4 hover:border-naranja/50 rounded-lg text-xs font-bold text-blanco uppercase tracking-widest transition-all disabled:opacity-50 group"
                                >
                                    {generandoLink ? <Loader2 size={16} className="animate-spin text-naranja" /> : <ShieldAlert size={16} className="text-gris group-hover:text-naranja transition-colors" />}
                                    Generar Link de Recuperación
                                </button>
                            ) : (
                                <div className="bg-marino border border-naranja/50 rounded-xl p-4 flex flex-col items-center gap-2 relative group animate-in zoom-in-95">
                                    <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest text-center">Link Generado Exitosamente</span>
                                    <p className="text-[0.6rem] text-gris text-center italic break-all px-2">{linkRecuperacion}</p>

                                    <button
                                        onClick={copiarLink}
                                        className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase font-black tracking-widest px-4 py-2.5 bg-naranja/10 text-naranja hover:bg-naranja hover:text-marino transition-colors rounded-lg w-full justify-center"
                                    >
                                        {copiado ? <><CheckCircle2 size={16} /> Link Copiado</> : <><Copy size={16} /> Copiar para WhatsApp</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
