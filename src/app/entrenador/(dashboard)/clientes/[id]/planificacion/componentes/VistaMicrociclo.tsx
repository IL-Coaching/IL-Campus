"use client"
import { SemanaConDias, DiaConEjercicios } from "@/nucleo/tipos/planificacion.tipos";
import { Calendar, ChevronRight, Moon, Zap, Activity, Info } from "lucide-react";

interface VistaMicrocicloProps {
    semana: SemanaConDias;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const dias = semana.diasSesion.map((d: DiaConEjercicios) => ({
        id: d.id,
        dia: d.diaSemana,
        foco: d.focoMuscular,
        active: true,
        info: `${d.ejercicios.length} ejercicios · ${d.ejercicios.reduce((acc: number, curr: any) => acc + curr.series, 0)} series`,
        color: "text-blanco",
        accent: "bg-naranja"
    }));

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const layout = diasSemana.map(nombre => {
        const existente = dias.find(d => d.dia === nombre);
        if (existente) return existente;
        return {
            id: nombre,
            dia: nombre,
            foco: "Rest",
            active: false,
            info: "Recuperación",
            color: "text-gris/40",
            accent: "bg-marino-4"
        };
    });

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
                        <span className="text-xl font-black text-blanco">{dias.length}</span>
                    </div>
                </div>
            </div>

            {/* Grid de Días con diseño de Cards Profesionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {layout.map((d, i) => (
                    <div
                        key={i}
                        onClick={() => d.active && onSelectSesion(d.dia)}
                        className={`group relative bg-marino-2 border border-marino-4 rounded-2xl p-6 min-h-[220px] flex flex-col transition-all duration-300 ${d.active
                                ? 'cursor-pointer hover:border-naranja/50 hover:bg-marino-3 hover:-translate-y-1 shadow-lg hover:shadow-naranja/5'
                                : 'opacity-40 grayscale-[0.5] cursor-default'
                            }`}
                    >
                        {/* Indicador de Tipo de Día */}
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[0.7rem] text-gris font-black uppercase tracking-[0.2em]">{d.dia}</span>
                            {d.active ? (
                                <div className="w-8 h-8 rounded-lg bg-naranja/10 flex items-center justify-center text-naranja group-hover:bg-naranja group-hover:text-marino transition-all">
                                    <Zap size={16} />
                                </div>
                            ) : (
                                <div className="text-gris/40">
                                    <Moon size={16} />
                                </div>
                            )}
                        </div>

                        <div className="mb-auto">
                            <h4 className={`text-2xl font-barlow-condensed font-black uppercase leading-[0.9] mb-2 ${d.color} group-hover:text-naranja transition-colors`}>
                                {d.foco}
                            </h4>
                            <p className="text-[0.6rem] text-gris font-bold uppercase tracking-widest">
                                {d.info}
                            </p>
                        </div>

                        {d.active ? (
                            <div className="mt-8 flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                <span className="text-[0.65rem] font-black text-naranja tracking-[0.2em] uppercase">Entrar</span>
                                <ChevronRight size={18} className="text-naranja" />
                            </div>
                        ) : (
                            <div className="mt-8 text-[0.65rem] font-bold text-gris/40 uppercase tracking-widest">Off-Day</div>
                        )}

                        {/* Glow effect on hover top-left */}
                        {d.active && (
                            <div className="absolute top-0 left-0 w-12 h-12 bg-naranja/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                    </div>
                ))}
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
