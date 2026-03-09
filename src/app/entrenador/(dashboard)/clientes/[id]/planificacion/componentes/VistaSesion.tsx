"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Save, Info, Loader2, Dumbbell, ClipboardList, Gauge, Scale, Activity, ShieldAlert, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DiaConEjercicios, EjercicioConDetalle, SemanaConDias } from '@/nucleo/tipos/planificacion.tipos';
import { guardarCambiosEjercicio, eliminarEjercicio, reordenarEjercicios, agruparEjercicios, desagruparEjercicios, actualizarNombreGrupo, clonarContenidoSesion, actualizarDiaSesion } from '@/nucleo/acciones/planificacion.accion';
import { obtenerCondicionesClinicas } from '@/nucleo/acciones/cliente.accion';
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
    const [notasGrales, setNotasGrales] = useState<string>(diaObjeto.notas || '');
    const [saving, setSaving] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [showNotes, setShowNotes] = useState(false);
    const [condiciones, setCondiciones] = useState<string[]>([]);
    const [showClinical, setShowClinical] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [copiedSesionId, setCopiedSesionId] = useState<string | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
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

        setCopiedSesionId(localStorage.getItem('copied_sesion_id'));
    }, [diaObjeto.id, clienteId]);


    // Sincronizar state si cambia el objeto de prop (ej. cambio de día)
    useEffect(() => {
        setEjercicios(diaObjeto.ejercicios);
        setNotasGrales(diaObjeto.notas || '');
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
            await actualizarDiaSesion(diaObjeto.id, { notas: notasGrales });

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

    const handleCopiarEstructura = () => {
        localStorage.setItem('copied_sesion_id', diaObjeto.id);
        setCopiedSesionId(diaObjeto.id);
        alert("Estructura de la sesión copiada.");
    };

    const handlePegarEstructura = async () => {
        const idOrigen = localStorage.getItem('copied_sesion_id');
        if (!idOrigen) return;
        if (!confirm("Esto reemplazará todos los ejercicios actuales con la estructura copiada. ¿Seguro?")) return;

        setSaving(true);
        const res = await clonarContenidoSesion(idOrigen, diaObjeto.id);
        if (res.exito) {
            router.refresh();
            alert("Estructura clonada con éxito.");
        } else {
            alert("Error al pegar: " + res.error);
        }
        setSaving(false);
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">


            {/* Banner de Alerta Clínica - Rediseñado para Cohesión */}
            {condiciones.length > 0 && (
                <div className="bg-marino-2 border border-rojo/20 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                    <div
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-rojo/5 transition-colors"
                        onClick={() => setShowClinical(!showClinical)}
                    >
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-rojo/10 rounded-2xl text-rojo">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-blanco uppercase tracking-[0.2em]">Protocolo de Seguridad Clínica</h4>
                                <p className="text-[0.65rem] font-bold text-rojo/80 uppercase tracking-tighter">Condiciones médicas activas detectadas ({condiciones.length})</p>
                            </div>
                        </div>
                        {showClinical ? <ChevronUp className="text-rojo" /> : <ChevronDown className="text-rojo" />}
                    </div>

                    {showClinical && (
                        <div className="px-6 pb-6 pt-2 space-y-6 bg-rojo/[0.02]">
                            <div className="flex flex-wrap gap-2 py-2">
                                {condiciones.map(c => (
                                    <span key={c} className="bg-rojo/10 text-rojo px-4 py-1.5 rounded-xl text-[0.65rem] font-black uppercase border border-rojo/20 shadow-sm">{c}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                                <div className="space-y-3">
                                    <h5 className="text-[0.65rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={14} className="text-rojo" /> Directrices ACSM
                                    </h5>
                                    <p className="text-[0.75rem] text-gris leading-relaxed font-medium">
                                        Monitorizar fatiga subjetiva y descartar maniobras hipopresivas extremas. Control riguroso de la hemodinámica durante la sesión.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h5 className="text-[0.65rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                        <Scale size={14} className="text-rojo" /> Variables de Control
                                    </h5>
                                    <ul className="text-[0.75rem] text-gris list-disc pl-5 space-y-1.5 font-medium">
                                        <li>Carga interna (RPE) ≤ 8/10.</li>
                                        <li>Recuperación completa entre series metabólicas.</li>
                                        <li>Hidratación prioritaria ante clima extremo.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Header Sesion Profesional — Unificado */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-marino-2 border border-marino-4 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl">
                        <ClipboardList className="text-naranja" size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className="px-2.5 py-1 bg-naranja/10 rounded-lg text-[0.65rem] font-black text-naranja uppercase tracking-[0.15em] leading-none">
                                {semanaNombre}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            {diaObjeto.diaSemana} — <span className="text-naranja">{diaObjeto.focoMuscular}</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${isSelectionMode ? 'bg-naranja text-marino border-naranja' : 'bg-marino-2 border-marino-4 text-gris hover:border-naranja/40 hover:text-blanco'}`}
                    >
                        <Plus size={16} className={isSelectionMode ? 'rotate-45' : ''} />
                        {isSelectionMode ? 'Cancelar' : 'Agrupar'}
                    </button>

                    {isSelectionMode && (
                        <button
                            onClick={handleAgrupar}
                            disabled={selectedIds.length < 2}
                            className={`flex items-center justify-center gap-2 px-5 py-3.5 bg-verde text-marino border border-verde rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${selectedIds.length < 2 ? 'opacity-30' : 'hover:scale-105 shadow-xl shadow-verde/20'}`}
                        >
                            <Save size={16} /> Crear Vínculo ({selectedIds.length})
                        </button>
                    )}

                    {!isSelectionMode && (
                        <>
                            <button
                                onClick={handleCopiarEstructura}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-marino-2 border border-marino-4 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-gris hover:border-blanco/20 hover:text-blanco transition-all"
                            >
                                <Copy size={16} /> <span className="hidden md:inline">Clonar</span> Estructura
                            </button>
                            {copiedSesionId && copiedSesionId !== diaObjeto.id && (
                                <button
                                    onClick={handlePegarEstructura}
                                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-marino-2/50 border border-naranja/40 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-naranja hover:bg-naranja hover:text-marino transition-all font-barlow-condensed"
                                    title="Reemplazar sesión actual con la copiada"
                                >
                                    Pegar Estructura
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={handleGuardarTodo}
                        disabled={saving}
                        className="col-span-2 md:col-span-1 md:flex-1 flex items-center justify-center gap-3 px-8 py-4 md:py-3.5 bg-naranja hover:bg-naranja-h transition-all text-marino font-black rounded-2xl text-[0.7rem] uppercase tracking-widest shadow-2xl shadow-naranja/30 active:scale-95 border-none"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? "Guardando..." : "Guardar Sesión"}
                    </button>
                </div>
            </div>

            {/* Metodología — Acordeón Rediseñado */}
            <div className="bg-marino-2 border border-marino-4/30 rounded-3xl shadow-xl overflow-hidden">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-naranja/5 rounded-2xl text-naranja border border-naranja/10">
                            <Activity size={20} />
                        </div>
                        <span className="text-[0.75rem] font-black text-blanco uppercase tracking-[0.25em]">Notas y Activación / Movilidad</span>
                    </div>
                    {showNotes ? <ChevronUp size={20} className="text-naranja" /> : <ChevronDown size={20} className="text-gris/40" />}
                </button>

                {showNotes && (
                    <div className="p-6 pt-0 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 space-y-3">
                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest pl-1">Instrucciones Generales y Bloque de Movilidad</label>
                            <textarea
                                value={notasGrales}
                                onChange={(e) => setNotasGrales(e.target.value)}
                                placeholder="Ej: Arrancar cada ejercicio con 3 series de aproximación...&#10;Bloque de movilidad y activación muscular..."
                                className="w-full bg-marino-3/30 border border-marino-4/40 rounded-2xl px-5 py-4 text-sm text-blanco focus:outline-none focus:border-naranja/30 transition-all font-medium h-48 resize-none shadow-inner"
                            />
                        </div>
                    </div>
                )}
            </div>


            {/* Listado de Ejercicios — Vista Móvil (Cards) & Desktop (Tabla) */}
            <div className={`bg-marino-2 border rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500 ${semanaObjeto.esFaseDeload ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-blue-900/10' : 'border-marino-4'}`}>
                {semanaObjeto.esFaseDeload && (
                    <div className="bg-blue-500/10 border-b border-blue-500/10 px-8 py-4 flex items-center gap-4">
                        <Activity size={18} className="text-blue-400 animate-pulse" />
                        <span className="text-[0.7rem] font-black text-blue-100 uppercase tracking-[0.2em]">Fase de Descarga Crítica — Reducción de Fatiga Sistémica</span>
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
                                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-blanco focus:outline-none border border-marino-4/50"
                                                            />
                                                        </div>
                                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                                            <input
                                                                type="number"
                                                                value={gej.RIR !== null ? gej.RIR : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-naranja focus:outline-none border border-marino-4/50"
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
                                                            className="w-full bg-marino-4/20 rounded-lg py-1.5 px-3 text-3xl font-barlow-condensed font-black text-verde focus:outline-none border border-verde/20"
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
                                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                                />
                                                                <span className="text-gris/40">—</span>
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMax}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMax: parseInt(e.target.value) })}
                                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
                                                            <input
                                                                type="number"
                                                                value={gej.descansoSegundos !== null ? gej.descansoSegundos : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-center text-base font-black text-blanco focus:outline-none"
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
                                <div
                                    key={ej.id}
                                    className={`p-5 transition-colors relative cursor-pointer ${isSelectionMode ? (selectedIds.includes(ej.id) ? 'bg-naranja/10 border-b border-naranja/20' : 'hover:bg-naranja/5 border-b border-marino-4/40') : 'active:bg-marino-3/50'}`}
                                    onClick={() => { if (isSelectionMode) handleToggleSelection(ej.id); }}
                                >
                                    {/* Overlay en modo selección para bloquear inputs */}
                                    {isSelectionMode && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-end pr-5">
                                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(ej.id) ? 'bg-naranja border-naranja' : 'bg-marino-3 border-marino-4'}`}>
                                                {selectedIds.includes(ej.id) && <span className="text-marino font-black text-sm">✓</span>}
                                            </div>
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
                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-blanco focus:outline-none border border-marino-4/50"
                                            />
                                        </div>
                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                            <input
                                                type="number"
                                                value={ej.RIR !== null ? ej.RIR : ''}
                                                onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-naranja focus:outline-none border border-marino-4/50"
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
                                            className="w-full bg-marino-4/20 rounded-lg py-1.5 px-3 text-3xl font-barlow-condensed font-black text-verde focus:outline-none border border-verde/20"
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
                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                />
                                                <span className="text-gris/40">—</span>
                                                <input
                                                    type="number"
                                                    value={ej.repsMax}
                                                    onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) })}
                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
                                            <input
                                                type="number"
                                                value={ej.descansoSegundos !== null ? ej.descansoSegundos : ''}
                                                onChange={(e) => handleUpdateChange(ej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                className="w-full bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-center text-base font-black text-blanco focus:outline-none"
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

                {/* Vista DESKTOP: Tabla Profesional Agile Grid */}
                <div className="hidden md:block w-full overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm border-collapse table-fixed min-w-[1000px]">
                        <thead>
                            <tr className={`border-b border-white/5 ${semanaObjeto.esFaseDeload ? 'bg-blue-500/5' : 'bg-marino-3/40'}`}>
                                <th className="p-3 w-[40px] sticky left-0 z-30 bg-marino-2 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"></th>
                                <th className="p-3 w-[45px] font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] text-center sticky left-[40px] z-30 bg-marino-2 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">#</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.65rem] w-[220px] sticky left-[85px] z-30 bg-marino-2 border-r border-white/5 shadow-[5px_0_15px_rgba(0,0,0,0.2)]">Ejercicio / Patrón</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[130px] text-center">Reps</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[80px] text-center">Sets</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[80px] text-center">RIR</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[100px] text-center">Rest</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[100px] text-center">Kg</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem]">Técnica / Feedback</th>
                                <th className="p-3 text-right w-[50px]"></th>
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
                                                <tr className="bg-marino-3/20">
                                                    <td colSpan={10} className="px-8 py-3 group/header">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-2 h-2 bg-naranja rounded-full"></div>
                                                                <button
                                                                    onClick={() => handleCambiarNombreGrupo(ej.grupoId!, ej.nombreGrupo || "Bloque")}
                                                                    className="text-[0.7rem] font-black text-blanco uppercase tracking-[0.2em] hover:text-naranja transition-colors flex items-center gap-2"
                                                                >
                                                                    {ej.nombreGrupo || "Bloque Vinculado"}
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDesagrupar(ej.grupoId!)}
                                                                className="text-[0.6rem] font-black text-gris/30 hover:text-rojo uppercase tracking-widest px-4 py-1.5 border border-marino-4 rounded-xl hover:bg-rojo/5 transition-all"
                                                            >
                                                                Disolver Bloque
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {groupMembers.map((gej, gidx) => (
                                                    <tr
                                                        key={gej.id}
                                                        onDragOver={handleDragOver}
                                                        onDrop={() => handleDrop(ejercicios.findIndex(e => e.id === gej.id))}
                                                        onClick={() => { if (isSelectionMode) handleToggleSelection(gej.id); }}
                                                        className={`group transition-all border-l-4 border-l-naranja/20 ${isSelectionMode
                                                            ? (selectedIds.includes(gej.id) ? 'bg-naranja/10 cursor-pointer' : 'hover:bg-naranja/5 cursor-pointer')
                                                            : `hover:bg-white/[0.02] ${draggingIdx === ejercicios.findIndex(e => e.id === gej.id) ? 'opacity-20' : ''}`
                                                            } ${activeDropdownId === gej.id ? 'z-[60] relative' : ''}`}
                                                    >
                                                        <td
                                                            className={`p-3 text-center sticky left-0 z-10 bg-marino-2/95 backdrop-blur-sm border-r border-white/5 ${activeDropdownId === gej.id ? 'z-[70]' : ''}`}
                                                            draggable={!isSelectionMode}
                                                            onDragStart={() => handleDragStart(ejercicios.findIndex(e => e.id === gej.id))}
                                                        >
                                                            {isSelectionMode ? (
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleSelection(gej.id); }}
                                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto cursor-pointer transition-all ${selectedIds.includes(gej.id) ? 'bg-naranja border-naranja' : 'bg-marino-3 border-marino-4 hover:border-naranja/60'
                                                                        }`}
                                                                >
                                                                    {selectedIds.includes(gej.id) && <span className="text-marino font-black text-[10px]">✓</span>}
                                                                </div>
                                                            ) : (
                                                                <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto text-gris cursor-grab" />
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-gris font-black text-base text-center opacity-30 group-hover:opacity-100 transition-opacity sticky left-[40px] z-10 bg-marino-2/95 backdrop-blur-sm border-r border-white/5">
                                                            {String.fromCharCode(65 + gidx)}
                                                        </td>
                                                        <td className={`p-3 sticky left-[85px] z-10 bg-marino-2/95 backdrop-blur-sm border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.2)] w-[220px] ${activeDropdownId === gej.id ? 'z-[70]' : ''}`}>
                                                            {isSelectionMode ? (
                                                                <span className="text-blanco font-black text-[0.75rem] uppercase tracking-tight">
                                                                    {gej.ejercicio?.nombre || gej.nombreLibre || '—'}
                                                                </span>
                                                            ) : (
                                                                <SelectorEjercicioCelda
                                                                    initialValue={gej.ejercicio?.nombre || gej.nombreLibre || ""}
                                                                    ejercicioId={gej.ejercicioId}
                                                                    esBiblioteca={gej.esBiblioteca}
                                                                    onSelect={(data) => handleUpdateChange(gej.id, {
                                                                        ejercicioId: data.ejercicioId,
                                                                        nombreLibre: data.nombre,
                                                                        esBiblioteca: data.esBiblioteca
                                                                    })}
                                                                    onOpenChange={(isOpen) => setActiveDropdownId(isOpen ? gej.id : null)}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-0.5 bg-marino border border-white/5 rounded-lg overflow-hidden">
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMin}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMin: parseInt(e.target.value) })}
                                                                    className="w-full bg-marino-3/50 py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/10 transition-colors"
                                                                />
                                                                <span className="text-gris/20 text-[10px]">—</span>
                                                                <input
                                                                    type="number"
                                                                    value={gej.repsMax}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMax: parseInt(e.target.value) })}
                                                                    className="w-full bg-marino-3/50 py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/10 transition-colors"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <input
                                                                type="number"
                                                                value={gej.series}
                                                                onChange={(e) => handleUpdateChange(gej.id, { series: parseInt(e.target.value) })}
                                                                className="w-full bg-marino-3/50 border border-white/5 py-2 rounded-lg text-center text-blanco font-black text-sm focus:bg-naranja/10 focus:border-naranja/20 transition-all"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <input
                                                                type="number"
                                                                value={gej.RIR !== null ? gej.RIR : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full bg-marino-3/50 border border-white/5 py-2 rounded-lg text-center text-naranja font-black text-sm focus:bg-naranja/10 focus:border-naranja/20 transition-all"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <div className="flex items-center gap-0.5 bg-marino-3/50 px-1 rounded-lg border border-white/5">
                                                                <input
                                                                    type="number"
                                                                    value={gej.descansoSegundos !== null ? gej.descansoSegundos : ''}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                    className="w-full bg-transparent py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/5"
                                                                />
                                                                <span className="text-[0.4rem] font-black text-gris/30 pr-0.5">s</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={gej.pesoSugerido || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                                className="w-full bg-marino-3/50 border border-verde/10 py-2 rounded-lg text-center text-verde font-black text-sm focus:bg-verde/5 focus:border-verde/30 transition-all"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <textarea
                                                                value={gej.notasTecnicas || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { notasTecnicas: e.target.value })}
                                                                rows={1}
                                                                className="w-full bg-marino-3/30 border border-white/5 p-2 rounded-lg text-blanco text-[10px] focus:outline-none focus:border-naranja/20 transition-all resize-none h-9 focus:h-20 focus:z-30 relative"
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <button onClick={() => handleEliminar(gej.id)} className="text-gris/20 hover:text-rojo p-1.5 rounded-lg transition-colors">
                                                                <Trash2 size={14} />
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
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(idx)}
                                            onClick={() => { if (isSelectionMode) handleToggleSelection(ej.id); }}
                                            className={`group transition-all relative ${isSelectionMode
                                                ? (selectedIds.includes(ej.id) ? 'bg-naranja/10 cursor-pointer' : 'hover:bg-naranja/5 cursor-pointer')
                                                : `hover:bg-white/[0.02] ${draggingIdx === idx ? 'opacity-20' : ''}`
                                                } ${activeDropdownId === ej.id ? 'z-[60]' : ''}`}
                                        >
                                            <td
                                                className={`p-3 text-center sticky left-0 z-10 bg-marino-2 border-r border-white/5 ${activeDropdownId === ej.id ? 'z-[70]' : ''}`}
                                                onClick={(e) => e.stopPropagation()}
                                                draggable={!isSelectionMode}
                                                onDragStart={() => handleDragStart(idx)}
                                            >
                                                {isSelectionMode ? (
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); handleToggleSelection(ej.id); }}
                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto cursor-pointer transition-all ${selectedIds.includes(ej.id) ? 'bg-naranja border-naranja' : 'bg-marino-3 border-marino-4 hover:border-naranja/60'
                                                            }`}
                                                    >
                                                        {selectedIds.includes(ej.id) && <span className="text-marino font-black text-[10px]">✓</span>}
                                                    </div>
                                                ) : (
                                                    <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mx-auto text-gris cursor-grab" />
                                                )}
                                            </td>
                                            <td className="p-3 text-gris font-black text-base text-center opacity-30 group-hover:opacity-100 transition-opacity sticky left-[40px] z-10 bg-marino-2 border-r border-white/5">{idx + 1}</td>
                                            <td className={`p-3 sticky left-[85px] z-10 bg-marino-2 border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.2)] w-[220px] ${activeDropdownId === ej.id ? 'z-[70]' : ''}`} onClick={(e) => { if (isSelectionMode) e.stopPropagation(); }}>
                                                {isSelectionMode ? (
                                                    <span className="text-blanco font-black text-[0.75rem] uppercase tracking-tight">
                                                        {ej.ejercicio?.nombre || ej.nombreLibre || '—'}
                                                    </span>
                                                ) : (
                                                    <SelectorEjercicioCelda
                                                        initialValue={ej.ejercicio?.nombre || ej.nombreLibre || ""}
                                                        ejercicioId={ej.ejercicioId}
                                                        esBiblioteca={ej.esBiblioteca}
                                                        onSelect={(data) => handleUpdateChange(ej.id, {
                                                            ejercicioId: data.ejercicioId,
                                                            nombreLibre: data.nombre,
                                                            esBiblioteca: data.esBiblioteca
                                                        })}
                                                        onOpenChange={(isOpen) => setActiveDropdownId(isOpen ? ej.id : null)}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-0.5 bg-marino border border-white/5 rounded-lg overflow-hidden">
                                                    <input
                                                        type="number"
                                                        value={ej.repsMin}
                                                        onChange={(e) => handleUpdateChange(ej.id, { repsMin: parseInt(e.target.value) })}
                                                        className="w-full bg-marino-3/50 py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/10 transition-colors"
                                                    />
                                                    <span className="text-gris/20 text-[10px]">—</span>
                                                    <input
                                                        type="number"
                                                        value={ej.repsMax}
                                                        onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) })}
                                                        className="w-full bg-marino-3/50 py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/10 transition-colors"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    value={ej.series}
                                                    onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                                    className="w-full bg-marino-3/50 border border-white/5 py-2 rounded-lg text-center text-blanco font-black text-sm focus:bg-naranja/10 focus:border-naranja/20 transition-all"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    value={ej.RIR !== null ? ej.RIR : ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full bg-marino-3/50 border border-white/5 py-2 rounded-lg text-center text-naranja font-black text-sm focus:bg-naranja/10 focus:border-naranja/20 transition-all"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="flex items-center gap-0.5 bg-marino-3/50 px-1 rounded-lg border border-white/5">
                                                    <input
                                                        type="number"
                                                        value={ej.descansoSegundos !== null ? ej.descansoSegundos : ''}
                                                        onChange={(e) => handleUpdateChange(ej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                        className="w-full bg-transparent py-2 text-center text-blanco focus:outline-none text-sm font-black focus:bg-naranja/5"
                                                    />
                                                    <span className="text-[0.4rem] font-black text-gris/30 pr-0.5">s</span>
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={ej.pesoSugerido || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                    className="w-full bg-marino-3/50 border border-verde/10 py-2 rounded-lg text-center text-verde font-black text-sm focus:bg-verde/5 focus:border-verde/30 transition-all"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <textarea
                                                    value={ej.notasTecnicas || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { notasTecnicas: e.target.value })}
                                                    className="w-full bg-marino-3/30 border border-white/5 p-2 rounded-lg text-blanco text-[10px] focus:outline-none focus:border-naranja/20 transition-all resize-none h-9 focus:h-20 focus:z-30 relative"
                                                    placeholder="..."
                                                />
                                            </td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => handleEliminar(ej.id)} className="text-gris/20 hover:text-rojo p-1.5 rounded-lg transition-all">
                                                    <Trash2 size={14} />
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
                        className="w-full p-10 border-2 border-dashed border-marino-4/40 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 text-gris/60 group hover:border-naranja/40 hover:bg-naranja/[0.02] hover:text-naranja transition-all"
                    >
                        <div className="p-5 bg-marino-3 border border-marino-4 rounded-[1.5rem] group-hover:bg-naranja group-hover:text-marino group-hover:border-naranja transition-all shadow-2xl">
                            <Plus size={36} strokeWidth={2.5} />
                        </div>
                        <span className="font-barlow-condensed font-black uppercase tracking-[0.4em] text-sm">Expandir Arsenal de Sesión</span>
                    </button>

                    {/* Metricas de Pie — Resultados del Atleta */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                        {(() => {
                            const latestSesion = diaObjeto.sesionesReales?.[0];
                            const metricas = latestSesion?.metricas;

                            return (
                                <>
                                    <div className="flex items-center gap-5 p-5 bg-marino-2 border border-marino-4/30 rounded-3xl hover:border-rojo/20 transition-all group">
                                        <div className="p-3 bg-rojo/5 rounded-2xl text-rojo group-hover:bg-rojo/10 transition-colors"><Activity size={24} /></div>
                                        <div className="flex-1">
                                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block mb-1.5">DOMS / Carga</label>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-blanco font-black text-xl">{metricas?.DOMS || '--'}</span>
                                                <span className="text-[0.6rem] text-gris/40 font-bold uppercase">/ 10</span>
                                            </div>
                                            <p className="text-[0.5rem] text-gris/40 font-bold uppercase mt-1 tracking-tighter">Feedback del Atleta</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 p-5 bg-marino-2 border border-marino-4/30 rounded-3xl hover:border-blue-400/20 transition-all group">
                                        <div className="p-3 bg-blue-400/5 rounded-2xl text-blue-400 group-hover:bg-blue-400/10 transition-colors"><Gauge size={24} /></div>
                                        <div className="flex-1">
                                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block mb-1.5">Esfuerzo Percibido</label>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-blanco font-black text-xl">{metricas?.esfuerzoGral || '--'}</span>
                                                <span className="text-[0.6rem] text-gris/40 font-bold uppercase">RPE</span>
                                            </div>
                                            <p className="text-[0.5rem] text-gris/40 font-bold uppercase mt-1 tracking-tighter">Reportado post-sesión</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 p-5 bg-marino-2 border border-marino-4/30 rounded-3xl hover:border-verde/20 transition-all group">
                                        <div className="p-3 bg-verde/5 rounded-2xl text-verde group-hover:bg-verde/10 transition-colors"><Scale size={24} /></div>
                                        <div className="flex-1">
                                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block mb-1.5">Pesaje del Atleta</label>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-blanco font-black text-xl">{metricas?.pesajeDia || '--'}</span>
                                                <span className="text-[0.6rem] text-gris/40 font-bold uppercase">KG</span>
                                            </div>
                                            <p className="text-[0.5rem] text-gris/40 font-bold uppercase mt-1 tracking-tighter">Dato sincronizado</p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        <div className="flex items-center gap-5 p-5 bg-marino-2 border border-naranja/20 rounded-3xl hover:border-naranja/40 transition-all group">
                            <div className="p-3 bg-naranja/5 rounded-2xl text-naranja group-hover:bg-naranja/10 transition-colors"><Dumbbell size={24} /></div>
                            <div className="flex-1">
                                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.2em] block mb-1.5">Tonelaje Teórico</label>
                                <span className="text-blanco font-black text-xl uppercase tracking-tighter">
                                    {ejercicios.reduce((acc, ej) => acc + (ej.series * (ej.repsMax || 0) * (ej.pesoSugerido || 0)), 0).toLocaleString()} <span className="text-[0.6rem] text-gris font-medium">KG</span>
                                </span>
                                <p className="text-[0.5rem] text-naranja/40 font-black uppercase mt-1 tracking-tighter">Carga Total Planificada</p>
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
