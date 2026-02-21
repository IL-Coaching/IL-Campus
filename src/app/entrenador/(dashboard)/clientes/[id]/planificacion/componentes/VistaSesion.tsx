"use client"
import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Save, Info, Loader2, Dumbbell, ClipboardList, Gauge, Scale, Activity } from 'lucide-react';
import BannerCicloMenstrual from './BannerCicloMenstrual';
import { DiaConEjercicios, EjercicioConDetalle } from '@/nucleo/tipos/planificacion.tipos';
import { guardarCambiosEjercicio, eliminarEjercicio } from '@/nucleo/acciones/planificacion.accion';
import { useRouter } from 'next/navigation';

interface VistaSesionProps {
    diaObjeto: DiaConEjercicios;
    semanaNombre: string;
    onOpenBuscador: () => void;
}

export default function VistaSesion({ diaObjeto, semanaNombre, onOpenBuscador }: VistaSesionProps) {
    const [ejercicios, setEjercicios] = useState<EjercicioConDetalle[]>(diaObjeto.ejercicios);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Sincronizar state si cambia el objeto de prop (ej. cambio de día)
    useEffect(() => {
        setEjercicios(diaObjeto.ejercicios);
    }, [diaObjeto]);

    const handleEliminar = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar este ejercicio de la sesión?")) return;
        const res = await eliminarEjercicio(id);
        if (res.exito) {
            setEjercicios(prev => prev.filter(e => e.id !== id));
            router.refresh();
        }
    };

    const handleUpdateChange = (id: string, field: string, value: any) => {
        setEjercicios(prev => prev.map(ej => {
            if (ej.id === id) {
                return { ...ej, [field]: value };
            }
            return ej;
        }));
    };

    const handleGuardarTodo = async () => {
        setSaving(true);
        try {
            for (const ej of ejercicios) {
                await guardarCambiosEjercicio(ej.id, {
                    series: ej.series,
                    repsMin: ej.repsMin,
                    repsMax: ej.repsMax,
                    RIR: ej.RIR,
                    descanso: ej.descansoSegundos,
                    tempo: ej.tempo || undefined,
                    notas: ej.notasTecnicas || undefined
                });
            }
            router.refresh();
            alert("Sesión guardada correctamente.");
        } catch (e) {
            alert("Error al guardar algunos cambios.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* Banner condicional Ciclo */}
            <BannerCicloMenstrual fase="Folicular" />

            {/* Header Sesion Profesional */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-marino-4 pb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-naranja/10 border border-naranja/20 rounded-2xl flex items-center justify-center">
                        <ClipboardList className="text-naranja" size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-bold text-naranja uppercase tracking-widest">
                                {semanaNombre}
                            </span>
                        </div>
                        <h2 className="text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            {diaObjeto.diaSemana} — <span className="text-naranja">{diaObjeto.focoMuscular}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => alert("Copiando estructura...")}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-marino-3 border border-marino-4 rounded-xl text-[0.65rem] font-black uppercase tracking-widest text-gris hover:text-blanco transition-all shadow-lg shadow-black/20"
                    >
                        <Copy size={16} /> Copiar estructura
                    </button>
                    <button
                        onClick={handleGuardarTodo}
                        disabled={saving}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-10 py-2.5 bg-naranja border border-naranja hover:bg-naranja-h transition-all text-marino font-black rounded-xl text-[0.65rem] uppercase tracking-widest shadow-xl shadow-naranja/20"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Guardando..." : "Guardar Plan"}
                    </button>
                </div>
            </div>

            {/* Barra Metodológica (Gualda Style) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-marino-2/50 p-5 rounded-2xl border border-marino-4 shadow-inner">
                {[
                    { label: 'Foco Muscular', val: diaObjeto.focoMuscular, icon: Activity },
                    { label: 'Objetivo Sesión', val: 'Hipertrofia / Sarcopl.', icon: Gauge },
                    { label: 'Lugar', val: 'Gimnasio', icon: Dumbbell },
                    { label: 'Tempo Maestro', val: '3–1–2–1', icon: Activity },
                    { label: 'Notas', val: 'Intensidad 75-80% RM', icon: ClipboardList },
                ].map((cfg, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <label className="text-[0.6rem] text-naranja font-black uppercase tracking-widest block opacity-70">{cfg.label}</label>
                        </div>
                        <input
                            type="text"
                            defaultValue={cfg.val}
                            className="w-full bg-marino-3 border border-marino-4/50 focus:border-naranja/50 rounded-xl px-3 py-2 text-[0.82rem] text-blanco focus:outline-none transition-all font-bold"
                        />
                    </div>
                ))}
            </div>

            {/* Tabla de Planificación con Feedback Técnico */}
            <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-marino-4 bg-marino-3/80">
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-12 text-center">#</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem]">Ejercicio / Patrón</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">Técnica/Feedback</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-20 text-center">Sets</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">RIR/RPE</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">Descanso</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-28 text-center">Serie 1-5 (Reps/Kg)</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">Tonelaje</th>
                                <th className="p-5 text-right w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {ejercicios.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-marino-3 rounded-3xl border border-marino-4 border-dashed">
                                                <Dumbbell size={48} className="text-marino-4" />
                                            </div>
                                            <p className="text-gris italic text-sm max-w-xs font-medium uppercase tracking-wide">
                                                Planilla vacía. Utilizá el botón inferior para estructurar la sesión.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : ejercicios.map((ej, idx) => (
                                <tr key={ej.id} className="group hover:bg-marino-3/40 transition-all">
                                    <td className="p-5 text-gris font-black text-lg text-center opacity-30 group-hover:opacity-100 transition-opacity">{idx + 1}</td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <p className="font-black text-blanco mb-0.5 text-[0.9rem] uppercase tracking-tight group-hover:text-naranja transition-colors">{ej.ejercicio.nombre}</p>
                                            <span className="text-[0.6rem] text-naranja font-black uppercase tracking-[0.2em]">{ej.ejercicio.grupoMuscular}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <textarea
                                            value={ej.notasTecnicas || ''}
                                            onChange={(e) => handleUpdateChange(ej.id, 'notasTecnicas', e.target.value)}
                                            rows={2}
                                            className="w-full bg-marino-3/50 border border-marino-4/50 p-2 rounded-lg text-gris-claro text-[0.7rem] focus:outline-none focus:border-naranja/40 transition-all resize-none font-medium italic"
                                            placeholder="Feedback técnico..."
                                        />
                                    </td>
                                    <td className="p-5">
                                        <input
                                            type="number"
                                            value={ej.series}
                                            onChange={(e) => handleUpdateChange(ej.id, 'series', parseInt(e.target.value))}
                                            className="w-full bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-blanco focus:outline-none focus:border-naranja/50 transition-all font-black"
                                        />
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <input
                                                type="number"
                                                value={ej.RIR}
                                                onChange={(e) => handleUpdateChange(ej.id, 'RIR', parseInt(e.target.value))}
                                                className="w-12 bg-marino-3 border border-transparent p-2 rounded-lg text-center text-naranja focus:outline-none font-black text-base"
                                            />
                                            <span className="text-[0.55rem] font-black text-gris uppercase tracking-tighter">Objetivo</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1 bg-marino-3 px-2 rounded-lg border border-marino-4/30">
                                            <input
                                                type="text"
                                                value={ej.descansoSegundos}
                                                onChange={(e) => handleUpdateChange(ej.id, 'descansoSegundos', parseInt(e.target.value))}
                                                className="w-10 bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.75rem] font-bold"
                                            />
                                            <span className="text-gris text-[0.6rem] font-black uppercase tracking-widest">seg</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-1 justify-center">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={`w-8 h-10 rounded border text-[0.6rem] flex items-center justify-center font-black ${s <= ej.series ? 'bg-marino-3 border-naranja/20 text-naranja' : 'bg-marino-4/20 border-transparent text-gris/20'}`}>
                                                    {s <= ej.series ? '--' : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="text-xs font-black text-blanco/80 uppercase tracking-tighter">0.0 KG</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleEliminar(ej.id)}
                                            className="text-gris/30 hover:text-[#EF4444] hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Tabla Profesional */}
                <div className="p-6 bg-marino-3/30 border-t border-marino-4">
                    <button
                        onClick={onOpenBuscador}
                        className="w-full p-8 border-2 border-dashed border-marino-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-gris group hover:border-naranja/40 hover:bg-naranja/[0.03] hover:text-naranja transition-all"
                    >
                        <div className="p-4 bg-marino-3 border border-marino-4 rounded-2xl group-hover:bg-naranja group-hover:text-marino group-hover:border-naranja transition-all shadow-inner">
                            <Plus size={24} />
                        </div>
                        <span className="font-barlow-condensed font-black uppercase tracking-[0.3em] text-sm">Añadir ejercicio al arsenal</span>
                    </button>

                    {/* Metricas de Pie de Sesion - Gualda Training Style */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        <div className="flex items-center gap-4 p-4 bg-marino-3 border border-marino-4 rounded-2xl">
                            <div className="p-3 bg-[#EF4444]/10 rounded-xl"><Activity className="text-[#EF4444]" size={20} /></div>
                            <div>
                                <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-0.5">DOMS / Agujetas</label>
                                <input placeholder="Nivel 0-10" className="bg-transparent border-none p-0 text-blanco font-bold text-xs focus:ring-0 placeholder:text-gris/30" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-marino-3 border border-marino-4 rounded-2xl">
                            <div className="p-3 bg-[#60A5FA]/10 rounded-xl"><Gauge className="text-[#60A5FA]" size={20} /></div>
                            <div>
                                <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-0.5">Esfuerzo Gral.</label>
                                <input placeholder="RPE Sesión" className="bg-transparent border-none p-0 text-blanco font-bold text-xs focus:ring-0 placeholder:text-gris/30" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-marino-3 border border-marino-4 rounded-2xl">
                            <div className="p-3 bg-[#22C55E]/10 rounded-xl"><Scale className="text-[#22C55E]" size={20} /></div>
                            <div>
                                <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-0.5">Pesaje del Día</label>
                                <input placeholder="--.- kg" className="bg-transparent border-none p-0 text-blanco font-bold text-xs focus:ring-0 placeholder:text-gris/30" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-marino-3 border border-marino-4 rounded-2xl border-naranja/20">
                            <div className="p-3 bg-naranja/10 rounded-xl"><Dumbbell className="text-naranja" size={20} /></div>
                            <div>
                                <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-0.5">Tonelaje SESIÓN</label>
                                <span className="text-blanco font-black text-xs uppercase tracking-tighter">--.--- KG</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-marino-4/50 flex flex-col md:flex-row justify-between items-center gap-4 text-gris text-[0.6rem] font-bold uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2 px-4 py-2 bg-marino-3 rounded-full border border-marino-4">
                            <Info size={14} className="text-naranja" />
                            <span>Metodología de Alto Rendimiento — IL-CAMPUS Professional</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-naranja"></div> Sarcoplasmática</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Neural / Fuerza</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

