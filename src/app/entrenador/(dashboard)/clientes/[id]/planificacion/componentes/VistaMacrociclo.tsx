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
    subtitulo: string;
    semanasText: string;
    metodo: string;
    numSemanas: number;
    semanasItems: { ordenBloque: number; ordenGlobal: number; id: string }[];
    prog: number;
    color: string;
}

export default function VistaMacrociclo({ macrociclo, limiteSemanas, onSelectMeso, onSelectWeek, onConfigurar, onNuevoMesociclo }: VistaMacrocicloProps) {

    let semanaGlobalActual = 1;

    // Ordenar bloques por la semana más baja que contienen
    const bloquesOrdenadosDB = [...macrociclo.bloquesMensuales].sort((b1, b2) => {
        const min1 = Math.min(...b1.semanas.map(s => s.numeroSemana), Infinity);
        const min2 = Math.min(...b2.semanas.map(s => s.numeroSemana), Infinity);
        return min1 - min2;
    });

    const bloques: BloqueMapped[] = bloquesOrdenadosDB.map((b: BloqueConSemanas, idx: number) => {
        const metodo = b.metodo || (b.objetivo.toLowerCase().includes('fuerza') ? "Enfoque Neuromuscular" : "Enfoque Estructural / Tensión");

        let color = "border-naranja";
        if (b.objetivo.toLowerCase().includes('adaptación')) color = "border-azul-claro";
        else if (b.objetivo.toLowerCase().includes('fuerza')) color = "border-rojo-500";
        else if (b.objetivo.toLowerCase().includes('hipertrofia')) color = "border-naranja";

        // Ordenamos semanas dentro de cada bloque por si vienen desordenadas
        const semanasOrdenadas = [...b.semanas].sort((s1, s2) => s1.numeroSemana - s2.numeroSemana);

        const numSemanas = semanasOrdenadas.length;
        const inicioSemana = semanaGlobalActual;
        const finSemana = inicioSemana + numSemanas - 1;
        semanaGlobalActual += numSemanas;

        // Cálculo de Adherencia Real
        const totalSesiones = semanasOrdenadas.reduce((acc, sem) => acc + sem.diasSesion.length, 0);
        const completadas = semanasOrdenadas.reduce((acc, sem) =>
            acc + sem.diasSesion.filter(dia => dia.sesionesReales && dia.sesionesReales.length > 0).length, 0
        );
        const prog = totalSesiones > 0 ? Math.round((completadas / totalSesiones) * 100) : 0;

        return {
            id: b.id,
            n: idx + 1,
            nombre: b.nombre || b.objetivo,
            subtitulo: b.nombre ? b.objetivo : `Semanas ${inicioSemana}-${finSemana}`,
            semanasText: `Semanas ${inicioSemana}-${finSemana}`,
            numSemanas,
            semanasItems: semanasOrdenadas.map((sem, i) => ({
                ordenBloque: i + 1,
                ordenGlobal: inicioSemana + i,
                id: sem.id
            })),
            metodo,
            prog,
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
            {/* Resumen de Planificación */}
            <div className="relative bg-marino-2 border border-marino-4 p-8 rounded-2xl shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-naranja/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-naranja/10 transition-all"></div>

                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-marino-3 border border-naranja/20 rounded-2xl flex items-center justify-center shadow-inner">
                            <TrendingUp size={32} className="text-naranja" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-bold text-naranja uppercase tracking-widest">Planificación Activa</span>
                            </div>
                            <h3 className="text-xl sm:text-3xl font-barlow-condensed font-black text-blanco uppercase tracking-tight leading-tight sm:leading-none">
                                {macrociclo.duracionSemanas} Semanas <span className="text-gris/40 mx-1 sm:mx-2">/</span>
                                <span className="text-naranja break-words">
                                    {macrociclo.notas ? macrociclo.notas.split('\n')[0].toUpperCase() : "PERSONALIZADA"}
                                </span>
                            </h3>
                            <p className="text-gris font-medium text-[0.65rem] mt-2 uppercase tracking-[0.1em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-naranja animate-pulse"></span>
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

            {/* Lista Vertical de Mesociclos */}
            <div className="flex flex-col gap-4">
                {bloques.map((b) => (
                    <div
                        key={b.id}
                        className={`group bg-marino-2 border-l-8 ${b.color} border border-y-marino-4 border-r-marino-4 rounded-xl transition-all duration-300 relative overflow-hidden flex flex-col ${mesoExpandido === b.id ? 'ring-2 ring-naranja' : 'hover:bg-marino-3 hover:translate-x-1 cursor-pointer'}`}
                        onClick={() => {
                            if (mesoExpandido === b.id) setMesoExpandido(null);
                            else setMesoExpandido(b.id);
                        }}
                    >
                        {/* Icono de fondo decorativo */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-24 opacity-5 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700 grayscale contrast-200 pointer-events-none">
                            {b.nombre.toLowerCase().includes('fuerza') ? <Zap size={140} /> : <Target size={140} />}
                        </div>

                        <div className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center w-full relative z-10">
                            
                            {/* Información Principal */}
                            <div className="flex-1 lg:min-w-[280px]">
                                <span className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em]">{b.subtitulo}</span>
                                <h4 className="text-xl sm:text-2xl font-barlow-condensed font-black uppercase text-blanco leading-none group-hover:text-naranja transition-colors break-words mt-1">{b.nombre}</h4>
                            </div>

                            {/* Método de Trabajo */}
                            <div className="flex-[1.5] hidden md:block bg-marino-3/40 p-3 rounded-xl border border-marino-4/40 group-hover:bg-marino-3 transition-colors w-full lg:w-auto">
                                <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest mb-1 block opacity-60">Método de Trabajo</label>
                                <p className="text-[0.7rem] font-medium text-blanco leading-tight whitespace-pre-wrap line-clamp-2">{b.metodo}</p>
                            </div>

                            {/* Progreso */}
                            <div className="w-full lg:w-48 flex flex-col gap-2 shrink-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-gris">Progreso bloque</span>
                                    <span className={`text-[0.6rem] font-black uppercase tracking-widest ${b.prog === 100 ? 'text-[#22C55E]' : 'text-naranja'}`}>
                                        {b.prog}% {b.prog === 100 ? '(Completado)' : ''}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ${b.prog === 100 ? 'bg-[#22C55E]' : 'bg-naranja'}`}
                                        style={{ width: `${b.prog}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2 lg:ml-4 w-full justify-between lg:justify-start lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-marino-4/50 lg:border-t-0">
                                <button
                                    onClick={(e) => handleEliminar(b.id, e)}
                                    className="p-3 bg-marino-3 rounded-xl text-gris hover:text-rojo hover:bg-rojo/10 transition-all"
                                    title="Eliminar Fase"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectMeso(b.n);
                                    }}
                                    className="p-3 bg-marino-3 rounded-xl text-gris hover:text-blanco transition-colors group-hover:bg-marino-4 flex items-center gap-2"
                                    title="Abrir Vista Detallada de Meso"
                                >
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest lg:hidden">Ver Detalle</span>
                                    <ChevronRight size={18} className={mesoExpandido === b.id ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                </button>
                            </div>
                        </div>

                        {/* Vista Colapsable de Semanas Inline */}
                        {mesoExpandido === b.id && (
                            <div className="px-5 pb-5 pt-3 border-t border-marino-4/50 animate-in slide-in-from-top-4 duration-300 relative z-10 bg-marino-3/20">
                                <label className="text-[0.6rem] font-black text-gris-claro uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                                    Semanas del Bloque <span className="h-px bg-marino-4 flex-1 block"></span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {b.semanasItems.map((sem) => (
                                        <button
                                            key={sem.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectWeek(b.n, sem.ordenGlobal);
                                            }}
                                            className="px-5 py-3.5 bg-marino-3 hover:bg-naranja hover:text-marino border border-marino-4 hover:border-naranja rounded-xl text-left transition-all flex flex-col items-center justify-center min-w-[110px] group/week shadow-sm hover:shadow-naranja/20"
                                        >
                                            <span className="text-[0.55rem] font-black text-naranja group-hover/week:text-marino/70 hover:opacity-80 uppercase block mb-1 transition-colors tracking-widest">Semana {sem.ordenGlobal}</span>
                                            <span className="text-[0.85rem] font-black text-blanco group-hover/week:text-marino uppercase transition-colors">Micro {sem.ordenBloque}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Card de "Próximamente / Slot Vacío" */}
                {bloques.length * 4 < limiteSemanas && bloques.length < 4 && (
                    <div
                        onClick={onNuevoMesociclo}
                        className="border-2 border-dashed border-marino-4 rounded-xl flex items-center justify-center p-6 group hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer opacity-50 hover:opacity-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-marino-3 rounded-full group-hover:scale-110 transition-transform">
                                <Plus size={20} className="text-gris group-hover:text-naranja" />
                            </div>
                            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-gris group-hover:text-naranja">Agregar Nueva Fase / Mesociclo</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
