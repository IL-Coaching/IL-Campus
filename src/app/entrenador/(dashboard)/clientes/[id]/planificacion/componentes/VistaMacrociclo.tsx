"use client"
import { TrendingUp, Settings, Plus, ChevronRight } from "lucide-react";

interface VistaMacrocicloProps {
    onSelectMeso: (mes: number) => void;
}

export default function VistaMacrociclo({ onSelectMeso }: VistaMacrocicloProps) {
    const bloques = [
        { n: 1, s: "1-4", nombre: "Acumulación", tipo: "v" /* volumen */, color: "border-[#22C55E]", rir: "3-4", vol: "8-12 sets", prog: 100 },
        { n: 2, s: "5-8", nombre: "Intensificación", tipo: "i" /* intensidad */, color: "border-[#FF6B00]", rir: "1-2", vol: "6-10 sets", prog: 45 },
        { n: 3, s: "9-12", nombre: "Realización", tipo: "r" /* realization */, color: "border-[#EF4444]", rir: "0-1", vol: "4-6 sets", prog: 0 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-naranja/10 border border-naranja/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-naranja" />
                    <span className="text-sm font-bold text-blanco uppercase tracking-widest font-barlow-condensed">
                        Plan activo · GymRat 🧠 · 3 meses · 90 días
                    </span>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-marino-3 border border-marino-4 rounded text-xs font-bold uppercase tracking-wider text-gris hover:text-blanco transition-colors">
                        <Settings size={14} /> Configurar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-naranja/20 border border-naranja/40 rounded text-xs font-bold uppercase tracking-wider text-naranja hover:bg-naranja/30 transition-colors">
                        <Plus size={14} /> Nuevo Mesociclo
                    </button>
                </div>
            </div>

            {/* Grid Mesociclos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bloques.map((b) => (
                    <div
                        key={b.n}
                        onClick={() => onSelectMeso(b.n)}
                        className={`group bg-marino-2 border-l-4 ${b.color} border border-y-marino-4 border-r-marino-4 p-6 rounded-r-lg cursor-pointer hover:bg-marino-3 transition-all duration-300 relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                            <ChevronRight size={24} className="text-naranja" />
                        </div>

                        <span className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-1 block">Mes {b.n} · Sem {b.s}</span>
                        <h4 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-4 leading-none">{b.nombre}</h4>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-[0.7rem] uppercase font-bold">
                                <span className="text-gris tracking-widest">RIR Objetivo</span>
                                <span className="text-blanco">{b.rir}</span>
                            </div>
                            <div className="flex justify-between text-[0.7rem] uppercase font-bold">
                                <span className="text-gris tracking-widest">Volumen General</span>
                                <span className="text-blanco">{b.vol}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[0.6rem] font-black uppercase tracking-widest text-gris">
                                <span>Progreso</span>
                                <span>{b.prog}%</span>
                            </div>
                            <div className="h-1 w-full bg-marino-4 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${b.prog === 100 ? 'bg-[#22C55E]' : 'bg-naranja'}`}
                                    style={{ width: `${b.prog}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
