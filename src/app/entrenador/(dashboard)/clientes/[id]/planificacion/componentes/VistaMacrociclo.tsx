"use client"
import { TrendingUp, Settings, Plus, ChevronRight, Target, FlaskConical, Zap } from "lucide-react";
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
    metodo: string;
    rango: string;
    prog: number;
    color: string;
}

export default function VistaMacrociclo({ macrociclo, onSelectMeso, onConfigurar, onNuevoMesociclo }: VistaMacrocicloProps) {

    // Mapeo dinámico con lógica de "Gualda Style" para los campos extras
    const bloques: BloqueMapped[] = macrociclo.bloquesMensuales.map((b: BloqueConSemanas, idx: number) => {
        // Lógica de placeholders basada en el objetivo si no hay datos específicos
        const metodo = b.metodo || "Leg, Push, Pull, Adicional";
        const rango = b.rangoReferencia || (b.objetivo.toLowerCase().includes('fuerza') ? "6-8 reps" : "8-12 reps");

        // Colores según fase
        let color = "border-naranja";
        if (b.objetivo.toLowerCase().includes('adaptación')) color = "border-azul-claro";
        if (b.objetivo.toLowerCase().includes('fuerza')) color = "border-rojo-500";
        if (b.objetivo.toLowerCase().includes('hipertrofia')) color = "border-naranja";

        return {
            id: b.id,
            n: idx + 1,
            nombre: b.objetivo,
            s: `${(idx * 4) + 1}-${(idx + 1) * 4}`,
            rir: b.semanas[0]?.RIRobjetivo || "3-4",
            vol: b.semanas[0]?.volumenEstimado || "Medio",
            metodo,
            rango,
            prog: idx === 0 ? 100 : (idx === 1 ? 0 : 0),
            color: color === "border-azul-claro" ? "border-[#60A5FA]" :
                (color === "border-rojo-500" ? "border-[#EF4444]" : "border-[#FF6B00]")
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Macrociclo Profundo */}
            <div className="relative bg-marino-2 border border-marino-4 p-8 rounded-2xl shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-naranja/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-naranja/10 transition-all"></div>

                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-marino-3 border border-naranja/20 rounded-2xl flex items-center justify-center shadow-inner">
                            <TrendingUp size={32} className="text-naranja" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] block">Arquitectura de Entrenamiento</span>
                                <span className="px-2 py-0.5 bg-marino-3 border border-marino-4 rounded text-[0.55rem] font-bold text-gris uppercase tracking-widest">v2.0 Beta</span>
                            </div>
                            <h3 className="text-3xl font-barlow-condensed font-black text-blanco uppercase tracking-tight leading-none">
                                Macrociclo: {macrociclo.duracionSemanas} Semanas <span className="text-gris/40 mx-2">/</span> <span className="text-naranja">Bajar intensidad al 50% cada 4 sem.</span>
                            </h3>
                            <p className="text-gris font-medium text-xs mt-2 uppercase tracking-[0.1em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-naranja animate-pulse"></span>
                                Inicio: {new Date(macrociclo.fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <button
                            onClick={onConfigurar}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-marino-3 border border-marino-4 rounded-xl text-[0.7rem] font-black uppercase tracking-widest text-gris hover:text-blanco hover:border-naranja/30 transition-all group"
                        >
                            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" /> Configurar Macro
                        </button>
                        <button
                            onClick={onNuevoMesociclo}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-naranja hover:bg-naranja-h rounded-xl text-[0.7rem] font-black uppercase tracking-widest text-marino transition-all shadow-xl shadow-naranja/20 active:scale-95"
                        >
                            <Plus size={18} /> Nuevo Mesociclo
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid de Mesociclos Detallados */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {bloques.map((b) => (
                    <div
                        key={b.id}
                        onClick={() => onSelectMeso(b.n)}
                        className={`group bg-marino-2 border-l-8 ${b.color} border border-y-marino-4 border-r-marino-4 rounded-xl cursor-pointer hover:bg-marino-3 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full`}
                    >
                        {/* Icono de fondo decorativo */}
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all grayscale contrast-200">
                            {b.nombre.toLowerCase().includes('fuerza') ? <Zap size={120} /> : <Target size={120} />}
                        </div>

                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <span className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em]">{b.n > 1 ? `Meses ${b.n}-${b.n + 1}` : `Semanas 1-4`}</span>
                                    <h4 className="text-2xl font-barlow-condensed font-black uppercase text-blanco leading-none group-hover:text-naranja transition-colors">{b.nombre}</h4>
                                </div>
                                <div className="p-2 bg-marino-3 rounded-lg text-gris group-hover:text-blanco transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>

                            {/* Detalle Metodológico - Guía Gualda Style */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-marino-3/50 p-3 rounded-lg border border-marino-4/50">
                                    <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest mb-1 block opacity-70">Método</label>
                                    <p className="text-[0.75rem] font-bold text-blanco line-clamp-1">{b.metodo}</p>
                                </div>
                                <div className="bg-marino-3/50 p-3 rounded-lg border border-marino-4/50">
                                    <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest mb-1 block opacity-70">Rango</label>
                                    <p className="text-[0.75rem] font-bold text-blanco line-clamp-1">{b.rango}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-xs">
                                    <FlaskConical size={14} className="text-gris" />
                                    <span className="text-gris font-bold uppercase tracking-wider text-[0.6rem]">RIR Objetivo: <span className="text-blanco">{b.rir}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <Target size={14} className="text-gris" />
                                    <span className="text-gris font-bold uppercase tracking-wider text-[0.6rem]">Volumen: <span className="text-blanco">{b.vol}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Footer con Progreso */}
                        <div className="p-4 bg-marino-3/30 border-t border-marino-4 mt-auto">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gris">Estado del Bloque</span>
                                <span className={`text-[0.6rem] font-black uppercase tracking-widest ${b.prog === 100 ? 'text-[#22C55E]' : 'text-naranja'}`}>
                                    {b.prog === 100 ? 'Completado' : 'En Curso'}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-marino-4 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full transition-all duration-1000 ${b.prog === 100 ? 'bg-[#22C55E]' : 'bg-naranja'}`}
                                    style={{ width: `${b.prog}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Card de "Próximamente / Slot Vacío" */}
                {bloques.length < 4 && (
                    <div
                        onClick={onNuevoMesociclo}
                        className="border-2 border-dashed border-marino-4 rounded-xl flex flex-col items-center justify-center p-12 group hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer opacity-40 hover:opacity-100"
                    >
                        <div className="p-4 bg-marino-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-gris group-hover:text-naranja" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gris group-hover:text-naranja">Agregar Fase</span>
                    </div>
                )}
            </div>
        </div>
    );
}
