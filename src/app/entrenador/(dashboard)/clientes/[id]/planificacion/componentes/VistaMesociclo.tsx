"use client"
import { BloqueConSemanas, SemanaConDias, DiaConEjercicios } from "@/nucleo/tipos/planificacion.tipos";
import { Layers, ChevronRight, Activity, Zap, Flame, MoveUp } from "lucide-react";

interface VistaMesocicloProps {
    bloque: BloqueConSemanas;
    mes: number;
    onSelectSemana: (semana: number) => void;
}

export default function VistaMesociclo({ bloque, mes, onSelectSemana }: VistaMesocicloProps) {
    const semanas = bloque.semanas.map((s: SemanaConDias) => ({
        id: s.id,
        n: s.numeroSemana,
        tipo: s.esFaseDeload ? "Deload" : (s.esSemanaTesteo ? "Testeo" : "Trabajo"),
        rir: s.RIRobjetivo || "3-4",
        vol: s.volumenEstimado || "8 sets",
        dias: s.diasSesion.map((d: DiaConEjercicios) => d.focoMuscular)
    }));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Mesociclo Professional */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-marino-4 pb-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-naranja/10 border border-naranja/20 rounded-2xl">
                        <Layers size={28} className="text-naranja" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] block">Desglose de Microciclos</span>
                            <span className="px-2 py-0.5 bg-marino-3 border border-marino-4 rounded text-[0.55rem] font-bold text-gris uppercase tracking-widest">Mes {mes}</span>
                        </div>
                        <h2 className="text-5xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            Mesociclo: {bloque.objetivo}
                        </h2>
                    </div>
                </div>

                <div className="flex gap-4 w-full xl:w-auto">
                    <div className="flex-1 xl:flex-none flex flex-col bg-marino-2 p-4 rounded-xl border border-marino-4 min-w-[140px]">
                        <span className="text-[0.55rem] font-black text-gris uppercase tracking-widest mb-1.5 opacity-60">Volumen Global</span>
                        <div className="flex items-center gap-2">
                            <Activity className="text-naranja" size={16} />
                            <span className="text-lg font-black text-blanco uppercase tracking-tight">{bloque.semanas[0]?.volumenEstimado || 'ESTÁNDAR'}</span>
                        </div>
                    </div>
                    <div className="flex-1 xl:flex-none flex flex-col bg-marino-2 p-4 rounded-xl border border-marino-4 min-w-[140px]">
                        <span className="text-[0.55rem] font-black text-gris uppercase tracking-widest mb-1.5 opacity-60">Intensidad Media</span>
                        <div className="flex items-center gap-2">
                            <Flame className="text-naranja" size={16} />
                            <span className="text-lg font-black text-blanco uppercase tracking-tight">RIR {bloque.semanas[0]?.RIRobjetivo || '3'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Semanas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {semanas.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => onSelectSemana(s.n)}
                        className="group bg-marino-2 border border-marino-4 rounded-2xl p-6 cursor-pointer hover:border-naranja/50 hover:bg-marino-3 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                    >
                        {/* Glow decorativo según tipo */}
                        <div className={`absolute -top-4 -right-4 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${s.tipo === 'Trabajo' ? 'bg-[#22C55E]' : s.tipo === 'Deload' ? 'bg-[#EAB308]' : 'bg-[#A78BFA]'
                            }`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-[0.15em] border ${s.tipo === 'Trabajo' ? 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10' :
                                    s.tipo === 'Deload' ? 'text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/10' :
                                        'text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/10'
                                }`}>
                                {s.tipo}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-marino-4/50 flex items-center justify-center text-gris group-hover:text-blanco transition-colors shadow-inner">
                                <span className="font-black text-sm">#{s.n}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-4xl font-barlow-condensed font-black text-blanco mb-2 group-hover:text-naranja transition-colors uppercase leading-none">Semana {s.n}</h4>
                            <div className="flex items-center gap-2 text-[0.65rem] text-gris font-bold uppercase tracking-widest">
                                <Activity size={12} />
                                <span>{s.dias.length} días de entrenamiento</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-2 px-3 bg-marino-3/50 rounded-lg border border-marino-4/50">
                                <span className="text-[0.6rem] text-gris-claro uppercase font-black tracking-widest">Carga</span>
                                <span className="text-xs font-black text-naranja uppercase tracking-tighter">RIR {s.rir}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-marino-3/50 rounded-lg border border-marino-4/50">
                                <span className="text-[0.6rem] text-gris-claro uppercase font-black tracking-widest">Volumen</span>
                                <span className="text-xs font-black text-blanco italic uppercase tracking-tighter">{s.vol}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-marino-4 flex justify-between items-center">
                            <div className="flex -space-x-1.5">
                                {s.dias.map((d: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border border-marino-2 ${d.toLowerCase().includes('push') ? 'bg-naranja' :
                                                d.toLowerCase().includes('pull') ? 'bg-[#22C55E]' :
                                                    d.toLowerCase().includes('piern') ? 'bg-[#60A5FA]' : 'bg-[#A78BFA]'
                                            }`}
                                        title={d}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                <span className="text-[0.6rem] font-black text-naranja uppercase tracking-widest">Micro</span>
                                <ChevronRight size={14} className="text-naranja" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slot para agregar semana si faltan */}
                {semanas.length < 4 && (
                    <div className="border-2 border-dashed border-marino-4 rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer opacity-30 hover:opacity-100">
                        <div className="p-4 bg-marino-3 rounded-full mb-4">
                            <MoveUp size={24} className="text-gris group-hover:text-naranja animate-bounce" />
                        </div>
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gris text-center">Configurar Microciclo</span>
                    </div>
                )}
            </div>
        </div>
    );
}
