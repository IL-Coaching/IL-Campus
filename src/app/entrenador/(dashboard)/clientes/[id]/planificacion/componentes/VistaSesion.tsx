"use client"
import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Save, Info, Loader2, Dumbbell, ClipboardList, Gauge, Scale, Activity, ShieldAlert, ChevronDown, ChevronUp, ChevronRight, AlertCircle, GripVertical } from 'lucide-react';
import BannerCicloMenstrual from './BannerCicloMenstrual';
import { DiaConEjercicios, EjercicioConDetalle, SemanaConDias } from '@/nucleo/tipos/planificacion.tipos';
import { guardarCambiosEjercicio, eliminarEjercicio, reordenarEjercicios } from '@/nucleo/acciones/planificacion.accion';
import { obtenerCondicionesClinicas } from '@/nucleo/acciones/cliente.accion';
import { ZONAS_INTENSIDAD } from '@/nucleo/planificacion/zonas.constantes';
import { useRouter, useParams } from 'next/navigation';
import SelectorEjercicioCelda from './SelectorEjercicioCelda';


interface VistaSesionProps {
    diaObjeto: DiaConEjercicios;
    semanaObjeto: SemanaConDias;
    semanaNombre: string;
    onOpenBuscador: () => void;
}

export default function VistaSesion({ diaObjeto, semanaObjeto, semanaNombre, onOpenBuscador }: VistaSesionProps) {
    const [ejercicios, setEjercicios] = useState<EjercicioConDetalle[]>(diaObjeto.ejercicios);
    const [saving, setSaving] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [showNotes, setShowNotes] = useState(false);
    const [condiciones, setCondiciones] = useState<string[]>([]);
    const [showClinical, setShowClinical] = useState(true);
    const [drawerZonasOpen, setDrawerZonasOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const clienteId = params.id as string;

    const handleDragStart = (idx: number) => {
        setDraggingIdx(idx);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (idx: number) => {
        if (draggingIdx === null || draggingIdx === idx) return;

        const newEjercicios = [...ejercicios];
        const [draggedItem] = newEjercicios.splice(draggingIdx, 1);
        newEjercicios.splice(idx, 0, draggedItem);

        setEjercicios(newEjercicios);
        setDraggingIdx(null);

        // Persistir orden
        await reordenarEjercicios(diaObjeto.id, newEjercicios.map(e => e.id));
    };

    useEffect(() => {
        const fetchCondiciones = async () => {
            const res = await obtenerCondicionesClinicas(clienteId);
            if (res.exito && res.condiciones) {
                setCondiciones(res.condiciones);
            }
        };
        fetchCondiciones();
    }, [clienteId]);

    const evaluarPerfilIntensidad = () => {
        if (ejercicios.length === 0) return null;

        const rir_0_1 = ejercicios.filter(e => e.RIR !== null && e.RIR <= 1).length;
        const rir_2_3 = ejercicios.filter(e => e.RIR !== null && e.RIR >= 2 && e.RIR <= 3).length;
        const rir_4_mas = ejercicios.filter(e => e.RIR !== null && e.RIR >= 4).length;

        const total = ejercicios.length;
        const ratioProductivo = (rir_2_3 / total) * 100;

        // IUSCA: Mayoría (>60%) en RIR 2-3
        const distribucionCorrecta = ratioProductivo >= 60;

        let mensaje = "";
        if (!distribucionCorrecta) {
            mensaje = "Distribución de intensidad subóptima: El consenso IUSCA recomienda que la mayoría de series se mantengan en RIR 2-3 (zona productiva).";
        }

        return { rir_0_1, rir_2_3, rir_4_mas, total, distribucionCorrecta, mensaje };
    };

    const perfil = evaluarPerfilIntensidad();

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

    const handleUpdateChange = (id: string, updates: Partial<EjercicioConDetalle>) => {
        setEjercicios(prev => prev.map(ej => {
            if (ej.id === id) {
                return { ...ej, ...updates };
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
                    pesoSugerido: ej.pesoSugerido || undefined,
                    notas: ej.notasTecnicas || undefined,
                    ejercicioId: ej.ejercicioId,
                    nombreLibre: ej.nombreLibre,
                    esBiblioteca: ej.esBiblioteca,
                    esTesteo: ej.esTesteo,
                    modalidadTesteo: ej.modalidadTesteo
                });
            }
            router.refresh();
            alert("Sesión guardada correctamente.");
        } catch (error) {
            console.error(error);
            alert("Error al guardar algunos cambios.");
        } finally {
            setSaving(false);
        }
    };

    const detectarZona = (min: number, max: number): keyof typeof ZONAS_INTENSIDAD | null => {
        if (!min || !max) return null;
        const media = (min + max) / 2;
        if (media >= 1 && media <= 5) return 'NEURAL';
        if (media >= 6 && media <= 8) return 'NEURO_ENDOCRINA';
        if (media >= 9 && media <= 12) return 'HIPERTROFIA';
        if (media >= 13) return 'RESISTENCIA';
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* Banner Ciclo Menstrual (Si aplica) */}
            <BannerCicloMenstrual fase="Folicular" />

            {/* Banner de Alerta Clínica - Capa Científica */}
            {condiciones.length > 0 && (
                <div className="bg-rojo/10 border border-rojo/30 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                    <div
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-rojo/5 transition-colors"
                        onClick={() => setShowClinical(!showClinical)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-rojo/20 rounded-xl text-rojo">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-blanco uppercase tracking-widest">Alerta Clínica: Protocolo de Seguridad</h4>
                                <p className="text-[0.65rem] font-bold text-rojo/80 uppercase tracking-tighter">Atleta con {condiciones.length} condiciones específicas registradas</p>
                            </div>
                        </div>
                        {showClinical ? <ChevronUp className="text-rojo" /> : <ChevronDown className="text-rojo" />}
                    </div>

                    {showClinical && (
                        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-rojo/20 bg-marino-3/30">
                            <div className="flex flex-wrap gap-2 py-2">
                                {condiciones.map(c => (
                                    <span key={c} className="bg-rojo/20 text-rojo px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase border border-rojo/30">{c}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h5 className="text-[0.6rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-rojo" /> Precauciones ACSM
                                    </h5>
                                    <p className="text-[0.7rem] text-gris leading-relaxed font-medium">
                                        Evitar maniobra de Valsalva intensa. Controlar frecuencia cardíaca y sensaciones de disnea. En caso de mareo o fatiga extrema, detener sesión inmediatamente.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-[0.6rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                        <Scale size={12} className="text-rojo" /> Variables Críticas
                                    </h5>
                                    <ul className="text-[0.7rem] text-gris list-disc pl-4 space-y-1 font-medium">
                                        <li>RPE de sesión no debe superar 8/10.</li>
                                        <li>Descansos prolongados (&gt;2 min) para asegurar repolarización.</li>
                                        <li>Hidratación constante obligatoria.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Header Sesion Profesional — Mobile Optimized */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-marino-4 pb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-naranja/10 border border-naranja/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-naranja/5">
                        <ClipboardList className="text-naranja" size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-black text-naranja uppercase tracking-widest leading-none">
                                {semanaNombre}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            {diaObjeto.diaSemana} — <span className="text-naranja">{diaObjeto.focoMuscular}</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setDrawerZonasOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-marino-3 border border-marino-4 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-naranja hover:bg-marino-4 transition-all shadow-lg active:scale-95"
                    >
                        <Gauge size={16} /> <span className="hidden md:inline">Ver</span> Zonas
                    </button>
                    <button
                        onClick={() => alert("Copiando estructura...")}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-marino-3 border border-marino-4 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-gris hover:text-blanco transition-all shadow-lg active:scale-95"
                    >
                        <Copy size={16} /> <span className="hidden md:inline">Copiar</span> Estructura
                    </button>
                    <button
                        onClick={handleGuardarTodo}
                        disabled={saving}
                        className="col-span-2 md:col-span-1 md:flex-1 flex items-center justify-center gap-3 px-8 py-4 md:py-3 bg-gradient-to-r from-naranja to-orange-400 hover:from-orange-400 hover:to-naranja transition-all text-marino font-black rounded-xl text-[0.65rem] uppercase tracking-widest shadow-xl shadow-naranja/20 active:scale-95 border-none"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? "Guardando..." : "Guardar Sesión"}
                    </button>
                </div>
            </div>

            {/* Foco & Metodología — Acordeón Inteligente */}
            <div className="bg-marino-2 border border-marino-4 rounded-3xl shadow-2xl overflow-hidden group">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="w-full p-5 flex items-center justify-between hover:bg-marino-3/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-naranja/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Activity size={16} className="text-naranja" />
                        </div>
                        <span className="text-[0.7rem] font-black text-blanco uppercase tracking-[0.2em]">Metodología de Sesión</span>
                    </div>
                    {showNotes ? <ChevronUp size={18} className="text-naranja" /> : <ChevronDown size={18} className="text-gris" />}
                </button>

                {showNotes && (
                    <div className="p-5 pt-2 flex flex-col md:flex-row gap-5 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex-1 space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest pl-1">Protocolo Principal</label>
                            <textarea
                                defaultValue={`${diaObjeto.focoMuscular} — Intensidad moderada, foco en la fase excéntrica.`}
                                className="w-full bg-marino-3/50 border border-marino-4/50 rounded-2xl px-5 py-4 text-sm text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium h-24 resize-none shadow-inner"
                            />
                        </div>
                        <div className="w-full md:w-72 space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest pl-1">Variables de Bio-Feedback</label>
                            <textarea
                                defaultValue="Priorizar sueño e hidratación post-sesión."
                                className="w-full bg-marino-3/50 border border-marino-4/50 rounded-2xl px-5 py-4 text-sm text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium h-24 resize-none shadow-inner"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Perfil de Intensidad IUSCA — Grid Adaptativo */}
            {perfil && (
                <div className="bg-marino-2 border border-marino-4 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-1000">
                        <Gauge size={160} />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-naranja/10 rounded-xl border border-naranja/10 group-hover:scale-110 transition-transform">
                                <Activity size={20} className="text-naranja" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-blanco uppercase tracking-widest">Capacidad de Carga Científica</h4>
                                <p className="text-[0.6rem] font-bold text-gris uppercase tracking-widest opacity-60">Consenso IUSCA / Repeticiones en Reserva</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* RIR 0-1 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-rojo">RIR 0-1 (Fallo)</span>
                                <span className="text-2xl font-barlow-condensed font-black text-blanco italic leading-none">{perfil.rir_0_1} <span className="text-[0.6rem] opacity-30">EJ.</span></span>
                            </div>
                            <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-rojo/50 to-rojo shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-1000" style={{ width: `${(perfil.rir_0_1 / perfil.total) * 100}%` }}></div>
                            </div>
                        </div>
                        {/* RIR 2-3 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#22C55E]">RIR 2-3 (Optimus)</span>
                                <span className="text-2xl font-barlow-condensed font-black text-blanco italic leading-none">{perfil.rir_2_3} <span className="text-[0.6rem] opacity-30">EJ.</span></span>
                            </div>
                            <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-verde/50 to-verde shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-1000" style={{ width: `${(perfil.rir_2_3 / perfil.total) * 100}%` }}></div>
                            </div>
                        </div>
                        {/* RIR 4+ */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-gris-claro">RIR 4+ (Técnica)</span>
                                <span className="text-2xl font-barlow-condensed font-black text-blanco italic leading-none">{perfil.rir_4_mas} <span className="text-[0.6rem] opacity-30">EJ.</span></span>
                            </div>
                            <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-gris/50 to-gris transition-all duration-1000" style={{ width: `${(perfil.rir_4_mas / perfil.total) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {!perfil.distribucionCorrecta && (
                        <div className="mt-8 flex items-start gap-4 p-5 bg-rojo/5 border border-rojo/20 rounded-2xl animate-pulse">
                            <ShieldAlert size={18} className="text-rojo shrink-0 mt-0.5" />
                            <p className="text-[0.65rem] font-bold text-rojo leading-relaxed uppercase tracking-tighter">
                                {perfil.mensaje}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Listado de Ejercicios — Vista Móvil (Cards) & Desktop (Tabla) */}
            <div className={`bg-marino-2 border rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500 ${semanaObjeto.esFaseDeload ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-blue-900/10' : 'border-marino-4'}`}>
                {semanaObjeto.esFaseDeload && (
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-b border-blue-500/20 px-6 py-3.5 flex items-center gap-3">
                        <Activity size={16} className="text-blue-400 animate-pulse" />
                        <span className="text-[0.65rem] font-black text-blue-200 uppercase tracking-widest">Fase de Descarga Crítica Activa — Volumen Científico Reducido</span>
                    </div>
                )}

                {/* Vista MOBILE: Cards de Ejercicio */}
                <div className="block md:hidden divide-y divide-marino-4">
                    {ejercicios.length === 0 ? (
                        <div className="p-20 text-center">
                            <Dumbbell size={48} className="text-marino-4 mx-auto mb-4 opacity-20" />
                            <p className="text-[0.65rem] font-black text-gris uppercase tracking-[0.2em] italic">Sin arsenal operativo.<br />Planifique la sesión inferiormente.</p>
                        </div>
                    ) : ejercicios.map((ej, idx) => (
                        <div key={ej.id} className="p-5 active:bg-marino-3/50 transition-colors">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-marino-3 border border-marino-4 flex items-center justify-center text-[0.65rem] font-black text-gris">{idx + 1}</span>
                                    <div className="flex-1">
                                        <SelectorEjercicioCelda
                                            initialValue={ej.ejercicio?.nombre || ej.nombreLibre || ""}
                                            ejercicioId={ej.ejercicioId}
                                            esBiblioteca={ej.esBiblioteca}
                                            onSelect={(data) => handleUpdateChange(ej.id, {
                                                ejercicioId: data.ejercicioId,
                                                nombreLibre: data.nombre,
                                                esBiblioteca: data.esBiblioteca
                                            })}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => handleEliminar(ej.id)} className="p-2 text-rojo/30 active:text-rojo active:bg-rojo/10 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                    <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Series</label>
                                    <input
                                        type="number"
                                        value={ej.series}
                                        onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                        className="w-full bg-transparent text-xl font-barlow-condensed font-black text-blanco focus:outline-none"
                                    />
                                </div>
                                <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                    <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                    <input
                                        type="number"
                                        value={ej.RIR !== null ? ej.RIR : ''}
                                        onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full bg-transparent text-xl font-barlow-condensed font-black text-naranja focus:outline-none"
                                    />
                                </div>
                                <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                    <label className="text-[0.55rem] font-black text-verde uppercase tracking-widest block mb-1">Peso</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={ej.pesoSugerido || ''}
                                        onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                        className="w-full bg-transparent text-xl font-barlow-condensed font-black text-verde focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mb-4">
                                <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                    <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Reps Escalonadas</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={ej.repsMin}
                                            onChange={(e) => handleUpdateChange(ej.id, { repsMin: parseInt(e.target.value) })}
                                            className="w-12 bg-transparent text-sm font-black text-blanco focus:outline-none text-center"
                                        />
                                        <span className="text-gris/40">—</span>
                                        <input
                                            type="number"
                                            value={ej.repsMax}
                                            onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) })}
                                            className="w-12 bg-transparent text-sm font-black text-blanco focus:outline-none text-center"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                    <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso (Seg)</label>
                                    <input
                                        type="number"
                                        value={ej.descansoSegundos !== null ? ej.descansoSegundos : ''}
                                        onChange={(e) => handleUpdateChange(ej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full bg-transparent text-sm font-black text-blanco focus:outline-none"
                                    />
                                </div>
                            </div>

                            <textarea
                                value={ej.notasTecnicas || ''}
                                onChange={(e) => handleUpdateChange(ej.id, { notasTecnicas: e.target.value })}
                                className="w-full bg-marino-3/30 border border-marino-4/40 rounded-xl p-3 text-xs text-gris-claro font-medium italic focus:border-naranja/40 transition-all resize-none mb-2"
                                placeholder="Notas técnicas específicas..."
                                rows={2}
                            />
                        </div>
                    ))}
                </div>

                {/* Vista DESKTOP: Tabla Profesional */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                        <thead>
                            <tr className={`border-b border-marino-4 ${semanaObjeto.esFaseDeload ? 'bg-blue-900/20' : 'bg-marino-3/80'}`}>
                                <th className="p-5 w-10"></th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-12 text-center">#</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem]">Ejercicio / Patrón</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-28 text-center">Repeticiones</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-20 text-center">Sets</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">RIR</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">Descanso</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-24 text-center">Peso Kg</th>
                                <th className="p-5 font-barlow-condensed font-black uppercase tracking-[0.2em] text-gris text-[0.65rem] w-40 text-center">Técnica/Feedback</th>
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
                                <tr
                                    key={ej.id}
                                    draggable="true"
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(idx)}
                                    className={`group hover:bg-marino-3/40 transition-all ${draggingIdx === idx ? 'opacity-20' : ''}`}
                                >
                                    <td className="p-5 text-gris text-center cursor-grab active:cursor-grabbing">
                                        <GripVertical size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
                                    </td>
                                    <td className="p-5 text-gris font-black text-lg text-center opacity-30 group-hover:opacity-100 transition-opacity">{idx + 1}</td>
                                    <td className="p-5">
                                        <SelectorEjercicioCelda
                                            initialValue={ej.ejercicio?.nombre || ej.nombreLibre || ""}
                                            ejercicioId={ej.ejercicioId}
                                            esBiblioteca={ej.esBiblioteca}
                                            onSelect={(data) => handleUpdateChange(ej.id, {
                                                ejercicioId: data.ejercicioId,
                                                nombreLibre: data.nombre,
                                                esBiblioteca: data.esBiblioteca
                                            })}
                                        />
                                        <div className="mt-2 text-left">
                                            <button
                                                onClick={() => {
                                                    const newValue = !ej.esTesteo;
                                                    handleUpdateChange(ej.id, {
                                                        esTesteo: newValue,
                                                        modalidadTesteo: newValue ? 'INDIRECTO' : null
                                                    })
                                                }}
                                                className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${ej.esTesteo ? 'bg-naranja text-marino' : 'bg-marino-4/50 text-gris hover:text-blanco'}`}
                                            >
                                                {ej.esTesteo ? '✓ Configuración de Testeo' : '+ Marcar como Testeo'}
                                            </button>

                                            {ej.esTesteo && (
                                                <div className="mt-2 flex items-center gap-1 bg-marino-4/30 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => handleUpdateChange(ej.id, { modalidadTesteo: 'INDIRECTO' })}
                                                        className={`flex-1 text-[0.55rem] font-black uppercase tracking-tighter py-1 rounded ${ej.modalidadTesteo === 'INDIRECTO' ? 'bg-naranja-oscuro text-naranja border border-naranja/30' : 'text-gris hover:bg-marino-4 transition-colors'}`}
                                                        title="Fórmula Brzycki (Recomendado)"
                                                    >
                                                        Indirecto
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateChange(ej.id, { modalidadTesteo: 'DIRECTO' })}
                                                        className={`flex-1 text-[0.55rem] font-black uppercase tracking-tighter py-1 rounded ${ej.modalidadTesteo === 'DIRECTO' ? 'bg-rojo/20 text-rojo border border-rojo/30' : 'text-gris hover:bg-marino-4 transition-colors'}`}
                                                        title="1RM Real MÁXIMO"
                                                    >
                                                        Directo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1 bg-marino-3 border border-marino-4/30 rounded-xl overflow-hidden">
                                                <input
                                                    type="number"
                                                    value={ej.repsMin}
                                                    onChange={(e) => handleUpdateChange(ej.id, { repsMin: parseInt(e.target.value) })}
                                                    className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                    placeholder="Min"
                                                />
                                                <span className="text-gris/40">—</span>
                                                <input
                                                    type="number"
                                                    value={ej.repsMax}
                                                    onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) })}
                                                    className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                    placeholder="Max"
                                                />
                                            </div>

                                            {/* Alerta de Precisión 1RM (>10 reps) */}
                                            {ej.repsMax > 10 && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-rojo/10 border border-rojo/20 rounded-lg animate-pulse">
                                                    <AlertCircle size={10} className="text-rojo" />
                                                    <span className="text-[0.5rem] font-black text-rojo uppercase tracking-tighter">Precisión Estimada Reducida</span>
                                                </div>
                                            )}

                                            {/* Asistente de Zona Inline */}
                                            {detectarZona(ej.repsMin, ej.repsMax) && (
                                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                                    <div className="bg-marino-4 border border-blanco/5 rounded-xl p-3 shadow-2xl relative">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!].color }}></div>
                                                            <span className="text-[0.55rem] font-black text-blanco uppercase tracking-widest">{ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!].nombre}</span>
                                                        </div>
                                                        <div className="space-y-1.5 mb-3">
                                                            <div className="flex justify-between text-[0.5rem] font-medium text-gris uppercase">
                                                                <span>Descanso</span>
                                                                <span className="text-blanco">{ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!].tiempoDescansoMin}-{ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!].tiempoDescansoMax} min</span>
                                                            </div>
                                                            <div className="flex justify-between text-[0.5rem] font-medium text-gris uppercase">
                                                                <span>Cadencia</span>
                                                                <span className="text-blanco">{ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!].cadencia}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const zonaData = ZONAS_INTENSIDAD[detectarZona(ej.repsMin, ej.repsMax)!];
                                                                handleUpdateChange(ej.id, {
                                                                    descansoSegundos: zonaData.tiempoDescansoMin * 60,
                                                                    tempo: zonaData.cadencia
                                                                });
                                                            }}
                                                            className="w-full py-1.5 bg-naranja/10 hover:bg-naranja hover:text-marino transition-all border border-naranja/20 rounded-lg text-[0.5rem] font-black text-naranja uppercase tracking-tighter"
                                                        >
                                                            ✓ Aplicar Parámetros
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <input
                                            type="number"
                                            value={ej.series}
                                            onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                            placeholder={semanaObjeto.esFaseDeload ? "Sugerido: -1/2" : "Sets"}
                                            className="w-full bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-blanco focus:outline-none focus:border-naranja/50 transition-all font-black text-[0.9rem]"
                                        />
                                    </td>
                                    <td className="p-5">
                                        <input
                                            type="number"
                                            value={ej.RIR !== null ? ej.RIR : ''}
                                            onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder={semanaObjeto.esFaseDeload ? "RIR 4+" : "RIR"}
                                            className="w-full bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-naranja focus:outline-none focus:border-naranja/50 transition-all font-black text-[0.9rem]"
                                        />
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1 bg-marino-3 px-2 rounded-lg border border-marino-4/30">
                                            <input
                                                type="number"
                                                value={ej.descansoSegundos !== null ? ej.descansoSegundos : ''}
                                                onChange={(e) => handleUpdateChange(ej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.75rem] font-bold"
                                            />
                                            <span className="text-gris text-[0.5rem] font-black uppercase tracking-widest px-1">Seg</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1.5">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={ej.pesoSugerido || ''}
                                                onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                placeholder="0.0"
                                                className="w-full bg-marino-3 border border-marino-4/30 py-2.5 rounded-xl text-center text-naranja focus:outline-none text-[0.85rem] font-black"
                                            />
                                            <p className="text-[0.5rem] font-black text-gris text-center uppercase tracking-tighter">
                                                Tonelaje: {(ej.series * (ej.repsMax || 0) * (ej.pesoSugerido || 0)).toFixed(1)} kg
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <textarea
                                            value={ej.notasTecnicas || ''}
                                            onChange={(e) => handleUpdateChange(ej.id, { notasTecnicas: e.target.value })}
                                            rows={3}
                                            className="w-full bg-marino-3/50 border border-marino-4/50 p-2 rounded-lg text-gris-claro text-[0.65rem] focus:outline-none focus:border-naranja/40 transition-all resize-none font-medium italic"
                                            placeholder="Feedback..."
                                        />
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
                        className="w-full p-8 border-2 border-dashed border-marino-4 rounded-3xl flex flex-col items-center justify-center gap-4 text-gris group hover:border-naranja/40 hover:bg-naranja/[0.03] hover:text-naranja transition-all"
                    >
                        <div className="p-4 bg-marino-3 border border-marino-4 rounded-2xl group-hover:bg-naranja group-hover:text-marino group-hover:border-naranja transition-all shadow-xl">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <span className="font-barlow-condensed font-black uppercase tracking-[0.3em] text-sm md:text-md">Añadir ejercicio al arsenal operativo</span>
                    </button>

                    {/* Metricas de Pie de Sesion - Gualda Training Style */}
                    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 md:px-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-marino-3 border border-marino-4 rounded-2xl group hover:border-[#EF4444]/30 transition-colors">
                            <div className="p-2.5 bg-[#EF4444]/10 rounded-xl"><Activity className="text-[#EF4444]" size={18} /></div>
                            <div className="w-full">
                                <label className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-1">DOMS / Agujetas</label>
                                <input placeholder="Nivel 0-10" className="w-full bg-transparent border-none p-0 text-blanco font-bold text-sm focus:ring-0 placeholder:text-gris/20" />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-marino-3 border border-marino-4 rounded-2xl group hover:border-[#60A5FA]/30 transition-colors">
                            <div className="p-2.5 bg-[#60A5FA]/10 rounded-xl"><Gauge className="text-[#60A5FA]" size={18} /></div>
                            <div className="w-full">
                                <label className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-1">Esfuerzo Gral.</label>
                                <input placeholder="RPE Sesión" className="w-full bg-transparent border-none p-0 text-blanco font-bold text-sm focus:ring-0 placeholder:text-gris/20" />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-marino-3 border border-marino-4 rounded-2xl group hover:border-[#22C55E]/30 transition-colors">
                            <div className="p-2.5 bg-[#22C55E]/10 rounded-xl"><Scale className="text-[#22C55E]" size={18} /></div>
                            <div className="w-full">
                                <label className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-1">Pesaje del Día</label>
                                <input placeholder="--.- kg" className="w-full bg-transparent border-none p-0 text-blanco font-bold text-sm focus:ring-0 placeholder:text-gris/20" />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-marino-3 border border-naranja/20 rounded-2xl group hover:border-naranja/40 transition-colors">
                            <div className="p-2.5 bg-naranja/10 rounded-xl"><Dumbbell className="text-naranja" size={18} /></div>
                            <div className="w-full">
                                <label className="text-[0.5rem] font-black text-naranja uppercase tracking-widest block mb-1 font-black">Tonelaje SESIÓN</label>
                                <span className="text-blanco font-black text-sm uppercase tracking-tighter">
                                    {ejercicios.reduce((acc, ej) => acc + (ej.series * (ej.repsMax || 0) * (ej.pesoSugerido || 0)), 0).toLocaleString()} KG
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-marino-4/50 flex flex-col md:flex-row justify-between items-center gap-6 text-gris text-[0.6rem] font-bold uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-marino-3 rounded-full border border-marino-4 shadow-inner">
                            <Info size={14} className="text-naranja" />
                            <span>Metodología de Alto Rendimiento — IL-CAMPUS Professional</span>
                        </div>
                        <div className="flex gap-6 opacity-60">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-naranja shadow-[0_0_8px_rgba(232,119,23,0.3)]"></div> Sarcoplasmática</span>
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]"></div> Neural / Fuerza</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Sidebar Drawer de Zonas (Referencia Científica) */}
            {drawerZonasOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-marino-1/80 backdrop-blur-sm" onClick={() => setDrawerZonasOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-marino-2 border-l border-marino-4 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-marino-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Gauge className="text-naranja" size={20} />
                                <h3 className="font-barlow-condensed font-black uppercase text-xl text-blanco tracking-tight">Referencia de Zonas</h3>
                            </div>
                            <button onClick={() => setDrawerZonasOpen(false)} className="text-gris hover:text-blanco transition-colors p-2">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {Object.entries(ZONAS_INTENSIDAD).map(([key, zona]) => (
                                <div key={key} className="bg-marino-3 border border-marino-4 rounded-3xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl transition-all group-hover:opacity-20 translate-x-12 -translate-y-12" style={{ backgroundColor: zona.color }}></div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zona.color }}></div>
                                                <h4 className="text-lg font-black text-blanco uppercase tracking-tight">{zona.nombre}</h4>
                                            </div>
                                            <p className="text-[0.65rem] text-gris font-bold uppercase tracking-widest">{zona.subtitulo}</p>
                                        </div>
                                        <span className="px-3 py-1.5 bg-marino-4 rounded-xl text-[0.7rem] font-black text-blanco opacity-60">
                                            {zona.repsMin}-{zona.repsMax === 99 ? '+' : zona.repsMax} REPS
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-1">
                                            <span className="text-[0.5rem] font-black text-naranja uppercase tracking-widest">Intensidad (% 1RM)</span>
                                            <p className="text-xs font-bold text-blanco">{zona.porcentaje1RMMin}-{zona.porcentaje1RMMax}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[0.5rem] font-black text-naranja uppercase tracking-widest">Descanso Sugerido</span>
                                            <p className="text-xs font-bold text-blanco">{zona.tiempoDescansoMin}-{zona.tiempoDescansoMax} min</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[0.5rem] font-black text-naranja uppercase tracking-widest">Cadencia (Técnica)</span>
                                            <p className="text-xs font-bold text-blanco">{zona.cadencia}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[0.5rem] font-black text-naranja uppercase tracking-widest">Duración Serie</span>
                                            <p className="text-xs font-bold text-blanco">{zona.duracionSerie}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-marino-4">
                                        <p className="text-[0.7rem] text-gris leading-relaxed italic">
                                            {zona.efecto}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <div className="p-6 bg-naranja/5 border border-naranja/20 rounded-3xl space-y-4">
                                <h5 className="text-[0.7rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} className="text-naranja" /> Reclutamiento de Fibras
                                </h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[0.6rem] font-bold">
                                        <span className="text-gris italic">Cargas Bajas (25-45%)</span>
                                        <span className="text-blanco">15 Hz → Fibras ST</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[0.6rem] font-bold">
                                        <span className="text-gris italic">Cargas Medias (50-85%)</span>
                                        <span className="text-blanco">30 Hz → ST + FTa</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[0.6rem] font-bold">
                                        <span className="text-gris italic">Cargas Altas (90-110%)</span>
                                        <span className="text-blanco">45-100 Hz → ST + FTa + FTb</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-marino-4 bg-marino-3/50">
                            <button onClick={() => setDrawerZonasOpen(false)} className="w-full py-4 bg-marino-4 hover:bg-marino-5 text-blanco font-black rounded-2xl uppercase tracking-widest text-[0.7rem] transition-all">
                                Cerrar Referencia
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
