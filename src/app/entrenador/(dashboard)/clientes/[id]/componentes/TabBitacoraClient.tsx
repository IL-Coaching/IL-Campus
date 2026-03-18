/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, XCircle, Clock, Calendar } from "lucide-react";

const DIAS_SEMANA_ORDEN = ["lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado", "domingo"];
const obtenerOrdenDia = (dia: string) => {
    const index = DIAS_SEMANA_ORDEN.indexOf(dia.trim().toLowerCase());
    return index === -1 ? 99 : index;
};

interface Props {
    macrociclos: any[]; // Todo el árbol anidado
}

export default function TabBitacoraClient({ macrociclos }: Props) {
    const [semanasAbiertas, setSemanasAbiertas] = useState<Record<string, boolean>>({});
    const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>({});

    const toggleSemana = (id: string) => {
        setSemanasAbiertas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDia = (id: string) => {
        setDiasAbiertos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 fade-up visible">
            {macrociclos.length === 0 ? (
                <div className="bg-marino-2/40 border border-marino-4/30 border-dashed rounded-[2rem] p-12 text-center text-gris-claro">
                    No hay planes registrados para este cliente.
                </div>
            ) : (
                macrociclos.map((macro, i) => (
                    <div key={macro.id} className="space-y-6">
                        <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-naranja/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h2 className="text-2xl font-barlow-condensed font-black text-blanco uppercase tracking-tight mb-2">
                                Planificación Histórica {i > 0 ? `(Anterior ${i})` : '(Actual)'}
                            </h2>
                            <p className="text-sm text-gris-claro flex items-center gap-2">
                                <Calendar size={14} className="text-naranja" />
                                Inicio: {new Date(macro.fechaInicio).toLocaleDateString()} • {macro.duracionSemanas} Semanas Totales
                            </p>

                            <div className="mt-8 space-y-8">
                                {macro.bloquesMensuales.map((bloque: any) => (
                                    <div key={bloque.id} className="space-y-4">
                                        <h3 className="text-xs font-black text-naranja/80 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-naranja/80 rounded-full"></div>
                                            {bloque.objetivo}
                                        </h3>

                                        <div className="space-y-3">
                                            {bloque.semanas.map((semana: any) => (
                                                <div key={semana.id} className="bg-marino-3/30 border border-marino-4/50 rounded-2xl overflow-hidden transition-all">
                                                    {/* Acordeón Semana */}
                                                    <button
                                                        onClick={() => toggleSemana(semana.id)}
                                                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-marino-3/50 transition-colors text-left"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-lg font-barlow-condensed font-black text-blanco uppercase">
                                                                    Semana {semana.numeroSemana}
                                                                </span>
                                                                {semana.esFaseDeload && (
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-verde/10 border border-verde/20 text-verde text-[0.55rem] font-bold uppercase tracking-widest">
                                                                        Deload
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gris-claro">{semana.objetivoSemana}</p>
                                                        </div>
                                                        <ChevronDown size={20} className={`text-gris transition-transform duration-300 ${semanasAbiertas[semana.id] ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Contenido Semana (Días) */}
                                                    {semanasAbiertas[semana.id] && (
                                                        <div className="p-4 md:p-5 pt-0 border-t border-marino-4/30 space-y-3 bg-marino-3/10">
                                                            {semana.diasSesion.length === 0 ? (
                                                                <p className="text-xs text-gris italic px-2">Sin sesiones planificadas en esta semana.</p>
                                                            ) : (
                                                                [...semana.diasSesion].sort((a: any, b: any) => obtenerOrdenDia(a.diaSemana) - obtenerOrdenDia(b.diaSemana)).map((dia: any) => {
                                                                    const sesionReal = dia.sesionesReales?.[0]; // Tomamos la última/única
                                                                    let estado = 'PENDIENTE';
                                                                    let uiStyles = 'bg-marino-2 border-marino-4 opacity-100'; // Default
                                                                    let Icon = Clock;
                                                                    let labelEstado = 'Pendiente / Futura';

                                                                    if (sesionReal) {
                                                                        if (sesionReal.completada) {
                                                                            estado = 'COMPLETADA';
                                                                            uiStyles = 'bg-verde/5 border-verde/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]';
                                                                            Icon = CheckCircle2;
                                                                            labelEstado = 'Completada ✔';
                                                                        } else {
                                                                            estado = 'PARCIAL';
                                                                            uiStyles = 'bg-naranja/5 border-naranja/40';
                                                                            Icon = AlertCircle;
                                                                            labelEstado = 'Parcial / Incompleta';
                                                                        }
                                                                    } else {
                                                                        // Simplificado: Si pertenece al pasado relativo de la fecha inicio (muy a groso modo)
                                                                        const fechaEstimada = new Date(macro.fechaInicio);
                                                                        fechaEstimada.setDate(fechaEstimada.getDate() + (semana.numeroSemana * 7));
                                                                        if (fechaEstimada < new Date()) {
                                                                            estado = 'OMITIDA';
                                                                            uiStyles = 'bg-transparent border-marino-4 border-dashed opacity-50 grayscale';
                                                                            Icon = XCircle;
                                                                            labelEstado = 'Omitida';
                                                                        }
                                                                    }

                                                                    return (
                                                                        <div key={dia.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${uiStyles}`}>
                                                                            {/* Tarjeta Día */}
                                                                            <button
                                                                                onClick={() => toggleDia(dia.id)}
                                                                                className="w-full flex items-center justify-between p-4"
                                                                            >
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className={`p-2 rounded-lg ${estado === 'COMPLETADA' ? 'bg-verde/10 text-verde' : estado === 'PARCIAL' ? 'bg-naranja/10 text-naranja' : estado === 'OMITIDA' ? 'bg-marino-3 text-gris' : 'bg-marino-3 text-blanco'}`}>
                                                                                        <Icon size={18} />
                                                                                    </div>
                                                                                    <div className="text-left">
                                                                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                                                            <span className="text-sm font-black text-blanco uppercase tracking-widest">{dia.diaSemana}</span>
                                                                                            <span className={`text-[0.6rem] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${estado === 'COMPLETADA' ? 'text-verde border-verde/20' : estado === 'PARCIAL' ? 'text-naranja border-naranja/20' : estado === 'OMITIDA' ? 'text-gris border-marino-4' : 'text-gris-claro border-marino-4'}`}>
                                                                                                {labelEstado}
                                                                                            </span>
                                                                                        </div>
                                                                                        <span className="text-xs text-gris-claro mt-1 block">
                                                                                            Foco: {dia.focoMuscular} • {dia.ejercicios.length} Ejs.
                                                                                            {sesionReal && <span className="ml-2">• Realizada: {new Date(sesionReal.fecha).toLocaleDateString()}</span>}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <ChevronDown size={16} className={`text-gris transition-transform ${diasAbiertos[dia.id] ? 'rotate-180' : ''}`} />
                                                                            </button>

                                                                            {/* Zoom-in de ejercicios (Tabla Planificado vs Realizado) */}
                                                                            {diasAbiertos[dia.id] && (
                                                                                <div className="p-4 pt-0 border-t border-marino-4/30 mt-2 bg-marino-2/50">
                                                                                    <div className="overflow-x-auto mt-4">
                                                                                        <table className="w-full text-left border-collapse">
                                                                                            <thead>
                                                                                                <tr className="border-b border-marino-4">
                                                                                                    <th className="py-2 px-3 text-[0.6rem] font-black text-gris uppercase tracking-widest w-1/3">Ejercicio Planificado (Molde)</th>
                                                                                                    <th className="py-2 px-3 text-[0.6rem] font-black text-gris uppercase tracking-widest w-2/3">Ejecución Real (Series anotadas)</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="text-xs text-gris-claro divide-y divide-marino-4/30">
                                                                                                {dia.ejercicios.map((ejPlan: any) => {
                                                                                                    // Filtrar series reales para este ejercicio particular
                                                                                                    const seriesEsteEjercicio = sesionReal?.series?.filter((s:any) => s.ejercicioPlanificadoId === ejPlan.id) || [];
                                                                                                    
                                                                                                    return (
                                                                                                        <tr key={ejPlan.id} className="hover:bg-marino-3/20 transition-colors">
                                                                                                            <td className="py-3 px-3 align-top">
                                                                                                                <span className="font-bold text-blanco block mb-1">{ejPlan.nombreLibre || ejPlan.ejercicio?.nombre || 'Ejercicio Borrado'}</span>
                                                                                                                <span className="text-[0.65rem] text-naranja/80 block">Plan: {ejPlan.series}x{ejPlan.repsMin}-{ejPlan.repsMax} reps</span>
                                                                                                                {ejPlan.RIR !== null && <span className="text-[0.65rem] text-gris block">RIR {ejPlan.RIR}</span>}
                                                                                                            </td>
                                                                                                            <td className="py-3 px-3 align-top">
                                                                                                                {seriesEsteEjercicio.length > 0 ? (
                                                                                                                    <div className="flex flex-wrap gap-2">
                                                                                                                        {seriesEsteEjercicio.map((serie:any, idx:number) => (
                                                                                                                            <div key={serie.id} className="bg-marino-3 border border-marino-4 px-2 py-1 rounded text-[0.65rem] font-mono shadow-inner shadow-black/20 text-blanco flex items-center gap-1.5">
                                                                                                                                <span className="text-gris">S{idx+1}-</span> 
                                                                                                                                {serie.pesoKg !== null ? <span className="text-naranja font-bold">{serie.pesoKg}kg</span> : <span className="text-gris italic">--kg</span>} 
                                                                                                                                <span className="text-gris-claro font-medium">x {serie.repsReales ?? '--'}</span>
                                                                                                                            </div>
                                                                                                                        ))}
                                                                                                                    </div>
                                                                                                                ) : (
                                                                                                                    <span className="text-[0.65rem] italic text-marino-4/80 flex items-center gap-1">
                                                                                                                        <XCircle size={10} /> Ejercicio Omitido o vacío
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    );
                                                                                                })}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
