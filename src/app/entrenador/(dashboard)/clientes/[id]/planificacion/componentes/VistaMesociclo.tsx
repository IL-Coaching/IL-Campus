"use client"

interface VistaMesocicloProps {
    mes: number;
    onSelectSemana: (semana: number) => void;
}

export default function VistaMesociclo({ mes, onSelectSemana }: VistaMesocicloProps) {
    const semanas = [
        { n: 1, tipo: "Trabajo", rir: "3-4", vol: "8 sets", dias: ["Push", "Pull", "Piernas", "FB"] },
        { n: 2, tipo: "Trabajo", rir: "2-3", vol: "9 sets", dias: ["Push", "Pull", "Piernas", "FB"] },
        { n: 3, tipo: "Trabajo", rir: "1-2", vol: "10 sets", dias: ["Push", "Pull", "Piernas", "FB"] },
        { n: 4, tipo: "Deload", rir: "4-5", vol: "4 sets", dias: ["Push", "Pull", "Piernas", "FB"] },
        { n: 5, tipo: "Testeo", rir: "0-1", vol: "2 sets", dias: ["Push", "Pull", "Piernas", "FB"] },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-marino-4 pb-6">
                <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                    Mes {mes} — Acumulación
                </h2>
                <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest">
                    5 Semanas · RIR 3-4 General · Volumen Medio
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {semanas.map((s) => (
                    <div
                        key={s.n}
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
                            {s.dias.map((d, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${d === 'Push' ? 'bg-naranja' :
                                        d === 'Pull' ? 'bg-[#22C55E]' :
                                            d === 'Piernas' ? 'bg-[#60A5FA]' : 'bg-[#A78BFA]'
                                    }`} title={d}></span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
