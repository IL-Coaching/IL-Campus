"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SemanaConDias } from "@/nucleo/tipos/planificacion.tipos";
import { Calendar, Trash2, Zap, Plus, Activity, Info } from "lucide-react";
import { crearSesion, eliminarSesion } from "@/nucleo/acciones/planificacion.accion";

interface VistaMicrocicloProps {
    semana: SemanaConDias;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

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
                    <h2 className="text-5xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                        Semana {semana.numeroSemana} <span className="text-gris/30 mx-2">—</span> {semana.objetivoSemana}
                    </h2>
                </div>

                <div className="flex gap-6 items-center bg-marino-2 p-4 rounded-2xl border border-marino-4 shadow-inner">
                    <div className="text-center px-4 border-r border-marino-4">
                        <span className="text-[0.55rem] font-bold text-gris uppercase tracking-widest block mb-1">Carga RIR</span>
                        <span className="text-xl font-black text-naranja">{semana.RIRobjetivo}</span>
                    </div>
                    <div className="text-center px-4 border-r border-marino-4">
                        <span className="text-[0.55rem] font-bold text-gris uppercase tracking-widest block mb-1">Volumen</span>
                        <span className="text-xl font-black text-blanco">{semana.volumenEstimado}</span>
                    </div>
                    <div className="text-center px-4">
                        <span className="text-[0.55rem] font-bold text-gris uppercase tracking-widest block mb-1">Sesiones</span>
                        <span className="text-xl font-black text-blanco">{semana.diasSesion.length}</span>
                    </div>
                </div>
            </div>

            {/* Grid de Días */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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

            {/* Leyenda Meta-data */}
            <div className="bg-naranja/[0.03] border border-naranja/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-naranja/10 rounded-xl">
                        <Activity className="text-naranja" size={24} />
                    </div>
                    <div>
                        <p className="text-blanco font-bold text-sm">Distribución de Carga Semanal</p>
                        <p className="text-gris text-xs font-medium">La intensidad (RIR) se ajusta dinámicamente según la fase del bloque.</p>
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
