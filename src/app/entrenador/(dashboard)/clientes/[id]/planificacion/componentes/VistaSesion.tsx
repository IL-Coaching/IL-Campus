"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Save, Info, Loader2, Dumbbell, ClipboardList, Gauge, Scale, Activity, ShieldAlert, ChevronDown, ChevronUp, ChevronRight, AlertCircle, GripVertical } from 'lucide-react';
import BannerCicloMenstrual from './BannerCicloMenstrual';
import { DiaConEjercicios, EjercicioConDetalle, SemanaConDias } from '@/nucleo/tipos/planificacion.tipos';
import { guardarCambiosEjercicio, eliminarEjercicio, reordenarEjercicios, agruparEjercicios, desagruparEjercicios, actualizarNombreGrupo } from '@/nucleo/acciones/planificacion.accion';
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
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

    const handleAgrupar = async () => {
        if (selectedIds.length < 2) return;
        const nombre = prompt("Nombre del Bloque (ej: Superserie A, Circuito Core):", "Superserie");
        if (!nombre) return;

        const res = await agruparEjercicios(diaObjeto.id, selectedIds, nombre);
        if (res.exito) {
            router.refresh();
            setSelectedIds([]);
            setIsSelectionMode(false);
        }
    };

    const handleDesagrupar = async (grupoId: string) => {
        if (!confirm("¿Desagrupar estos ejercicios?")) return;
        const res = await desagruparEjercicios(diaObjeto.id, grupoId);
        if (res.exito) router.refresh();
    };

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCambiarNombreGrupo = async (grupoId: string, nombreActual: string) => {
        const nuevoNombre = prompt("Cambiar nombre del bloque:", nombreActual);
        if (nuevoNombre && nuevoNombre !== nombreActual) {
            const res = await actualizarNombreGrupo(diaObjeto.id, grupoId, nuevoNombre);
            if (res.exito) router.refresh();
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">


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
                                <p className="text-[0.65rem] font-bold text-rojo/80 uppercase tracking-tighter">Cliente con {condiciones.length} condiciones específicas registradas</p>
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
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSelectionMode ? 'bg-naranja text-marino border-naranja' : 'bg-marino-3 border-marino-4 text-gris hover:text-blanco'}`}
                    >
                        <Plus size={16} className={isSelectionMode ? 'rotate-45 transition-transform' : 'transition-transform'} />
                        {isSelectionMode ? 'Cancelar Grupo' : 'Modo Grupo'}
                    </button>

                    {isSelectionMode && (
                        <button
                            onClick={handleAgrupar}
                            disabled={selectedIds.length < 2}
                            className={`flex items-center justify-center gap-2 px-4 py-3 bg-verde text-marino border border-verde rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${selectedIds.length < 2 ? 'opacity-30 grayscale' : ''}`}
                        >
                            <Save size={16} /> Confirmar Grupo ({selectedIds.length})
                        </button>
                    )}

                    {!isSelectionMode && (
                        <button
                            onClick={() => alert("Copiando estructura...")}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-marino-3 border border-marino-4 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-gris hover:text-blanco transition-all shadow-lg active:scale-95"
                        >
                            <Copy size={16} /> <span className="hidden md:inline">Copiar</span> Estructura
                        </button>
                    )}
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
                    ) : (() => {
                        const renderedGroups = new Set();
                        return ejercicios.map((ej, idx) => {
                            if (ej.grupoId && renderedGroups.has(ej.grupoId)) return null;

                            if (ej.grupoId) {
                                renderedGroups.add(ej.grupoId);
                                const groupMembers = ejercicios.filter(e => e.grupoId === ej.grupoId);
                                return (
                                    <div key={ej.grupoId} className="border-l-4 border-l-naranja/50 bg-marino-2/30">
                                        <div className="bg-naranja/10 px-5 py-3 flex items-center justify-between border-b border-marino-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-naranja rounded-full"></div>
                                                <span className="text-[0.65rem] font-black text-naranja uppercase tracking-widest">{ej.nombreGrupo || "Bloque Vinculado"}</span>
                                            </div>
                                            <button onClick={() => handleDesagrupar(ej.grupoId!)} className="text-[0.55rem] font-black text-gris/60 uppercase tracking-tighter">Desvincular</button>
                                        </div>
                                        <div className="divide-y divide-marino-4/40">
                                            {groupMembers.map((gej, gidx) => (
                                                <div key={gej.id} className="p-5 active:bg-marino-3/50 transition-colors relative">
                                                    {isSelectionMode && (
                                                        <div className="absolute right-5 top-5 z-10">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(gej.id)}
                                                                onChange={() => handleToggleSelection(gej.id)}
                                                                className="w-6 h-6 rounded-lg border-marino-4 bg-marino-3 text-naranja focus:ring-naranja shadow-xl"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-lg bg-marino-3 border border-marino-4 flex items-center justify-center text-[0.65rem] font-black text-gris">
                                                                {String.fromCharCode(65 + gidx)}
                                                            </span>
                                                            <div className="flex-1">
                                                                <SelectorEjercicioCelda
                                                                    initialValue={gej.ejercicio?.nombre || gej.nombreLibre || ""}
                                                                    ejercicioId={gej.ejercicioId}
                                                                    esBiblioteca={gej.esBiblioteca}
                                                                    onSelect={(data) => handleUpdateChange(gej.id, {
                                                                        ejercicioId: data.ejercicioId,
                                                                        nombreLibre: data.nombre,
                                                                        esBiblioteca: data.esBiblioteca
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                        {!isSelectionMode && (
                                                            <button onClick={() => handleEliminar(gej.id)} className="p-2 text-rojo/30">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Sets</label>
                                                            <input
                                                                type="number"
                                                                value={gej.series}
                                                                onChange={(e) => handleUpdateChange(gej.id, { series: parseInt(e.target.value) })}
                                                                className="w-full bg-transparent text-xl font-barlow-condensed font-black text-blanco focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                                            <input
                                                                type="number"
                                                                value={gej.RIR !== null ? gej.RIR : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full bg-transparent text-xl font-barlow-condensed font-black text-naranja focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30 mb-4">
                                                        <label className="text-[0.55rem] font-black text-verde uppercase tracking-widest block mb-1">Carga Sugerida (kg)</label>
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={gej.pesoSugerido || ''}
                                                            onChange={(e) => handleUpdateChange(gej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                            className="w-full bg-transparent text-2xl font-barlow-condensed font-black text-verde focus:outline-none"
                                                            placeholder="0.0"
                                                        />
                                                    </div>

                                                    <div className="flex gap-3 mb-4">
                                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Repeticiones</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMin}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMin: parseInt(e.target.value) })}
                                                                    className="w-12 bg-transparent text-sm font-black text-blanco focus:outline-none text-center"
                                                                />
                                                                <span className="text-gris/40">—</span>
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMax}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMax: parseInt(e.target.value) })}
                                                                    className="w-12 bg-transparent text-sm font-black text-blanco focus:outline-none text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
                                                            <input
                                                                type="number"
                                                                value={gej.descansoSegundos !== null ? gej.descansoSegundos : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full bg-transparent text-sm font-black text-blanco focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        value={gej.notasTecnicas || ''}
                                                        onChange={(e) => handleUpdateChange(gej.id, { notasTecnicas: e.target.value })}
                                                        className="w-full bg-marino-3/50 border border-marino-4/40 rounded-xl p-4 text-xs text-blanco font-medium"
                                                        placeholder="Técnica..."
                                                        rows={2}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={ej.id} className="p-5 active:bg-marino-3/50 transition-colors relative">
                                    {isSelectionMode && (
                                        <div className="absolute right-5 top-5 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(ej.id)}
                                                onChange={() => handleToggleSelection(ej.id)}
                                                className="w-6 h-6 rounded-lg border-marino-4 bg-marino-3 text-naranja focus:ring-naranja shadow-xl"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            {!isSelectionMode && (
                                                <span className="w-8 h-8 rounded-lg bg-marino-3 border border-marino-4 flex items-center justify-center text-[0.65rem] font-black text-gris">
                                                    {idx + 1}
                                                </span>
                                            )}
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
                                        {!isSelectionMode && (
                                            <button onClick={() => handleEliminar(ej.id)} className="p-2 text-rojo/30">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Sets</label>
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
                                    </div>

                                    <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30 mb-4">
                                        <label className="text-[0.55rem] font-black text-verde uppercase tracking-widest block mb-1">Carga Sugerida (kg)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={ej.pesoSugerido || ''}
                                            onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                            className="w-full bg-transparent text-2xl font-barlow-condensed font-black text-verde focus:outline-none"
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Repeticiones</label>
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
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
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
                                        className="w-full bg-marino-3/50 border border-marino-4/40 rounded-xl p-4 text-xs text-blanco font-medium focus:border-naranja/40 transition-all resize-none shadow-inner"
                                        placeholder="Técnica..."
                                        rows={3}
                                    />
                                </div>
                            );
                        });
                    })()}
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
                                    <td colSpan={10} className="p-20 text-center">
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
                            ) : (() => {
                                const renderedGroups = new Set();
                                return ejercicios.map((ej, idx) => {
                                    if (ej.grupoId && renderedGroups.has(ej.grupoId)) return null;

                                    if (ej.grupoId) {
                                        renderedGroups.add(ej.grupoId);
                                        const groupMembers = ejercicios.filter(e => e.grupoId === ej.grupoId);
                                        return (
                                            <React.Fragment key={ej.grupoId}>
                                                <tr className="bg-naranja/5 border-l-4 border-l-naranja/40">
                                                    <td colSpan={10} className="px-5 py-2 group/header">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-1.5 bg-naranja rounded-full animate-pulse"></div>
                                                                <button
                                                                    onClick={() => handleCambiarNombreGrupo(ej.grupoId!, ej.nombreGrupo || "Superserie")}
                                                                    className="text-[0.65rem] font-black text-blanco uppercase tracking-widest hover:text-naranja transition-colors flex items-center gap-2"
                                                                >
                                                                    {ej.nombreGrupo || "Bloque de Trabajo"} <Info size={10} className="opacity-30" />
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDesagrupar(ej.grupoId!)}
                                                                className="text-[0.5rem] font-black text-gris/40 hover:text-rojo uppercase tracking-[0.2em] px-3 py-1 border border-marino-4 rounded-lg hover:bg-rojo/10 transition-all opacity-0 group-hover/header:opacity-100"
                                                            >
                                                                Desvincular
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {groupMembers.map((gej, gidx) => (
                                                    <tr
                                                        key={gej.id}
                                                        className={`group hover:bg-marino-3/40 transition-all border-l-4 ${idx % 2 === 0 ? 'bg-marino-2/50' : 'bg-marino-2'} border-l-naranja/30`}
                                                    >
                                                        <td className="p-5 text-center">
                                                            {isSelectionMode ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(gej.id)}
                                                                    onChange={() => handleToggleSelection(gej.id)}
                                                                    className="w-5 h-5 rounded-lg border-marino-4 bg-marino-3 text-naranja focus:ring-naranja"
                                                                />
                                                            ) : (
                                                                <GripVertical size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto text-gris cursor-grab" />
                                                            )}
                                                        </td>
                                                        <td className="p-5 text-gris font-black text-lg text-center opacity-30 group-hover:opacity-100 transition-opacity">
                                                            {String.fromCharCode(65 + gidx)}
                                                        </td>
                                                        <td className="p-5">
                                                            <SelectorEjercicioCelda
                                                                initialValue={gej.ejercicio?.nombre || gej.nombreLibre || ""}
                                                                ejercicioId={gej.ejercicioId}
                                                                esBiblioteca={gej.esBiblioteca}
                                                                onSelect={(data) => handleUpdateChange(gej.id, {
                                                                    ejercicioId: data.ejercicioId,
                                                                    nombreLibre: data.nombre,
                                                                    esBiblioteca: data.esBiblioteca
                                                                })}
                                                            />
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-1 bg-marino-3 border border-marino-4/30 rounded-xl overflow-hidden">
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMin}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMin: parseInt(e.target.value) })}
                                                                    className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                                />
                                                                <span className="text-gris/40">—</span>
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMax}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMax: parseInt(e.target.value) })}
                                                                    className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            <input
                                                                type="number"
                                                                value={gej.series}
                                                                onChange={(e) => handleUpdateChange(gej.id, { series: parseInt(e.target.value) })}
                                                                className="w-16 bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-blanco transition-all font-black text-[0.9rem]"
                                                            />
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            <input
                                                                type="number"
                                                                value={gej.RIR !== null ? gej.RIR : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-16 bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-naranja transition-all font-black"
                                                            />
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            <div className="flex items-center gap-1 bg-marino-3 px-2 rounded-lg border border-marino-4/30">
                                                                <input
                                                                    type="number"
                                                                    value={gej.descansoSegundos !== null ? gej.descansoSegundos : ''}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                    className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.75rem] font-bold"
                                                                />
                                                                <span className="text-gris text-[0.5rem] font-black uppercase tracking-widest px-1">Seg</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={gej.pesoSugerido || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                                className="w-20 bg-marino-3 border border-marino-4/30 py-2.5 rounded-xl text-center text-verde transition-all font-black"
                                                            />
                                                        </td>
                                                        <td className="p-5">
                                                            <textarea
                                                                value={gej.notasTecnicas || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { notasTecnicas: e.target.value })}
                                                                rows={1}
                                                                className="w-full bg-marino-3/30 border border-marino-4/50 p-3 rounded-xl text-blanco text-[0.7rem] focus:outline-none focus:border-naranja/40 transition-all resize-none font-medium shadow-inner"
                                                            />
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <button onClick={() => handleEliminar(gej.id)} className="text-gris/30 hover:text-rojo p-2 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    }

                                    return (
                                        <tr
                                            key={ej.id}
                                            draggable={!isSelectionMode}
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(idx)}
                                            className={`group hover:bg-marino-3/40 transition-all ${draggingIdx === idx ? 'opacity-20' : ''}`}
                                        >
                                            <td className="p-5 text-center">
                                                {isSelectionMode ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(ej.id)}
                                                        onChange={() => handleToggleSelection(ej.id)}
                                                        className="w-5 h-5 rounded-lg border-marino-4 bg-marino-3 text-naranja focus:ring-naranja"
                                                    />
                                                ) : (
                                                    <GripVertical size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto text-gris cursor-grab" />
                                                )}
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
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-1 bg-marino-3 border border-marino-4/30 rounded-xl overflow-hidden">
                                                    <input
                                                        type="number"
                                                        value={ej.repsMin}
                                                        onChange={(e) => handleUpdateChange(ej.id, { repsMin: parseInt(e.target.value) })}
                                                        className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                    />
                                                    <span className="text-gris/40">—</span>
                                                    <input
                                                        type="number"
                                                        value={ej.repsMax}
                                                        onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) })}
                                                        className="w-full bg-transparent py-2.5 text-center text-blanco focus:outline-none text-[0.8rem] font-bold"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <input
                                                    type="number"
                                                    value={ej.series}
                                                    onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                                    className="w-16 bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-blanco transition-all font-black text-[0.9rem]"
                                                />
                                            </td>
                                            <td className="p-5 text-center">
                                                <input
                                                    type="number"
                                                    value={ej.RIR !== null ? ej.RIR : ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-16 bg-marino-3 border border-marino-4/30 p-2.5 rounded-xl text-center text-naranja transition-all font-black"
                                                />
                                            </td>
                                            <td className="p-5 text-center">
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
                                            <td className="p-5 text-center">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={ej.pesoSugerido || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                    className="w-20 bg-marino-3 border border-marino-4/30 py-2.5 rounded-xl text-center text-verde transition-all font-black"
                                                />
                                            </td>
                                            <td className="p-5">
                                                <textarea
                                                    value={ej.notasTecnicas || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { notasTecnicas: e.target.value })}
                                                    rows={1}
                                                    className="w-full bg-marino-3/30 border border-marino-4/50 p-3 rounded-xl text-blanco text-[0.7rem] focus:outline-none focus:border-naranja/40 transition-all resize-none font-medium shadow-inner"
                                                />
                                            </td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => handleEliminar(ej.id)} className="text-gris/30 hover:text-rojo p-2 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
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
                        <span className="font-barlow-condensed font-black uppercase tracking-[0.3em] text-sm md:text-md">Agregar elemento a la planificación</span>
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
                            <span>Sistema de Seguimiento — IL-CAMPUS Professional</span>
                        </div>
                        <div className="flex gap-6 opacity-60">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
