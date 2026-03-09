"use client";

import { useState, useEffect, useTransition, useRef } from 'react';
import { StickyNote, Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react';
import { obtenerNotas, crearNota, editarNota, eliminarNota, reordenarNotas } from '@/nucleo/acciones/nota.accion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Nota {
    id: string;
    contenido: string;
    orden: number;
    creadaEn: Date;
}

export default function PanelNotas() {
    const [notas, setNotas] = useState<Nota[]>([]);
    const [nuevaNota, setNuevaNota] = useState('');
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [editandoTexto, setEditandoTexto] = useState('');
    const [isPending, startTransition] = useTransition();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        cargarNotas();
    }, []);

    async function cargarNotas() {
        const res = await obtenerNotas();
        if (res.exito) {
            setNotas(res.notas as Nota[]);
        }
    }

    function handleCrear() {
        if (!nuevaNota.trim()) return;
        startTransition(async () => {
            await crearNota(nuevaNota.trim());
            setNuevaNota('');
            await cargarNotas();
        });
    }

    function handleEliminar(id: string) {
        startTransition(async () => {
            await eliminarNota(id);
            await cargarNotas();
        });
    }

    function iniciarEdicion(nota: Nota) {
        setEditandoId(nota.id);
        setEditandoTexto(nota.contenido);
    }

    function handleGuardarEdicion() {
        if (!editandoId || !editandoTexto.trim()) return;
        startTransition(async () => {
            await editarNota(editandoId!, editandoTexto.trim());
            setEditandoId(null);
            setEditandoTexto('');
            await cargarNotas();
        });
    }

    function cancelarEdicion() {
        setEditandoId(null);
        setEditandoTexto('');
    }

    // ── Drag & Drop ──
    function handleDragStart(id: string) {
        setDraggingId(id);
    }

    function handleDragOver(e: React.DragEvent, targetId: string) {
        e.preventDefault();
        if (!draggingId || draggingId === targetId) return;

        const newNotas = [...notas];
        const fromIdx = newNotas.findIndex(n => n.id === draggingId);
        const toIdx = newNotas.findIndex(n => n.id === targetId);

        if (fromIdx === -1 || toIdx === -1) return;

        const [moved] = newNotas.splice(fromIdx, 1);
        newNotas.splice(toIdx, 0, moved);
        setNotas(newNotas);
    }

    function handleDragEnd() {
        if (!draggingId) return;
        setDraggingId(null);

        // Persistir nuevo orden
        const idsOrdenados = notas.map(n => n.id);
        startTransition(async () => {
            await reordenarNotas(idsOrdenados);
        });
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            handleCrear();
        }
    }

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-[480px] overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-marino-4 bg-naranja/5">
                <h3 className="font-barlow-condensed font-black tracking-widest uppercase text-sm text-naranja flex items-center gap-2">
                    <StickyNote size={16} /> Notas
                </h3>
                <p className="text-[0.6rem] text-gris font-bold tracking-widest uppercase mt-1">
                    Recordatorios privados del entrenador
                </p>
            </div>

            {/* Lista de notas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {notas.length === 0 && !isPending ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <StickyNote size={32} className="text-marino-4 mb-3" />
                        <p className="text-gris italic text-sm">Todavía no tenés notas.</p>
                        <p className="text-[0.6rem] text-gris uppercase tracking-widest mt-1">Usá el campo de abajo para agregar una</p>
                    </div>
                ) : (
                    notas.map((nota) => (
                        <div
                            key={nota.id}
                            onDragOver={(e) => handleDragOver(e, nota.id)}
                            className={`p-3 rounded-xl border border-marino-4 bg-marino-3/50 group transition-all hover:border-naranja/30 ${draggingId === nota.id ? 'opacity-50 scale-95' : ''
                                }`}
                        >
                            {editandoId === nota.id ? (
                                /* Modo edición */
                                <div className="space-y-2">
                                    <textarea
                                        value={editandoTexto}
                                        onChange={(e) => setEditandoTexto(e.target.value)}
                                        className="w-full bg-marino-2 border border-marino-4 rounded-lg p-2 text-sm text-blanco focus:outline-none focus:border-naranja/50 resize-none"
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={cancelarEdicion}
                                            className="p-1.5 rounded-lg bg-marino-4 text-gris hover:text-blanco transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                        <button
                                            onClick={handleGuardarEdicion}
                                            disabled={isPending}
                                            className="p-1.5 rounded-lg bg-naranja text-marino hover:bg-naranja/80 transition-colors disabled:opacity-50"
                                        >
                                            <Check size={12} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Modo visualización */
                                <div className="flex items-start gap-2">
                                    <div
                                        draggable
                                        onDragStart={() => handleDragStart(nota.id)}
                                        onDragEnd={handleDragEnd}
                                        className="text-marino-4 group-hover:text-gris cursor-grab mt-0.5 flex-shrink-0"
                                    >
                                        <GripVertical size={14} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.55rem] text-naranja font-black uppercase tracking-widest mb-1">
                                            Nota del {format(new Date(nota.creadaEn), "dd/MM/yyyy", { locale: es })}
                                        </p>
                                        <p className="text-sm text-blanco leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                            onClick={() => iniciarEdicion(nota)}
                                            className="p-1.5 rounded-lg bg-marino-4 text-gris hover:text-naranja transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(nota.id)}
                                            disabled={isPending}
                                            className="p-1.5 rounded-lg bg-marino-4 text-gris hover:text-[#EF4444] transition-colors disabled:opacity-50"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input para nueva nota */}
            <div className="p-4 border-t border-marino-4 bg-marino-3/30">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={nuevaNota}
                        onChange={(e) => setNuevaNota(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Agregar NOTA:"
                        className="flex-1 bg-marino-2 border border-marino-4 rounded-xl py-2.5 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-all font-medium"
                    />
                    <button
                        onClick={handleCrear}
                        disabled={isPending || !nuevaNota.trim()}
                        className="w-10 h-10 rounded-xl bg-naranja text-marino flex items-center justify-center hover:bg-naranja/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
