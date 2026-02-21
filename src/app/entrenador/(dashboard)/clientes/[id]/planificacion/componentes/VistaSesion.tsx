"use client"
import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Save, Info } from 'lucide-react';
import BannerCicloMenstrual from './BannerCicloMenstrual';
import { DiaConEjercicios, EjercicioConDetalle } from '@/nucleo/tipos/planificacion.tipos';

interface VistaSesionProps {
    diaObjeto: DiaConEjercicios;
    semanaNombre: string;
    onOpenBuscador: () => void;
}

export default function VistaSesion({ diaObjeto, semanaNombre, onOpenBuscador }: VistaSesionProps) {
    const [ejercicios, setEjercicios] = useState<EjercicioConDetalle[]>(diaObjeto.ejercicios);

    // Sincronizar state si cambia el objeto de prop (ej. cambio de día)
    useEffect(() => {
        setEjercicios(diaObjeto.ejercicios);
    }, [diaObjeto]);

    const eliminarEjercicio = (id: string) => {
        setEjercicios(prev => prev.filter(e => e.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* Banner condicional Ciclo */}
            <BannerCicloMenstrual fase="Folicular" />

            {/* Header Sesion */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-marino-4 pb-6">
                <div>
                    <h2 className="text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                        {diaObjeto.diaSemana} — {diaObjeto.focoMuscular}
                    </h2>
                    <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest flex items-center gap-4">
                        <span>{semanaNombre}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-naranja"></span>
                        <span>Lugar: Gimnasio</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => alert("Función de copiado disponible próximamente.")}
                        className="flex items-center gap-2 px-4 py-2 bg-marino-3 border border-marino-4 rounded text-xs font-bold uppercase tracking-wider text-gris-claro hover:text-blanco transition-colors shadow-lg"
                    >
                        <Copy size={16} /> Copiar de anterior
                    </button>
                    <button
                        onClick={() => alert("Cambios guardados localmente. Persistencia en DB próximamente.")}
                        className="flex items-center gap-2 px-6 py-2 bg-naranja border border-naranja hover:bg-naranja-h transition-colors text-marino font-bold rounded text-xs uppercase tracking-widest shadow-lg shadow-naranja/20"
                    >
                        <Save size={16} /> Guardar Sesión
                    </button>
                </div>
            </div>

            {/* Barra Configuracion Rapida */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-marino-3/30 p-4 rounded-lg border border-marino-4 shadow-inner">
                {[
                    { label: 'Foco Muscular', val: diaObjeto.focoMuscular, type: 'text' },
                    { label: 'Objetivo', val: 'Hipertrofia', type: 'text' },
                    { label: 'Duración Est.', val: '65 min', type: 'text' },
                    { label: 'Tempo Base', val: '3–1–1–0', type: 'text' },
                    { label: 'Notas Grales', val: 'Cargas progresivas', type: 'text' },
                ].map((cfg, i) => (
                    <div key={i} className="space-y-1">
                        <label className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest">{cfg.label}</label>
                        <input
                            type="text"
                            defaultValue={cfg.val}
                            className="w-full bg-marino-3 border border-transparent focus:border-naranja/50 rounded px-2 py-1 text-[0.82rem] text-blanco focus:outline-none transition-colors"
                        />
                    </div>
                ))}
            </div>

            {/* Tabla Ejercicios */}
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-marino-4 bg-marino-3/50">
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-8">#</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem]">Ejercicio</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-20">Ser.</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24">Reps</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-16">RIR</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-28">Pausa</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem]">Nota Técnica</th>
                                <th className="p-4 text-right w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {ejercicios.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-gris italic">No hay ejercicios agregados a esta sesión.</td>
                                </tr>
                            ) : ejercicios.map((ej, idx) => (
                                <tr key={ej.id} className="group hover:bg-marino-3/30 transition-colors">
                                    <td className="p-4 text-gris font-bold">{idx + 1}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-blanco mb-0.5">{ej.ejercicio.nombre}</p>
                                        <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">{ej.ejercicio.grupoMuscular}</p>
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={ej.series} className="w-12 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={`${ej.repsMin}-${ej.repsMax}`} className="w-20 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={ej.RIR} className="w-10 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={`${ej.descansoSegundos}s`} className="w-24 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={ej.notasTecnicas || ''} className="w-full bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-blanco focus:outline-none transition-all placeholder:text-gris/50" placeholder="Ej. Bajar lento..." />
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => eliminarEjercicio(ej.id)}
                                            className="text-gris group-hover:text-[#EF4444] transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Tabla */}
                <div className="p-2 bg-marino-3/20">
                    <button
                        onClick={onOpenBuscador}
                        className="w-full p-4 border-2 border-dashed border-marino-4 rounded-xl flex items-center justify-center gap-3 text-gris group hover:border-naranja/40 hover:text-naranja transition-all"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-barlow-condensed font-black uppercase tracking-widest text-sm">Agregar Ejercicio</span>
                    </button>
                    <div className="px-6 py-3 flex justify-end items-center gap-3 text-gris text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                        <Info size={14} className="text-naranja" />
                        <span>Tonelaje estimado: <span className="text-blanco font-black tracking-tight">-- kg</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
