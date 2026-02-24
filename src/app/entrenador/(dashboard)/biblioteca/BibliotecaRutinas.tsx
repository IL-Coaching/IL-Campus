"use client";

import { useState, useEffect, useTransition } from 'react';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Dumbbell, X, GripVertical } from 'lucide-react';
import { obtenerRutinas, crearRutina, eliminarRutina, duplicarRutina } from '@/nucleo/acciones/rutina.accion';
import { buscarEjercicios } from '@/nucleo/acciones/ejercicio.accion';

interface EjercicioRutinaItem {
    id: string;
    ejercicioId: string | null;
    nombreLibre: string | null;
    series: number;
    repsMin: number;
    repsMax: number;
    descansoSeg: number;
    tempo: string | null;
    metodo: string | null;
    notasTecnicas: string | null;
    orden: number;
    ejercicio?: { id: string; nombre: string; musculoPrincipal: string; thumbnailUrl: string | null } | null;
}

interface RutinaItem {
    id: string;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    creadaEn: Date;
    ejercicios: EjercicioRutinaItem[];
    _count: { ejercicios: number };
}

interface EjercicioBusqueda {
    id: string;
    nombre: string;
    musculoPrincipal: string;
}

export default function BibliotecaRutinas() {
    const [rutinas, setRutinas] = useState<RutinaItem[]>([]);
    const [expandida, setExpandida] = useState<string | null>(null);
    const [creando, setCreando] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Estado del formulario de creación
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [ejerciciosForm, setEjerciciosForm] = useState<Array<{
        ejercicioId: string | null;
        nombreLibre: string;
        series: number;
        repsMin: number;
        repsMax: number;
        descansoSeg: number;
        tempo: string;
        metodo: string;
        notasTecnicas: string;
    }>>([]);

    // Buscador de ejercicios
    const [resultadosBusqueda, setResultadosBusqueda] = useState<EjercicioBusqueda[]>([]);
    const [buscandoIdx, setBuscandoIdx] = useState<number | null>(null);

    useEffect(() => {
        cargarRutinas();
    }, []);

    async function cargarRutinas() {
        const res = await obtenerRutinas();
        if (res.exito) setRutinas(res.rutinas as RutinaItem[]);
    }

    function toggleExpandida(id: string) {
        setExpandida(expandida === id ? null : id);
    }

    function iniciarCreacion() {
        setCreando(true);
        setNombre('');
        setDescripcion('');
        setCategoria('');
        setEjerciciosForm([]);
    }

    function cancelarCreacion() {
        setCreando(false);
    }

    function agregarEjercicioVacio() {
        setEjerciciosForm(prev => [...prev, {
            ejercicioId: null,
            nombreLibre: '',
            series: 3,
            repsMin: 8,
            repsMax: 12,
            descansoSeg: 90,
            tempo: '',
            metodo: '',
            notasTecnicas: ''
        }]);
    }

    function eliminarEjercicioForm(idx: number) {
        setEjerciciosForm(prev => prev.filter((_, i) => i !== idx));
    }

    function actualizarEjercicioForm(idx: number, campo: string, valor: string | number | null) {
        setEjerciciosForm(prev => prev.map((ej, i) =>
            i === idx ? { ...ej, [campo]: valor } : ej
        ));
    }

    async function buscarEj(query: string, idx: number) {
        setBuscandoIdx(idx);
        if (query.length < 2) {
            setResultadosBusqueda([]);
            return;
        }
        const resultados = await buscarEjercicios(query);
        setResultadosBusqueda(resultados as EjercicioBusqueda[]);
    }

    function seleccionarEjBuscado(idx: number, ej: EjercicioBusqueda) {
        actualizarEjercicioForm(idx, 'ejercicioId', ej.id);
        actualizarEjercicioForm(idx, 'nombreLibre', ej.nombre);
        setResultadosBusqueda([]);
        setBuscandoIdx(null);
    }

    function handleCrear() {
        if (!nombre.trim()) return;
        startTransition(async () => {
            await crearRutina({
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                categoria: categoria.trim() || undefined,
                ejercicios: ejerciciosForm.map((ej, i) => ({
                    ejercicioId: ej.ejercicioId,
                    nombreLibre: ej.ejercicioId ? null : ej.nombreLibre || null,
                    series: ej.series,
                    repsMin: ej.repsMin,
                    repsMax: ej.repsMax,
                    descansoSeg: ej.descansoSeg,
                    tempo: ej.tempo || null,
                    metodo: ej.metodo || null,
                    notasTecnicas: ej.notasTecnicas || null,
                    orden: i
                }))
            });
            setCreando(false);
            await cargarRutinas();
        });
    }

    function handleEliminar(id: string) {
        startTransition(async () => {
            await eliminarRutina(id);
            await cargarRutinas();
        });
    }

    function handleDuplicar(id: string) {
        startTransition(async () => {
            await duplicarRutina(id);
            await cargarRutinas();
        });
    }

    // ── Formulario de creación ──
    if (creando) {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-xl p-6 shadow-lg space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tight">
                        Nueva Rutina Plantilla
                    </h3>
                    <button onClick={cancelarCreacion} className="text-gris hover:text-blanco transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Campos generales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1.5">Nombre *</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Tren superior push"
                            className="w-full bg-marino border border-marino-4 rounded-xl py-2.5 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                        />
                    </div>
                    <div>
                        <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1.5">Categoría</label>
                        <input
                            type="text"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            placeholder="Ej: Fuerza, Hipertrofia"
                            className="w-full bg-marino border border-marino-4 rounded-xl py-2.5 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                        />
                    </div>
                    <div>
                        <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1.5">Descripción</label>
                        <input
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción breve"
                            className="w-full bg-marino border border-marino-4 rounded-xl py-2.5 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                        />
                    </div>
                </div>

                {/* Lista de ejercicios */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">Ejercicios de la rutina</h4>
                        <button
                            onClick={agregarEjercicioVacio}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-naranja/10 text-naranja text-[0.55rem] uppercase tracking-widest font-black hover:bg-naranja hover:text-marino transition-all"
                        >
                            <Plus size={12} /> Agregar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {ejerciciosForm.map((ej, idx) => (
                            <div key={idx} className="bg-marino-3/50 border border-marino-4 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <GripVertical size={14} className="text-marino-4" />
                                    <span className="text-[0.55rem] text-naranja font-black uppercase tracking-widest">#{idx + 1}</span>

                                    {/* Buscador de ejercicio */}
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={ej.nombreLibre}
                                            onChange={(e) => {
                                                actualizarEjercicioForm(idx, 'nombreLibre', e.target.value);
                                                actualizarEjercicioForm(idx, 'ejercicioId', null);
                                                buscarEj(e.target.value, idx);
                                            }}
                                            placeholder="Buscar ejercicio o escribir nombre libre..."
                                            className="w-full bg-marino border border-marino-4 rounded-lg py-2 px-3 text-xs text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                                        />
                                        {buscandoIdx === idx && resultadosBusqueda.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-marino-2 border border-marino-4 rounded-lg max-h-40 overflow-y-auto shadow-xl">
                                                {resultadosBusqueda.map((r) => (
                                                    <button
                                                        key={r.id}
                                                        onClick={() => seleccionarEjBuscado(idx, r)}
                                                        className="w-full text-left px-3 py-2 text-xs text-blanco hover:bg-naranja/10 border-b border-marino-4/50 last:border-b-0"
                                                    >
                                                        <span className="font-bold">{r.nombre}</span>
                                                        <span className="text-gris ml-2 text-[0.5rem] uppercase">{r.musculoPrincipal}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => eliminarEjercicioForm(idx)}
                                        className="text-gris hover:text-[#EF4444] transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Params del ejercicio */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Series</label>
                                        <input type="number" value={ej.series} min={1} onChange={(e) => actualizarEjercicioForm(idx, 'series', parseInt(e.target.value) || 1)} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center focus:outline-none focus:border-naranja/50" />
                                    </div>
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Reps Min</label>
                                        <input type="number" value={ej.repsMin} min={1} onChange={(e) => actualizarEjercicioForm(idx, 'repsMin', parseInt(e.target.value) || 1)} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center focus:outline-none focus:border-naranja/50" />
                                    </div>
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Reps Max</label>
                                        <input type="number" value={ej.repsMax} min={1} onChange={(e) => actualizarEjercicioForm(idx, 'repsMax', parseInt(e.target.value) || 1)} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center focus:outline-none focus:border-naranja/50" />
                                    </div>
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Descanso(s)</label>
                                        <input type="number" value={ej.descansoSeg} min={0} onChange={(e) => actualizarEjercicioForm(idx, 'descansoSeg', parseInt(e.target.value) || 0)} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center focus:outline-none focus:border-naranja/50" />
                                    </div>
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Tempo</label>
                                        <input type="text" value={ej.tempo} onChange={(e) => actualizarEjercicioForm(idx, 'tempo', e.target.value)} placeholder="3-1-2-0" className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center placeholder:text-gris focus:outline-none focus:border-naranja/50" />
                                    </div>
                                    <div>
                                        <label className="text-[0.5rem] text-gris uppercase tracking-widest font-bold block mb-1">Método</label>
                                        <input type="text" value={ej.metodo} onChange={(e) => actualizarEjercicioForm(idx, 'metodo', e.target.value)} placeholder="Rest-pause" className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-2 text-xs text-blanco text-center placeholder:text-gris focus:outline-none focus:border-naranja/50" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {ejerciciosForm.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-marino-4 rounded-xl">
                                <Dumbbell size={24} className="mx-auto text-marino-4 mb-2" />
                                <p className="text-gris italic text-sm">Agregá ejercicios a la rutina</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-marino-4">
                    <button
                        onClick={cancelarCreacion}
                        className="px-5 py-2.5 rounded-xl bg-marino-3 border border-marino-4 text-gris text-[0.6rem] uppercase tracking-widest font-black hover:text-blanco transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCrear}
                        disabled={isPending || !nombre.trim()}
                        className="px-6 py-2.5 rounded-xl bg-naranja text-marino text-[0.6rem] uppercase tracking-widest font-black hover:bg-naranja/80 transition-colors disabled:opacity-30"
                    >
                        Crear Rutina
                    </button>
                </div>
            </div>
        );
    }

    // ── Vista de lista de rutinas ──
    return (
        <div className="space-y-4">
            {/* Botón crear */}
            <div className="flex justify-end">
                <button
                    onClick={iniciarCreacion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-naranja text-marino text-[0.65rem] uppercase tracking-widest font-black hover:bg-naranja/80 transition-colors shadow-lg shadow-naranja/20"
                >
                    <Plus size={14} /> Nueva Rutina
                </button>
            </div>

            {rutinas.length === 0 ? (
                <div className="bg-marino-2 border border-marino-4 rounded-xl p-12 text-center">
                    <Dumbbell size={40} className="mx-auto text-marino-4 mb-4" />
                    <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter mb-2">
                        Sin rutinas plantilla
                    </h3>
                    <p className="text-gris text-sm max-w-md mx-auto">
                        Creá rutinas genéricas que luego podrás incluir en las planificaciones de tus clientes.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rutinas.map((rutina) => (
                        <div key={rutina.id} className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                            {/* Header de la rutina */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-marino-3/30 transition-colors"
                                onClick={() => toggleExpandida(rutina.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center">
                                        <Dumbbell size={18} className="text-naranja" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-blanco">{rutina.nombre}</p>
                                        <div className="flex gap-3 mt-0.5">
                                            {rutina.categoria && (
                                                <span className="text-[0.5rem] text-naranja font-black uppercase tracking-widest">{rutina.categoria}</span>
                                            )}
                                            <span className="text-[0.5rem] text-gris font-bold uppercase tracking-widest">
                                                {rutina._count.ejercicios} ejercicio{rutina._count.ejercicios !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDuplicar(rutina.id); }}
                                        disabled={isPending}
                                        className="p-2 rounded-lg text-gris hover:text-naranja transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEliminar(rutina.id); }}
                                        disabled={isPending}
                                        className="p-2 rounded-lg text-gris hover:text-[#EF4444] transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    {expandida === rutina.id ? <ChevronUp size={16} className="text-gris" /> : <ChevronDown size={16} className="text-gris" />}
                                </div>
                            </div>

                            {/* Detalle expandido */}
                            {expandida === rutina.id && (
                                <div className="border-t border-marino-4 p-4 space-y-2">
                                    {rutina.descripcion && (
                                        <p className="text-xs text-gris mb-3">{rutina.descripcion}</p>
                                    )}
                                    {rutina.ejercicios.map((ej, i) => (
                                        <div key={ej.id} className="flex items-center gap-3 p-3 bg-marino-3/30 border border-marino-4/50 rounded-lg">
                                            <span className="text-[0.5rem] text-naranja font-black w-5">#{i + 1}</span>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-blanco">
                                                    {ej.ejercicio?.nombre || ej.nombreLibre || 'Sin nombre'}
                                                </p>
                                                {ej.ejercicio?.musculoPrincipal && (
                                                    <p className="text-[0.5rem] text-gris uppercase">{ej.ejercicio.musculoPrincipal}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-[0.5rem] text-gris font-bold uppercase tracking-widest">
                                                <span>{ej.series}x{ej.repsMin}-{ej.repsMax}</span>
                                                <span>{ej.descansoSeg}s desc.</span>
                                                {ej.tempo && <span>T:{ej.tempo}</span>}
                                                {ej.metodo && <span className="text-naranja">{ej.metodo}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
