"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SemanaConDias } from "@/nucleo/tipos/planificacion.tipos";
import { Calendar, Trash2, Zap, Plus, Activity, Info, BarChart3, HelpCircle, AlertTriangle, Layers } from "lucide-react";
import { crearSesion, eliminarSesion, obtenerVolumenSemanal, actualizarSemana } from "@/nucleo/acciones/planificacion.accion";
import { ModeloPeriodizacion } from "@prisma/client";

interface VistaMicrocicloProps {
    semana: SemanaConDias;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [volumen, setVolumen] = useState<{ grupoMuscular: string; seriesTotal: number; estado: string }[]>([]);
    const [loadingVol, setLoadingVol] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchVolumen = async () => {
            setLoadingVol(true);
            const res = await obtenerVolumenSemanal(semana.id);
            if (res.exito && res.volumen) {
                setVolumen(res.volumen);
            }
            setLoadingVol(false);
        };
        fetchVolumen();
    }, [semana.id]);

    const handleCrearSesion = async (dia: string) => {
        setIsCreating(true);
        const res = await crearSesion(semana.id, dia);
        if (res.exito) {
            router.refresh();
        } else {
            alert("Error al crear sesión: " + res.error);
        }
        setIsCreating(false);
    };

    const handleEliminarSesion = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta sesión permanentemente?")) return;
        const res = await eliminarSesion(id);
        if (res.exito) {
            router.refresh();
        } else {
            alert("Error al eliminar: " + res.error);
        }
    };

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const hayInterferencia = () => {
        return semana.diasSesion.some(s => {
            const esCardio = s.focoMuscular && s.focoMuscular.toLowerCase().includes('cardio');
            return esCardio && s.ejercicios.length > 0;
        });
    };

    const interferencia = hayInterferencia();

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Microciclo */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-marino-4 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-marino-3 rounded-lg border border-marino-4">
                            <Calendar size={18} className="text-naranja" />
                        </div>
                        <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] block">Distribución Semanal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-5xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            Semana {semana.numeroSemana} <span className="text-gris/30 mx-2">—</span> {semana.objetivoSemana}
                        </h2>
                        {semana.esFaseDeload && (
                            <span className="bg-naranja/20 text-naranja px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest border border-naranja/30 animate-pulse">
                                Fase de Deload
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Selector de Periodización Científica */}
                    <div className="relative group/sel">
                        <div className="flex items-center gap-3 bg-marino-3/50 border border-marino-4 px-4 py-2.5 rounded-xl transition-all hover:border-naranja/40">
                            <Layers size={16} className="text-naranja" />
                            <select
                                defaultValue={semana.modeloPeriodizacion}
                                onChange={async (e) => {
                                    await actualizarSemana(semana.id, { modeloPeriodizacion: e.target.value as ModeloPeriodizacion });
                                    router.refresh();
                                }}
                                className="bg-transparent text-xs font-black text-blanco uppercase tracking-widest outline-none cursor-pointer pr-2"
                            >
                                <option value="LINEAL" className="bg-marino-2 text-blanco">Periodización Lineal</option>
                                <option value="ONDULANTE" className="bg-marino-2 text-blanco">Periodización Ondulante</option>
                                <option value="CONJUGADA" className="bg-marino-2 text-blanco">Periodización Conjugada</option>
                                <option value="PERSONALIZADO" className="bg-marino-2 text-blanco">Personalizado</option>
                            </select>
                        </div>
                        <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-marino-4 border border-blanco/10 rounded-xl text-[0.65rem] text-blanco leading-relaxed invisible group-hover/sel:visible opacity-0 group-hover/sel:opacity-100 transition-all z-50 shadow-2xl">
                            <span className="text-naranja font-black">Lineal:</span> Progresión de carga constante.<br />
                            <span className="text-naranja font-black">Ondulante:</span> Variación diaria de volumen/intensidad.<br />
                            <span className="text-naranja font-black">Conjugada:</span> Valla múltiples capacidades a la vez.
                        </div>
                    </div>

                    <div className="flex gap-6 items-center bg-marino-2 p-3.5 rounded-2xl border border-marino-4 shadow-inner">
                        <div className="text-center px-6">
                            <span className="text-[0.55rem] font-bold text-gris uppercase tracking-widest block mb-1">Sesiones Planificadas</span>
                            <span className="text-xl font-black text-blanco group-hover:text-naranja transition-colors">{semana.diasSesion.length} Sesiones</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Científico - Volumen Semanal IUSCA */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {diasSemana.map((nombre) => {
                        const sesionesEnEsteDia = semana.diasSesion.filter(d => d.diaSemana === nombre);
                        return (
                            <div key={nombre} className="space-y-3">
                                <div className="text-[0.7rem] text-gris font-black uppercase tracking-[0.2em] border-b border-marino-4 pb-2 mb-4">
                                    {nombre}
                                </div>
                                {sesionesEnEsteDia.length > 0 ? (
                                    sesionesEnEsteDia.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => onSelectSesion(s.diaSemana)}
                                            className="group relative bg-marino-2 border border-marino-4 rounded-2xl p-6 min-h-[160px] flex flex-col transition-all duration-300 cursor-pointer hover:border-naranja/50 hover:bg-marino-3 shadow-lg hover:shadow-naranja/5"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-naranja/10 flex items-center justify-center text-naranja group-hover:bg-naranja group-hover:text-marino transition-all">
                                                    <Zap size={16} />
                                                </div>
                                                <button
                                                    onClick={(e) => handleEliminarSesion(e, s.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gris hover:text-[#EF4444] transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="mb-auto">
                                                <h4 className="text-xl font-barlow-condensed font-black uppercase leading-tight text-blanco group-hover:text-naranja transition-colors">
                                                    {s.focoMuscular}
                                                </h4>
                                                <span className="text-[0.6rem] text-gris font-bold uppercase tracking-widest">
                                                    {s.ejercicios.length} Ejercicios
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        onClick={() => !isCreating && handleCrearSesion(nombre)}
                                        className="group h-[160px] border-2 border-dashed border-marino-4 rounded-2xl flex flex-col items-center justify-center p-4 opacity-40 hover:opacity-100 hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer"
                                    >
                                        <div className="p-3 bg-marino-3 rounded-full mb-2 group-hover:bg-naranja group-hover:text-marino transition-all shadow-inner">
                                            <Plus size={16} />
                                        </div>
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gris">Añadir</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-marino-2 border border-marino-4 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-naranja/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-naranja/10 transition-colors"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-naranja/10 rounded-xl border border-naranja/20">
                                <BarChart3 size={20} className="text-naranja" />
                            </div>
                            <div>
                                <h4 className="text-xl font-barlow-condensed font-black uppercase text-blanco leading-none">Volumen Semanal</h4>
                                <span className="text-[0.55rem] font-bold text-naranja uppercase tracking-widest">Consenso IUSCA 2021</span>
                            </div>
                        </div>
                        <div className="group/tip relative">
                            <HelpCircle size={18} className="text-gris cursor-help hover:text-blanco transition-colors" />
                            <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-marino-4 border border-blanco/10 rounded-xl text-[0.7rem] text-blanco leading-relaxed invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all z-50 shadow-2xl backdrop-blur-md">
                                &quot;Según el consenso de la IUSCA (Schoenfeld et al., 2021), el volumen mínimo efectivo es de 10 series semanales por grupo muscular para optimizar la hipertrofia. Más de 20 series puede superar el umbral de recuperación individual.&quot;
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 relative z-10">
                        {loadingVol ? (
                            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-naranja border-t-transparent rounded-full animate-spin"></div></div>
                        ) : volumen.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gris text-xs font-medium italic">Sin datos de volumen.<br />Agrega ejercicios a las sesiones para calcular.</p>
                            </div>
                        ) : volumen.map((v) => (
                            <div key={v.grupoMuscular} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[0.7rem] font-black text-blanco uppercase tracking-wider">{v.grupoMuscular}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[0.6rem] font-black uppercase ${v.estado === 'BAJO' ? 'text-rojo' : v.estado === 'ELEVADO' ? 'text-naranja' : 'text-[#22C55E]'}`}>
                                            {v.estado === 'BAJO' ? '⚠ Bajo mínimo' : v.estado === 'ELEVADO' ? '⚠ Elevado' : '✓ óptimo'}
                                        </span>
                                        <span className="text-sm font-black text-blanco">{v.seriesTotal}</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden flex">
                                    {Array.from({ length: Math.min(v.seriesTotal, 20) }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-full flex-1 border-r border-marino-2 last:border-0 ${v.estado === 'BAJO' ? 'bg-rojo' : v.estado === 'ELEVADO' ? 'bg-naranja' : 'bg-[#22C55E]'}`}
                                        />
                                    ))}
                                    {v.seriesTotal > 20 && (
                                        <div className="h-full bg-rojo/50 w-4 flex items-center justify-center">
                                            <span className="text-[0.5rem] font-bold text-blanco">+</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerta de Interferencia Cardio-Fuerza (Capa Científica) */}
            {interferencia && (
                <div className="bg-naranja/10 border border-naranja/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="p-3 bg-naranja/20 rounded-xl text-naranja">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black text-blanco uppercase tracking-widest mb-1">¡Alerta de Interferencia Detectada!</h4>
                        <p className="text-xs text-gris font-medium leading-relaxed">
                            Detectada concurrencia de cardio y fuerza en el mismo día. <span className="text-naranja font-bold">IUSCA Position Stand:</span> Se recomienda separar las sesiones al menos <span className="text-blanco font-bold">6 horas</span> para minimizar la interferencia en las vías de señalización de mTOR y optimizar la hipertrofia.
                        </p>
                    </div>
                    <button className="px-5 py-2.5 bg-naranja/10 hover:bg-naranja/20 border border-naranja/30 rounded-xl text-[0.6rem] font-black text-naranja uppercase tracking-widest transition-all">
                        Ver Detalles Científicos
                    </button>
                </div>
            )}

            {/* Leyenda Meta-data */}
            <div className="bg-naranja/[0.03] border border-naranja/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-naranja/10 rounded-xl">
                        <Activity className="text-naranja" size={24} />
                    </div>
                    <div>
                        <p className="text-blanco font-bold text-sm">Arquitectura Basada en Evidencia</p>
                        <p className="text-gris text-xs font-medium">Planificación 100% personalizada ajustada a los umbrales de recuperación IUSCA.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-marino-3 rounded-xl border border-marino-4">
                    <Info size={16} className="text-gris" />
                    <span className="text-gris text-[0.65rem] font-bold uppercase tracking-widest">Recuperación completa sugerida en Out-Days</span>
                </div>
            </div>
        </div>
    );
}
