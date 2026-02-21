"use client"
import { TrendingUp, Settings, Plus, ChevronRight } from "lucide-react";
import { MacrocicloCompleto, BloqueConSemanas } from "@/nucleo/tipos/planificacion.tipos";

interface VistaMacrocicloProps {
    macrociclo: MacrocicloCompleto;
    onSelectMeso: (mes: number) => void;
    onConfigurar: () => void;
    onNuevoMesociclo: () => void;
}

interface BloqueMapped {
    id: string;
    n: number;
    nombre: string;
    s: string;
    rir: string | number;
    vol: string;
    prog: number;
    color: string;
}

export default function VistaMacrociclo({ macrociclo, onSelectMeso, onConfigurar, onNuevoMesociclo }: VistaMacrocicloProps) {
    // Calculamos los bloques a partir del macrociclo real
    const bloques: BloqueMapped[] = macrociclo.bloquesMensuales.map((b: BloqueConSemanas, idx: number) => ({
        id: b.id,
        n: idx + 1,
        nombre: b.objetivo,
        s: `${(idx * 4) + 1}-${(idx + 1) * 4}`,
        rir: b.semanas[0]?.RIRobjetivo || "3-4",
        vol: b.semanas[0]?.volumenEstimado || "8-12 sets",
        prog: idx === 0 ? 100 : (idx === 1 ? 45 : 0), // Mock de progreso por ahora
        color: idx === 0 ? "border-[#22C55E]" : (idx === 1 ? "border-[#FF6B00]" : "border-[#EF4444]")
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-naranja/10 rounded-lg">
                        <TrendingUp size={22} className="text-naranja" />
                    </div>
                    <div>
                        <span className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] block mb-0.5">Planificación Activa</span>
                        <h3 className="text-lg font-barlow-condensed font-bold text-blanco uppercase tracking-wide">
                            Macrociclo · {macrociclo.duracionSemanas} Semanas · Inicio {new Date(macrociclo.fechaInicio).toLocaleDateString()}
                        </h3>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onConfigurar}
                        className="flex items-center gap-2 px-4 py-2 bg-marino-3 border border-marino-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gris hover:text-blanco hover:border-gris/30 transition-all"
                    >
                        <Settings size={14} /> Configurar
                    </button>
                    <button
                        onClick={onNuevoMesociclo}
                        className="flex items-center gap-2 px-4 py-2 bg-naranja hover:bg-naranja-h rounded-xl text-xs font-black uppercase tracking-widest text-marino transition-all shadow-lg shadow-naranja/20"
                    >
                        <Plus size={14} /> Nuevo Mesociclo
                    </button>
                </div>
            </div>

            {/* Grid Mesociclos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bloques.map((b: BloqueMapped) => (
                    <div
                        key={b.id}
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
