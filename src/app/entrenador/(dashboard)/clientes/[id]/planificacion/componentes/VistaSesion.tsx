"use client"
import React, { useState, useEffect } from 'react';
import { Trash2, Dumbbell, Activity, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import BannerClinico from './BannerClinico';
import HeaderSesion from './HeaderSesion';
import MetodologiaSesion from './MetodologiaSesion';
import { DiaConEjercicios, EjercicioConDetalle, SemanaConDias } from '@/nucleo/tipos/planificacion.tipos';
import { actualizarBloqueSesion, actualizarNombreGrupo, agruparEjercicios, desagruparEjercicios, eliminarEjercicio, guardarCambiosEjercicio, reordenarEjercicios, vincularEjerciciosABloque } from '@/nucleo/acciones/ejercicio-planificado.accion';
import { actualizarDiaSesion, clonarContenidoSesion } from '@/nucleo/acciones/sesion.accion';
import { obtenerCondicionesClinicas } from '@/nucleo/acciones/cliente.accion';
import { useRouter, useParams } from 'next/navigation';
import SelectorEjercicioCelda from '@/compartido/componentes/planificacion/SelectorEjercicioCelda';
import ModalConfirmSimple from '@/compartido/componentes/ModalConfirmSimple';
import ModalRenombrar from '@/compartido/componentes/ModalRenombrar';
import ModalAgrupar from '@/compartido/componentes/ModalAgrupar';
import { toast } from '@/compartido/hooks/useToast';


interface VistaSesionProps {
    diaObjeto: DiaConEjercicios;
    semanaObjeto: SemanaConDias;
    semanaNombre: string;
    onBack: () => void;
}
export default function VistaSesion({ diaObjeto, semanaObjeto, semanaNombre, onBack }: VistaSesionProps) {
    const [ejercicios, setEjercicios] = useState<EjercicioConDetalle[]>(diaObjeto.ejercicios);
    const [notasGrales, setNotasGrales] = useState<string>(diaObjeto.notas || '');
    const [saving, setSaving] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [condiciones, setCondiciones] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [copiedSesionId, setCopiedSesionId] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();
    const params = useParams();
    const clienteId = params.id as string;

    const [isDraggingBlock, setIsDraggingBlock] = useState(false);

    // Estados para modales de confirmación
    const [ejercicioAEliminar, setEjercicioAEliminar] = useState<{ id: string; nombre: string } | null>(null);
    const [grupoARenombrar, setGrupoARenombrar] = useState<{ grupoId: string; nombreActual: string } | null>(null);
    const [mostrarAgrupar, setMostrarAgrupar] = useState(false);
    const [grupoADesagrupar, setGrupoADesagrupar] = useState<{ grupoId: string; nombre: string } | null>(null);

    const handleDragStart = (idx: number, isBlock = false) => {
        setDraggingIdx(idx);
        setIsDraggingBlock(isBlock);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (idx: number) => {
        if (draggingIdx === null || draggingIdx === idx) return;

        const newEjercicios = [...ejercicios];
        
        if (isDraggingBlock) {
            const blockId = ejercicios[draggingIdx].grupoId;
            if (!blockId) return;

            const blockItems = ejercicios.filter(e => e.grupoId === blockId);
            const targetItem = ejercicios[idx];
            
            if (targetItem.grupoId === blockId) {
                setDraggingIdx(null);
                setIsDraggingBlock(false);
                return;
            }

            const otherItems = ejercicios.filter(e => e.grupoId !== blockId);
            const targetIdxInOthers = otherItems.findIndex(e => e.id === targetItem.id);
            
            const result = [...otherItems];
            if (targetIdxInOthers === -1) {
                result.push(...blockItems);
            } else {
                result.splice(targetIdxInOthers, 0, ...blockItems);
            }
            
            const updated = result.map((ej, i) => ({ ...ej, orden: i + 1 }));
            setEjercicios(updated);
            setDraggingIdx(null);
            setIsDraggingBlock(false);
            await reordenarEjercicios(diaObjeto.id, updated.map(e => e.id));
        } else {
            const [draggedItem] = newEjercicios.splice(draggingIdx, 1);
            newEjercicios.splice(idx, 0, draggedItem);

            const updated = newEjercicios.map((ej, i) => ({ ...ej, orden: i + 1 }));
            setEjercicios(updated);
            setDraggingIdx(null);
            setIsDraggingBlock(false);
            await reordenarEjercicios(diaObjeto.id, updated.map(e => e.id));
        }
    };

    const handleMove = async (idx: number, direction: 'up' | 'down') => {
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= ejercicios.length) return;

        const newEjercicios = [...ejercicios];
        const temp = newEjercicios[idx];
        newEjercicios[idx] = newEjercicios[newIdx];
        newEjercicios[newIdx] = temp;

        const updated = newEjercicios.map((ej, i) => ({ ...ej, orden: i + 1 }));
        setEjercicios(updated);

        await reordenarEjercicios(diaObjeto.id, updated.map(e => e.id));
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


    useEffect(() => {
        const sorted = [...diaObjeto.ejercicios].sort((a, b) => a.orden - b.orden);
        setEjercicios(sorted);
        setNotasGrales(diaObjeto.notas || '');
        setHasUnsavedChanges(false);
    }, [diaObjeto]);

    useEffect(() => {
        const isDirty = JSON.stringify(ejercicios) !== JSON.stringify([...diaObjeto.ejercicios].sort((a, b) => a.orden - b.orden)) || 
                        notasGrales !== (diaObjeto.notas || '');
        setHasUnsavedChanges(isDirty);
    }, [ejercicios, notasGrales, diaObjeto]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleEliminar = async (id: string) => {
        setEjercicioAEliminar({ id, nombre: '' });
    };

    const confirmarEliminacion = async () => {
        if (!ejercicioAEliminar) return;
        
        const res = await eliminarEjercicio(ejercicioAEliminar.id);
        if (res.exito) {
            toast.exito("Ejercicio eliminado correctamente");
            setEjercicios(prev => prev.filter(e => e.id !== ejercicioAEliminar.id));
            router.refresh();
        } else {
            toast.error(res.error || "Error al eliminar ejercicio");
        }
        setEjercicioAEliminar(null);
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
            const resNotas = await actualizarDiaSesion(diaObjeto.id, { notas: notasGrales });
            if (!resNotas.exito) {
                console.error('Error al guardar notas:', resNotas.error);
                setSaving(false);
                return;
            }

            for (let i = 0; i < ejercicios.length; i++) {
                const ej = ejercicios[i];
                const res = await guardarCambiosEjercicio(ej.id, {
                    series: ej.series,
                    modoMedicion: (ej.modoMedicion as 'REPS' | 'TIEMPO' | 'DISTANCIA' | 'AMRAP') || 'REPS',
                    repsMin: ej.repsMin ?? null,
                    repsMax: ej.repsMax ?? null,
                    tiempoObjetivoSeg: ej.tiempoObjetivoSeg ?? null,
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
                if (!res.exito) {
                    console.error('Error al guardar ejercicio ' + (i+1) + ':', res.error);
                    setSaving(false);
                    return;
                }
            }
            router.refresh();
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error al guardar sesión:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAgrupar = async () => {
        if (selectedIds.length < 2) {
            toast.error("Selecciona al menos 2 ejercicios para agrupar");
            return;
        }
        setMostrarAgrupar(true);
    };

    const confirmarAgrupar = async (nombre: string, tipo: 'AGRUPACION' | 'CIRCUITO', rounds?: number) => {
        const modalidad = tipo === 'CIRCUITO' ? 'CIRCUITO' : 'SECUENCIAL';
        const res = await agruparEjercicios(diaObjeto.id, selectedIds, nombre, modalidad, tipo, rounds);
        if (res.exito) {
            toast.exito("Ejercicios agrupados correctamente");
            router.refresh();
            setSelectedIds([]);
            setIsSelectionMode(false);
        } else {
            toast.error(res.error || "Error al agrupar");
        }
        setMostrarAgrupar(false);
    };

    const handleDesagrupar = async (grupoId: string, nombre: string) => {
        setGrupoADesagrupar({ grupoId, nombre });
    };

    const confirmarDesagrupar = async () => {
        if (!grupoADesagrupar) return;
        const res = await desagruparEjercicios(diaObjeto.id, grupoADesagrupar.grupoId);
        if (res.exito) {
            toast.exito("Bloque desagrupado correctamente");
            router.refresh();
        } else {
            toast.error(res.error || "Error al desagrupar");
        }
        setGrupoADesagrupar(null);
    };

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCambiarNombreGrupo = async (grupoId: string, nombreActual: string) => {
        setGrupoARenombrar({ grupoId, nombreActual });
    };

    const confirmarRenombrar = async (nuevoNombre: string) => {
        if (!grupoARenombrar) return;
        
        const res = await actualizarNombreGrupo(diaObjeto.id, grupoARenombrar.grupoId, nuevoNombre);
        if (res.exito) {
            toast.exito("Bloque renombrado correctamente");
            router.refresh();
        } else {
            toast.error(res.error || "Error al renombrar");
        }
        setGrupoARenombrar(null);
    };

    const handleAlternarModalidad = async (bloqueId: string, tipoActual: string) => {
        const nuevoTipo = tipoActual === 'CIRCUITO' ? 'AGRUPACION' : 'CIRCUITO';
        
        let rounds: number | undefined;
        if (nuevoTipo === 'CIRCUITO') {
            const roundsInput = prompt("Número de rondas:", "3");
            rounds = roundsInput ? parseInt(roundsInput, 10) : 1;
        }
        
        const modalidad = nuevoTipo === 'CIRCUITO' ? 'CIRCUITO' : 'SECUENCIAL';
        const res = await actualizarBloqueSesion(diaObjeto.id, bloqueId, { modalidad, tipo: nuevoTipo, rounds });
        if (res.exito) router.refresh();
    };

    const handleVincularABloque = async (bloqueId: string) => {
        if (selectedIds.length === 0) {
            return;
        }
        const res = await vincularEjerciciosABloque(diaObjeto.id, bloqueId, selectedIds);
        if (res.exito) {
            router.refresh();
            setSelectedIds([]);
            setIsSelectionMode(false);
        }
    };

    const handleCopiarEstructura = () => {
        localStorage.setItem('copied_sesion_id', diaObjeto.id);
        setCopiedSesionId(diaObjeto.id);
    };

    const handlePegarEstructura = async () => {
        const idOrigen = localStorage.getItem('copied_sesion_id');
        if (!idOrigen) return;
        if (!confirm("Esto reemplazará todos los ejercicios actuales con la estructura copiada. ¿Seguro?")) return;

        setSaving(true);
        const res = await clonarContenidoSesion(idOrigen, diaObjeto.id);
        if (res.exito) {
            router.refresh();
        } else {
            console.error("Error al pegar:", res.error);
        }
        setSaving(false);
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">


            <BannerClinico condiciones={condiciones} />

            <HeaderSesion
                diaObjeto={diaObjeto}
                semanaNombre={semanaNombre}
                hasUnsavedChanges={hasUnsavedChanges}
                saving={saving}
                isSelectionMode={isSelectionMode}
                selectedIds={selectedIds}
                copiedSesionId={copiedSesionId}
                onBack={onBack}
                onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
                onAgrupar={handleAgrupar}
                onCopiarEstructura={handleCopiarEstructura}
                onPegarEstructura={handlePegarEstructura}
                onGuardarTodo={handleGuardarTodo}
            />

            <MetodologiaSesion
                notasGrales={notasGrales}
                onChange={setNotasGrales}
            />


            <div className={`bg-marino-2 border rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500 ${semanaObjeto.esFaseDeload ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-blue-900/10' : 'border-marino-4'}`}>
                {semanaObjeto.esFaseDeload && (
                    <div className="bg-blue-500/10 border-b border-blue-500/10 px-8 py-4 flex items-center gap-4">
                        <Activity size={18} className="text-blue-400 animate-pulse" />
                        <span className="text-[0.7rem] font-black text-blue-100 uppercase tracking-[0.2em]">Fase de Descarga Crítica — Reducción de Fatiga Sistémica</span>
                    </div>
                )}

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
                                            <button onClick={() => handleDesagrupar(ej.grupoId!, ej.nombreGrupo || "Bloque")} className="text-[0.55rem] font-black text-gris/60 uppercase tracking-tighter hover:text-rojo transition-colors">Desvincular</button>
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
                                                            <div className="flex gap-1">
                                                                <div className="flex flex-col gap-1 mr-2">
                                                                    <button
                                                                        onClick={() => handleMove(ejercicios.findIndex(e => e.id === gej.id), 'up')}
                                                                        disabled={idx === 0}
                                                                        className="p-1.5 bg-marino-3 border border-marino-4 rounded-lg text-gris hover:text-naranja disabled:opacity-20 translate-y-1"
                                                                    >
                                                                        <ChevronUp size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleMove(ejercicios.findIndex(e => e.id === gej.id), 'down')}
                                                                        disabled={idx === ejercicios.length - 1}
                                                                        className="p-1.5 bg-marino-3 border border-marino-4 rounded-lg text-gris hover:text-naranja disabled:opacity-20 -translate-y-1"
                                                                    >
                                                                        <ChevronDown size={14} />
                                                                    </button>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleEliminar(gej.id)} 
                                                                    className="p-2 bg-rojo/10 hover:bg-rojo/30 text-rojo rounded-lg transition-all"
                                                                    title="Eliminar ejercicio"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Sets</label>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={gej.series}
                                                                onChange={(e) => handleUpdateChange(gej.id, { series: parseInt(e.target.value) })}
                                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-blanco focus:outline-none border border-marino-4/50"
                                                            />
                                                        </div>
                                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
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
                                                            inputMode="decimal"
                                                            pattern="[0-9]*(\.[0-9]+)?"
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
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    value={gej.repsMin ?? ''}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMin: parseInt(e.target.value) || null })}
                                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                                />
                                                                <span className="text-gris/40">—</span>
                                                                <input
                                                                    type="number"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    value={gej.repsMax ?? ''}
                                                                    onChange={(e) => handleUpdateChange(gej.id, { repsMax: parseInt(e.target.value) || null })}
                                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
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
                                            <div className="flex gap-1">
                                                <div className="flex flex-col gap-1 mr-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                                                        disabled={idx === 0}
                                                        className="p-1.5 bg-marino-3 border border-marino-4 rounded-lg text-gris hover:text-naranja disabled:opacity-20 translate-y-1"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMove(idx, 'down'); }}
                                                        disabled={idx === ejercicios.length - 1}
                                                        className="p-1.5 bg-marino-3 border border-marino-4 rounded-lg text-gris hover:text-naranja disabled:opacity-20 -translate-y-1"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEliminar(ej.id); }} 
                                                    className="p-2 bg-rojo/10 hover:bg-rojo/30 text-rojo rounded-lg transition-all"
                                                    title="Eliminar ejercicio"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Sets</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={ej.series}
                                                onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                                className="w-full bg-marino-4/20 rounded-lg py-1 px-2 text-2xl font-barlow-condensed font-black text-blanco focus:outline-none border border-marino-4/50"
                                            />
                                        </div>
                                        <div className="bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest block mb-1">RIR</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
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
                                            inputMode="decimal"
                                            pattern="[0-9]*(\.[0-9]+)?"
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={ej.repsMin ?? ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { repsMin: parseInt(e.target.value) || null })}
                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                />
                                                <span className="text-gris/40">—</span>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={ej.repsMax ?? ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { repsMax: parseInt(e.target.value) || null })}
                                                    className="w-14 bg-marino-4/30 border border-marino-4 rounded-lg py-2 text-base font-black text-blanco focus:outline-none text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-marino-3 rounded-2xl p-3 border border-marino-4/30">
                                            <label className="text-[0.55rem] font-black text-gris uppercase tracking-widest block mb-1">Descanso</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
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

                <div className="hidden md:block w-full overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm border-collapse table-fixed min-w-[1000px]">
                        <thead>
                            <tr className={`border-b border-white/5 ${semanaObjeto.esFaseDeload ? 'bg-blue-500/5' : 'bg-marino-3/40'}`}>
                                <th className="p-3 w-[40px] sticky left-0 z-30 bg-marino-2 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"></th>
                                <th className="p-3 w-[45px] font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] text-center sticky left-[40px] z-30 bg-marino-2 border-r border-white/5 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">#</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.65rem] w-[220px] sticky left-[85px] z-30 bg-marino-2 border-r border-white/5 shadow-[5px_0_15px_rgba(0,0,0,0.2)]">Ejercicio / Patrón</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[130px] text-center">Medición</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[80px] text-center">Sets</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[80px] text-center">RIR</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[100px] text-center">Rest</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem] w-[100px] text-center">Kg</th>
                                <th className="p-3 font-barlow-condensed font-black uppercase tracking-widest text-gris text-[0.6rem]">Técnica / Feedback</th>
                                <th className="p-3 text-right w-[60px]">
                                    <span className="sr-only">Acciones</span>
                                </th>
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
                                                <tr 
                                                    className={`bg-marino-3/20 border-l-4 border-l-naranja cursor-grab group transition-all ${draggingIdx === idx && isDraggingBlock ? 'opacity-20' : ''}`}
                                                    draggable={!isSelectionMode}
                                                    onDragStart={() => handleDragStart(idx, true)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={() => handleDrop(idx)}
                                                >
                                                    <td colSpan={10} className="px-8 py-3 group/header">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-1.5 bg-naranja/10 rounded-lg text-naranja group-hover:bg-naranja group-hover:text-marino transition-all">
                                                                    <GripVertical size={14} />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleCambiarNombreGrupo(ej.grupoId!, ej.nombreGrupo || "Bloque")}
                                                                    className="text-sm font-black text-blanco uppercase tracking-widest hover:text-naranja transition-colors flex items-center gap-2"
                                                                >
                                                                {ej.nombreGrupo || "Bloque Vinculado"}
                                                                {ej.bloque?.tipo === 'CIRCUITO' && ej.bloque?.rounds && (
                                                                    <span className="ml-2 text-[0.55rem] font-bold text-naranja">({ej.bloque.rounds} rondas)</span>
                                                                )}
                                                            </button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 bg-marino-4/30 p-1 rounded-xl border border-white/5">
                                                                <button
                                                                    onClick={() => handleAlternarModalidad(ej.grupoId!, ej.bloque?.tipo || 'AGRUPACION')}
                                                                    className={`text-[0.6rem] font-bold px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                                                                        (ej.bloque?.tipo || 'AGRUPACION') === 'CIRCUITO'
                                                                        ? 'bg-naranja text-marino'
                                                                        : 'text-gris/60 hover:text-blanco'
                                                                    }`}
                                                                >
                                                                    Circuito
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAlternarModalidad(ej.grupoId!, ej.bloque?.tipo || 'AGRUPACION')}
                                                                    className={`text-[0.6rem] font-bold px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                                                                        (ej.bloque?.tipo || 'AGRUPACION') === 'AGRUPACION'
                                                                        ? 'bg-blanco text-marino'
                                                                        : 'text-gris/60 hover:text-blanco'
                                                                    }`}
                                                                >
                                                                    Serie
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isSelectionMode && selectedIds.length > 0 && (
                                                                <button
                                                                    onClick={() => handleVincularABloque(ej.grupoId!)}
                                                                    className="text-[0.6rem] font-bold px-3 py-1 bg-verde text-marino rounded-lg uppercase"
                                                                >
                                                                    +Vincular ({selectedIds.length})
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDesagrupar(ej.grupoId!, ej.nombreGrupo || "Bloque")}
                                                                className="text-[0.55rem] font-bold text-gris/60 hover:text-rojo uppercase"
                                                            >
                                                                Desvincular
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {groupMembers.map((gej, gidx) => (
                                                    <tr 
                                                        key={gej.id} 
                                                        className="hover:bg-marino-3/30 transition-colors"
                                                    >
                                                        <td className="p-3 sticky left-0 z-20 bg-marino-2 border-r border-marino-4 w-[40px]">
                                                            {isSelectionMode && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(gej.id)}
                                                                    onChange={() => handleToggleSelection(gej.id)}
                                                                    className="w-4 h-4 rounded border-marino-4"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="p-3 sticky left-[40px] z-20 bg-marino-2 border-r border-marino-4 w-[45px] text-center font-black text-gris">
                                                            {String.fromCharCode(65 + gidx)}
                                                        </td>
                                                        <td className="p-3 sticky left-[85px] z-20 bg-marino-2 border-r border-marino-4 w-[220px]">
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
                                                        <td className="p-3 text-center w-[130px]">
                                                            <span className="text-[0.65rem] font-black text-gris uppercase">{gej.modoMedicion || 'REPS'}</span>
                                                        </td>
                                                        <td className="p-3 text-center w-[80px]">
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={gej.series}
                                                                onChange={(e) => handleUpdateChange(gej.id, { series: parseInt(e.target.value) })}
                                                                className="w-14 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-blanco"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center w-[80px]">
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={gej.RIR !== null ? gej.RIR : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-14 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-naranja"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center w-[100px]">
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={gej.descansoSegundos !== null ? gej.descansoSegundos : ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-20 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-blanco"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center w-[100px]">
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                inputMode="decimal"
                                                                pattern="[0-9]*(\.[0-9]+)?"
                                                                value={gej.pesoSugerido || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                                className="w-20 bg-marino-4/20 border border-verde/20 rounded-lg py-1 text-center font-black text-verde"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <textarea
                                                                value={gej.notasTecnicas || ''}
                                                                onChange={(e) => handleUpdateChange(gej.id, { notasTecnicas: e.target.value })}
                                                                className="w-full bg-marino-3/30 border border-marino-4/30 rounded-lg px-2 py-1 text-xs text-blanco font-medium resize-none"
                                                                rows={2}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-right w-[50px]">
                                                            {!isSelectionMode && (
                                                                <button
                                                                    onClick={() => handleEliminar(gej.id)}
                                                                    className="p-2 bg-rojo/10 hover:bg-rojo/30 text-rojo rounded-lg transition-all"
                                                                    title="Eliminar ejercicio"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    }

                                    return (
                                        <tr 
                                            key={ej.id} 
                                            className={`hover:bg-marino-3/30 transition-colors cursor-grab ${draggingIdx === idx && !isDraggingBlock ? 'opacity-30' : ''}`}
                                            draggable={!isSelectionMode}
                                            onDragStart={() => handleDragStart(idx, false)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(idx)}
                                        >
                                            <td className="p-3 sticky left-0 z-20 bg-marino-2 border-r border-marino-4 w-[40px]">
                                                {isSelectionMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(ej.id)}
                                                        onChange={() => handleToggleSelection(ej.id)}
                                                        className="w-4 h-4 rounded border-marino-4"
                                                    />
                                                )}
                                            </td>
                                            <td className="p-3 sticky left-[40px] z-20 bg-marino-2 border-r border-marino-4 w-[45px] text-center font-black text-blanco">
                                                {idx + 1}
                                            </td>
                                            <td className="p-3 sticky left-[85px] z-20 bg-marino-2 border-r border-marino-4 w-[220px]">
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
                                            <td className="p-3 text-center w-[130px]">
                                                <span className="text-[0.65rem] font-black text-gris uppercase">{ej.modoMedicion || 'REPS'}</span>
                                            </td>
                                            <td className="p-3 text-center w-[80px]">
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={ej.series}
                                                    onChange={(e) => handleUpdateChange(ej.id, { series: parseInt(e.target.value) })}
                                                    className="w-14 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-blanco focus:border-naranja/40"
                                                />
                                            </td>
                                            <td className="p-3 text-center w-[80px]">
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={ej.RIR !== null ? ej.RIR : ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { RIR: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-14 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-naranja"
                                                />
                                            </td>
                                            <td className="p-3 text-center w-[100px]">
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={ej.descansoSegundos !== null ? ej.descansoSegundos : ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { descansoSegundos: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-20 bg-marino-4/20 border border-marino-4 rounded-lg py-1 text-center font-black text-blanco"
                                                />
                                            </td>
                                            <td className="p-3 text-center w-[100px]">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    inputMode="decimal"
                                                    pattern="[0-9]*(\.[0-9]+)?"
                                                    value={ej.pesoSugerido || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { pesoSugerido: parseFloat(e.target.value) })}
                                                    className="w-20 bg-marino-4/20 border border-verde/20 rounded-lg py-1 text-center font-black text-verde"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <textarea
                                                    value={ej.notasTecnicas || ''}
                                                    onChange={(e) => handleUpdateChange(ej.id, { notasTecnicas: e.target.value })}
                                                    className="w-full bg-marino-3/30 border border-marino-4/30 rounded-lg px-2 py-1 text-xs text-blanco font-medium resize-none focus:border-naranja/30"
                                                    rows={2}
                                                />
                                            </td>
                                            <td className="p-3 text-right w-[60px]">
                                                {!isSelectionMode && (
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                                                                disabled={idx === 0}
                                                                className="p-1 text-gris hover:text-naranja disabled:opacity-20"
                                                            >
                                                                <ChevronUp size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMove(idx, 'down'); }}
                                                                disabled={idx === ejercicios.length - 1}
                                                                className="p-1 text-gris hover:text-naranja disabled:opacity-20"
                                                            >
                                                                <ChevronDown size={14} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEliminar(ej.id); }}
                                                            className="p-1.5 bg-rojo/10 hover:bg-rojo/30 text-rojo rounded-lg transition-all"
                                                            title="Eliminar ejercicio"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de confirmación para eliminar ejercicio */}
            <ModalConfirmSimple
                abierto={!!ejercicioAEliminar}
                titulo="Eliminar Ejercicio"
                mensaje="¿Estás seguro de que quieres eliminar este ejercicio de la sesión? Esta acción no se puede deshacer."
                textoConfirmar="Eliminar"
                variante="peligro"
                onConfirm={confirmarEliminacion}
                onClose={() => setEjercicioAEliminar(null)}
            />

            {/* Modal para renombrar grupo/bloque */}
            <ModalRenombrar
                abierto={!!grupoARenombrar}
                titulo="Renombrar Bloque"
                valorInicial={grupoARenombrar?.nombreActual || ''}
                placeholder="Nombre del bloque (ej: Superserie A)"
                onConfirm={confirmarRenombrar}
                onClose={() => setGrupoARenombrar(null)}
            />

            {/* Modal para agrupar ejercicios */}
            <ModalAgrupar
                abierto={mostrarAgrupar}
                cantidadSeleccionados={selectedIds.length}
                onConfirm={confirmarAgrupar}
                onClose={() => setMostrarAgrupar(false)}
            />

            {/* Modal para desagrupar */}
            <ModalConfirmSimple
                abierto={!!grupoADesagrupar}
                titulo="Desagrupar Ejercicios"
                mensaje={`¿Estás seguro de que quieres desvincular los ejercicios del bloque "${grupoADesagrupar?.nombre}"? Los ejercicios seguirán en la sesión pero sin agrupar.`}
                textoConfirmar="Desvincular"
                variante="advertencia"
                onConfirm={confirmarDesagrupar}
                onClose={() => setGrupoADesagrupar(null)}
            />
        </div>
    );
}