"use client"
import { useState } from 'react';
import { Plus, Trash2, Copy, Save, Info } from 'lucide-react';
import BannerCicloMenstrual from './BannerCicloMenstrual';

interface VistaSesionProps {
    dia: string;
    onOpenBuscador: () => void;
}

export default function VistaSesion({ dia, onOpenBuscador }: VistaSesionProps) {
    const [ejercicios, setEjercicios] = useState([
        { id: '1', nombre: 'Sentadilla Hack', grupo: 'Cuádriceps', series: 3, reps: '8-10', peso: '80', rir: 2, descanso: '3 min', nota: 'Bajar lento en 3 seg' },
        { id: '2', nombre: 'Prensa 45°', grupo: 'Cuádriceps', series: 3, reps: '10-12', peso: '140', rir: 3, descanso: '2 min', nota: 'Rango completo de movimiento' },
    ]);

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
                        {dia} — Piernas (Cuádriceps)
                    </h2>
                    <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest flex items-center gap-4">
                        <span>Semana 1</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-naranja"></span>
                        <span>RIR 3-4</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-naranja"></span>
                        <span>Lugar: Gimnasio</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-marino-3 border border-marino-4 rounded text-xs font-bold uppercase tracking-wider text-gris-claro hover:text-blanco transition-colors shadow-lg">
                        <Copy size={16} /> Copiar de semana anterior
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-naranja border border-naranja hover:bg-naranja-h transition-colors text-marino font-bold rounded text-xs uppercase tracking-widest shadow-lg shadow-naranja/20">
                        <Save size={16} /> Guardar Sesión
                    </button>
                </div>
            </div>

            {/* Barra Configuracion Rapida */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-marino-3/30 p-4 rounded-lg border border-marino-4">
                {[
                    { label: 'Foco Muscular', val: 'Piernas (Cuád / Glúteo)', type: 'select' },
                    { label: 'RIR Sesión', val: '3–4', type: 'text' },
                    { label: 'Duración Est.', val: '65 min', type: 'text' },
                    { label: 'Tempo Base', val: '3–0–1–0', type: 'text' },
                    { label: 'Notas Grales', val: 'Foco en conexión mente-músculo', type: 'text' },
                ].map((cfg, i) => (
                    <div key={i} className="space-y-1">
                        <label className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest">{cfg.label}</label>
                        <input
                            type="text"
                            defaultValue={cfg.val}
                            className="w-full bg-marino-3 border border-transparent focus:border-naranja/50 rounded px-2 py-1 text-[0.8rem] text-blanco focus:outline-none transition-colors"
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
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-20">Series</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24">Reps</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24">Peso</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-16">RIR</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-28">Descanso</th>
                                <th className="p-4 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem]">Nota Técnica</th>
                                <th className="p-4 text-right w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {ejercicios.map((ej, idx) => (
                                <tr key={ej.id} className="group hover:bg-marino-3/30 transition-colors">
                                    <td className="p-4 text-gris font-bold">{idx + 1}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-blanco mb-0.5">{ej.nombre}</p>
                                        <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">{ej.grupo}</p>
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={ej.series} className="w-12 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={ej.reps} className="w-20 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={ej.peso} className="w-20 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={ej.rir} className="w-10 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={ej.descanso} className="w-24 bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-center text-blanco focus:outline-none transition-all" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" defaultValue={ej.nota} className="w-full bg-marino-3 border border-transparent focus:border-naranja/40 p-1.5 text-blanco focus:outline-none transition-all placeholder:text-gris/50" placeholder="Ej. Bajar lento..." />
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
                <div className="p-1 border-t border-marino-4 bg-marino-3/20">
                    <button
                        onClick={onOpenBuscador}
                        className="w-full p-6 border-2 border-dashed border-marino-4 rounded-lg my-2 flex items-center justify-center gap-3 text-gris group hover:border-naranja/40 hover:text-naranja transition-all"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-barlow-condensed font-black uppercase tracking-widest text-sm">Agregar Ejercicio</span>
                    </button>
                    <div className="px-6 py-3 flex justify-end items-center gap-3 text-gris text-xs font-bold uppercase tracking-widest">
                        <Info size={14} className="text-naranja" />
                        <span>Tonelaje estimado: <span className="text-blanco">~5.240 kg</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
