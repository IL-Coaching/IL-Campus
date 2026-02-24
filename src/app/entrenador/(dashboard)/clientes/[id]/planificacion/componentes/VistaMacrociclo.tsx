"use client"
import { useState } from "react";
import { TrendingUp, Settings, Plus, ChevronRight, Target, Zap, Trash2 } from "lucide-react";
import { MacrocicloCompleto, BloqueConSemanas } from "@/nucleo/tipos/planificacion.tipos";
import { eliminarMesociclo } from "@/nucleo/acciones/planificacion.accion";

interface VistaMacrocicloProps {
    macrociclo: MacrocicloCompleto;
    limiteSemanas: number;
    onSelectMeso: (mes: number) => void;
    onSelectWeek: (mes: number, semana: number) => void;
    onConfigurar: () => void;
    onNuevoMesociclo: () => void;
}

interface BloqueMapped {
    id: string;
    n: number;
    nombre: string;
    semanasText: string;
    metodo: string;
    numSemanas: number;
    semanasItems: { ordenBloque: number; ordenGlobal: number; id: string }[];
    prog: number;
    color: string;
}

export default function VistaMacrociclo({ macrociclo, limiteSemanas, onSelectMeso, onSelectWeek, onConfigurar, onNuevoMesociclo }: VistaMacrocicloProps) {

    let semanaGlobalActual = 1;

    const bloques: BloqueMapped[] = macrociclo.bloquesMensuales.map((b: BloqueConSemanas, idx: number) => {
        const metodo = b.metodo || (b.objetivo.toLowerCase().includes('fuerza') ? "Enfoque Neuromuscular" : "Enfoque Estructural / Tensión");

        let color = "border-naranja";
        if (b.objetivo.toLowerCase().includes('adaptación')) color = "border-azul-claro";
        else if (b.objetivo.toLowerCase().includes('fuerza')) color = "border-rojo-500";
        else if (b.objetivo.toLowerCase().includes('hipertrofia')) color = "border-naranja";

        const numSemanas = b.semanas.length;
        const inicioSemana = semanaGlobalActual;
        const finSemana = inicioSemana + numSemanas - 1;
        semanaGlobalActual += numSemanas;

        return {
            id: b.id,
            n: idx + 1,
            nombre: b.objetivo,
            semanasText: `Semanas ${inicioSemana}-${finSemana}`,
            numSemanas,
            semanasItems: b.semanas.map((sem, i) => ({
                ordenBloque: i + 1,
                ordenGlobal: inicioSemana + i,
                id: sem.id
            })),
            metodo,
            prog: idx === 0 ? 100 : 0, // Simplificación temporal
            color: color === "border-azul-claro" ? "border-[#60A5FA]" :
                (color === "border-rojo-500" ? "border-[#EF4444]" : "border-[#FF6B00]")
        };
    });

    const [mesoExpandido, setMesoExpandido] = useState<string | null>(null);

    const handleEliminar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("¿Seguro que deseas eliminar esta fase? Se borrarán todas las semanas y sesiones asociadas.")) {
            try {
                const res = await eliminarMesociclo(id);
                if (res.exito) window.location.reload();
                else alert(res.error || "No se pudo eliminar.");
            } catch (err) {
                console.error(err);
                alert("Ocurrió un error al intentar eliminar la fase.");
            }
        }
    };

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
                                {macrociclo.duracionSemanas} Semanas <span className="text-gris/40 mx-2">/</span>
                                <span className="text-naranja">
                                    {macrociclo.notas ? macrociclo.notas.split('\n')[0] : "Distribución Personalizada IL-Coaching"}
                                </span>
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
                            disabled={macrociclo.duracionSemanas >= limiteSemanas}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[0.7rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-naranja/20 ${macrociclo.duracionSemanas >= limiteSemanas ? "bg-marino-4 text-gris cursor-not-allowed" : "bg-naranja hover:bg-naranja-h text-marino active:scale-95"
                                }`}
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
                        className={`group bg-marino-2 border-l-8 ${b.color} border border-y-marino-4 border-r-marino-4 rounded-xl transition-all duration-300 relative overflow-hidden flex flex-col h-full ${mesoExpandido === b.id ? 'ring-2 ring-naranja' : 'hover:bg-marino-3 hover:-translate-y-1 cursor-pointer'}`}
                        onClick={() => {
                            if (mesoExpandido === b.id) setMesoExpandido(null);
                            else setMesoExpandido(b.id);
                        }}
                    >
                        {/* Icono de fondo decorativo */}
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all grayscale contrast-200">
                            {b.nombre.toLowerCase().includes('fuerza') ? <Zap size={120} /> : <Target size={120} />}
                        </div>

                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1 pr-6">
                                    <span className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em]">Fase {b.n} • {b.semanasText}</span>
                                    <h4 className="text-2xl font-barlow-condensed font-black uppercase text-blanco leading-none group-hover:text-naranja transition-colors break-words">{b.nombre}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleEliminar(b.id, e)}
                                        className="p-2 bg-marino-3 rounded-lg text-gris hover:text-rojo transition-all relative z-10"
                                        title="Eliminar Fase"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectMeso(b.n);
                                        }}
                                        className="p-2 bg-marino-3 rounded-lg text-gris hover:text-blanco transition-colors group-hover:bg-marino-4 relative z-10"
                                        title="Abrir Vista Detallada de Meso"
                                    >
                                        <ChevronRight size={20} className={mesoExpandido === b.id ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                    </button>
                                </div>
                            </div>

                            {/* Detalle Metodológico - Guía Gualda Style */}
                            <div className="space-y-3 mt-6">
                                <div className="bg-marino-3/50 p-4 rounded-xl border border-marino-4/50 group-hover:bg-marino-3 transition-colors">
                                    <label className="text-[0.6rem] font-black text-naranja uppercase tracking-widest mb-1.5 block opacity-50">Método de Trabajo</label>
                                    <p className="text-[0.8rem] font-medium text-blanco leading-relaxed whitespace-pre-wrap line-clamp-2">{b.metodo}</p>
                                </div>
                            </div>

                            {/* Vista Colapsable de Semanas Inline */}
                            {mesoExpandido === b.id && (
                                <div className="mt-6 pt-6 border-t border-marino-4/50 space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <label className="text-[0.6rem] font-black text-gris-claro uppercase tracking-[0.2em] mb-2 block">Semanas del Bloque</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {b.semanasItems.map((sem) => {
                                            return (
                                                <button
                                                    key={sem.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectWeek(b.n, sem.ordenGlobal);
                                                    }}
                                                    className="p-3 bg-marino-3 hover:bg-naranja/10 border border-marino-4 rounded-xl text-left transition-all group/week"
                                                >
                                                    <span className="text-[0.55rem] font-black text-naranja uppercase block">S. {sem.ordenGlobal}</span>
                                                    <span className="text-[0.7rem] font-bold text-blanco group-hover/week:text-naranja transition-colors">Micro {sem.ordenBloque}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                {bloques.length * 4 < limiteSemanas && bloques.length < 4 && (
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
