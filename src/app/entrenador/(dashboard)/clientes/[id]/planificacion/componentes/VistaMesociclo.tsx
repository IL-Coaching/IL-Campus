"use client"
import { BloqueConSemanas, SemanaConDias, DiaConEjercicios } from "@/nucleo/tipos/planificacion.tipos";

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-marino-4 pb-6">
                <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                    Mes {mes} — {bloque.objetivo}
                </h2>
                <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest">
                    {semanas.length} Semanas · RIR {bloque.semanas[0]?.RIRobjetivo || '3-4'} General · Volumen {bloque.semanas[0]?.volumenEstimado || 'Medio'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {semanas.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => onSelectSemana(s.n)}
                        className="bg-marino-2 border border-marino-4 rounded-xl p-5 cursor-pointer hover:border-naranja/50 transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-[0.15em] border ${s.tipo === 'Trabajo' ? 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/5' :
                                s.tipo === 'Deload' ? 'text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/5' :
                                    'text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/5'
                                }`}>
                                {s.tipo}
                            </span>
                            <span className="text-gris group-hover:text-naranja transition-colors font-black text-xl font-barlow-condensed leading-none">#{s.n}</span>
                        </div>

                        <h4 className="text-3xl font-barlow-condensed font-black text-blanco mb-4">Semana {s.n}</h4>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Sets Est.</span>
                                <span className="text-xs font-bold text-blanco italic">{s.vol}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">RIR Intención</span>
                                <span className="text-xs font-bold text-naranja uppercase tracking-tighter">{s.rir}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-marino-4">
                            {s.dias.map((d: string, i: number) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${d.toLowerCase().includes('push') ? 'bg-naranja' :
                                    d.toLowerCase().includes('pull') ? 'bg-[#22C55E]' :
                                        d.toLowerCase().includes('piern') ? 'bg-[#60A5FA]' : 'bg-[#A78BFA]'
                                    }`} title={d}></span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
