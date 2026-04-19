"use client"
import { useState, useEffect, useTransition } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Dumbbell, X, Calendar, Loader2, Settings, ArrowLeft } from 'lucide-react';
import { 
    obtenerPlantillasSemana, 
    crearPlantillaSemana,
    actualizarDiaPlantilla,
    agregarEjercicioAPlantilla,
    guardarCambiosEjercicioPlantilla,
    eliminarEjercicioPlantilla,
    eliminarPlantillaSemana
} from '@/nucleo/acciones/planificacion.accion';
import BuscadorEjercicios from '@/compartido/componentes/planificacion/BuscadorEjercicios';
import SelectorEjercicioCelda from '../componentes/planificacion/SelectorEjercicioCelda';

interface EjercicioPlantilla {
    id: string;
    ejercicioId: string | null;
    nombreLibre: string | null;
    esBiblioteca: boolean;
    series: number;
    repsMin: number | null;
    repsMax: number | null;
    RIR: number | null;
    tempo: string | null;
    descansoSegundos: number | null;
    pesoSugerido: number | null;
    notasTecnicas: string | null;
    orden: number;
    ejercicio?: { id: string; nombre: string; musculoPrincipal: string } | null;
}

interface DiaPlantilla {
    id: string;
    diaSemana: string;
    focoMuscular: string | null;
    notas: string | null;
    ejercicios: EjercicioPlantilla[];
}

interface PlantillaSemana {
    id: string;
    numeroSemana: number;
    objetivoSemana: string;
    RIRobjetivo: number;
    volumenEstimado: string;
    esFaseDeload: boolean;
    esPlantilla: boolean;
    plantillaNombre: string | null;
    diasSesion: DiaPlantilla[];
    creadoEn: Date;
    actualizadoEn: Date;
}

export default function ConstructorBiblioteca() {
    const [plantillas, setPlantillas] = useState<PlantillaSemana[]>([]);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaSemana | null>(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState<DiaPlantilla | null>(null);
    const [creando, setCreando] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [buscadorOpen, setBuscadorOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [expandida, setExpandida] = useState<string | null>(null);
    
    // Estado para edición de ejercicios
    const [ejerciciosEditando, setEjerciciosEditando] = useState<Record<string, EjercicioPlantilla>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    function toggleExpandida(id: string) {
        setExpandida(prev => prev === id ? null : id);
    }

    useEffect(() => {
        cargarPlantillas();
    }, []);

    async function cargarPlantillas() {
        setCargando(true);
        const res = await obtenerPlantillasSemana();
        if (res.exito && res.plantillas) {
            setPlantillas(res.plantillas as unknown as unknown as PlantillaSemana[]);
        }
        setCargando(false);
    }

    function iniciarCreacion() {
        setCreando(true);
    }

    function cancelarCreacion() {
        setCreando(false);
    }

    async function handleCrearPlantilla() {
        startTransition(async () => {
            const res = await crearPlantillaSemana({
                nombre: 'Nueva Plantilla',
                objetivoSemana: 'Entrenamiento general',
                esFaseDeload: false
            });
            if (res.exito) {
                await cargarPlantillas();
                setCreando(false);
                // Seleccionar la nueva plantilla
                const nuevas = await obtenerPlantillasSemana();
                if (nuevas.exito && nuevas.plantillas) {
                    const nueva = (nuevas.plantillas as unknown as PlantillaSemana[])[0];
                    setPlantillaSeleccionada(nueva);
                    setDiaSeleccionado(nueva.diasSesion[0] || null);
                }
            }
        });
    }

    function seleccionarPlantilla(plantilla: PlantillaSemana) {
        setPlantillaSeleccionada(plantilla);
        setDiaSeleccionado(plantilla.diasSesion[0] || null);
        // Inicializar ejercicios editando
        const ejercicios: Record<string, EjercicioPlantilla> = {};
        plantilla.diasSesion.forEach(dia => {
            dia.ejercicios.forEach(ej => {
                ejercicios[ej.id] = ej;
            });
        });
        setEjerciciosEditando(ejercicios);
    }

    function volverALista() {
        setPlantillaSeleccionada(null);
        setDiaSeleccionado(null);
    }

    async function handleActualizarDia(diaId: string, focoMuscular: string) {
        await actualizarDiaPlantilla(diaId, { focoMuscular });
        await cargarPlantillas();
        if (plantillaSeleccionada) {
            const actualizada = await obtenerPlantillasSemana();
            if (actualizada.exito && actualizada.plantillas) {
                const found = (actualizada.plantillas as unknown as PlantillaSemana[]).find(p => p.id === plantillaSeleccionada?.id);
                if (found) setPlantillaSeleccionada(found);
            }
        }
    }

    async function handleSelectEjercicio(ejercicio: { id: string | null; nombreLibre: string } | { id: string; nombre: string }) {
        if (!diaSeleccionado) return;
        
        const id = 'nombreLibre' in ejercicio ? ejercicio.id : null;
        const nombreLibre = 'nombreLibre' in ejercicio ? ejercicio.nombreLibre : undefined;

        await agregarEjercicioAPlantilla(diaSeleccionado.id, id, nombreLibre);
        setBuscadorOpen(false);
        
        // Recargar
        await cargarPlantillas();
        if (plantillaSeleccionada) {
            const actualizada = await obtenerPlantillasSemana();
            if (actualizada.exito && actualizada.plantillas) {
                const found = (actualizada.plantillas as unknown as PlantillaSemana[]).find(p => p.id === plantillaSeleccionada?.id);
                if (found) {
                    setPlantillaSeleccionada(found);
                    const diaUpdated = found.diasSesion.find(d => d.id === diaSeleccionado?.id);
                    if (diaUpdated) setDiaSeleccionado(diaUpdated);
                }
            }
        }
    }

    async function handleActualizarEjercicio(ejId: string, updates: Partial<EjercicioPlantilla>) {
        setEjerciciosEditando(prev => ({
            ...prev,
            [ejId]: { ...prev[ejId], ...updates }
        }));
        setHasUnsavedChanges(true);
    }

    async function handleGuardarCambios() {
        for (const [ejId, ej] of Object.entries(ejerciciosEditando)) {
            await guardarCambiosEjercicioPlantilla(ejId, {
                series: ej.series,
                repsMin: ej.repsMin,
                repsMax: ej.repsMax,
                descansoSegundos: ej.descansoSegundos,
                RIR: ej.RIR,
                tempo: ej.tempo,
                pesoSugerido: ej.pesoSugerido,
                notasTecnicas: ej.notasTecnicas
            });
        }
        setHasUnsavedChanges(false);
        await cargarPlantillas();
    }

    async function handleEliminarEjercicio(ejId: string) {
        await eliminarEjercicioPlantilla(ejId);
        await cargarPlantillas();
        if (plantillaSeleccionada) {
            const actualizada = await obtenerPlantillasSemana();
            if (actualizada.exito && actualizada.plantillas) {
                const found = (actualizada.plantillas as unknown as PlantillaSemana[]).find(p => p.id === plantillaSeleccionada?.id);
                if (found) {
                    setPlantillaSeleccionada(found);
                    const diaUpdated = found.diasSesion.find(d => d.id === diaSeleccionado?.id);
                    if (diaUpdated) setDiaSeleccionado(diaUpdated);
                }
            }
        }
    }

    // ========== VISTA: CREAR NUEVA PLANTILLA ==========
    if (creando) {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tight">
                        Nueva Plantilla de Semana
                    </h3>
                    <button onClick={cancelarCreacion} className="text-gris hover:text-blanco transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-naranja/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-naranja" />
                    </div>
                    <p className="text-blanco font-black text-lg mb-2">Crear semana genérica</p>
                    <p className="text-gris text-sm mb-6">
                        Se creará una estructura de 7 días que luego podrás editar con tus ejercicios.
                    </p>
                    <button
                        onClick={handleCrearPlantilla}
                        disabled={isPending}
                        className="px-8 py-3 bg-naranja text-marino rounded-xl font-black uppercase tracking-widest hover:bg-naranja/80 transition-colors"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : 'Crear Plantilla'}
                    </button>
                </div>
            </div>
        );
    }

    // ========== VISTA: EDITOR DE PLANTILLA ==========
    if (plantillaSeleccionada && diaSeleccionado) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header del Editor */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-marino-4 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={volverALista}
                            className="p-2 bg-marino-2 border border-marino-4 rounded-xl text-gris hover:text-blanco transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco">
                                {plantillaSeleccionada.plantillaNombre || 'Plantilla'}
                            </h2>
                            <p className="text-gris text-sm">{plantillaSeleccionada.objetivoSemana}</p>
                        </div>
                    </div>
                    
                    {hasUnsavedChanges && (
                        <div className="bg-naranja/10 border border-naranja/30 rounded-xl px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-naranja rounded-full animate-pulse"></div>
                            <span className="text-[0.65rem] font-black text-naranja uppercase">Cambios sin guardar</span>
                        </div>
                    )}
                    
                    <div className="flex gap-3">
                        <button
                            onClick={handleGuardarCambios}
                            disabled={!hasUnsavedChanges || isPending}
                            className="px-5 py-2.5 bg-naranja text-marino rounded-xl font-black uppercase text-sm tracking-widest hover:bg-naranja/80 transition-colors disabled:opacity-30"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : 'Guardar'}
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm('¿Eliminar esta plantilla?')) {
                                    await eliminarPlantillaSemana(plantillaSeleccionada.id);
                                    volverALista();
                                    await cargarPlantillas();
                                }
                            }}
                            className="px-5 py-2.5 bg-marino-2 border border-marino-4 text-rojo rounded-xl font-black uppercase text-sm tracking-widest hover:bg-rojo/10 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Selector de Días */}
                <div className="grid grid-cols-7 gap-2">
                    {plantillaSeleccionada.diasSesion.map((dia) => (
                        <button
                            key={dia.id}
                            onClick={() => setDiaSeleccionado(dia)}
                            className={`p-3 rounded-xl text-center transition-all ${
                                diaSeleccionado.id === dia.id
                                    ? 'bg-naranja text-marino'
                                    : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco hover:border-naranja/40'
                            }`}
                        >
                            <span className="text-[0.6rem] font-black uppercase tracking-widest block mb-1">
                                {dia.diaSemana.substring(0, 3)}
                            </span>
                            <span className="text-[0.55rem] font-bold">
                                {dia.ejercicios.length} ejs
                            </span>
                        </button>
                    ))}
                </div>

                {/* Editor del Día */}
                <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-marino-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-blanco uppercase">{diaSeleccionado.diaSemana}</h3>
                            <input
                                type="text"
                                value={diaSeleccionado.focoMuscular || ''}
                                onChange={async (e) => {
                                    await handleActualizarDia(diaSeleccionado.id, e.target.value);
                                }}
                                placeholder="Foco muscular (ej: Tren superior)"
                                className="bg-transparent border-none text-naranja font-bold text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Lista de Ejercicios */}
                    <div className="divide-y divide-marino-4">
                        {diaSeleccionado.ejercicios.length === 0 ? (
                            <div className="p-12 text-center">
                                <Dumbbell size={40} className="text-marino-4 mx-auto mb-4" />
                                <p className="text-gris text-sm mb-4">Sin ejercicios en este día</p>
                            </div>
                        ) : (
                            diaSeleccionado.ejercicios.map((ej, idx) => (
                                <div key={ej.id} className="p-4 bg-marino-3/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-6 h-6 bg-marino-3 border border-marino-4 rounded-lg flex items-center justify-center text-xs font-black text-gris">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <SelectorEjercicioCelda
                                                initialValue={ej.ejercicio?.nombre || ej.nombreLibre || ""}
                                                ejercicioId={ej.ejercicioId}
                                                esBiblioteca={ej.esBiblioteca}
                                                onSelect={() => {}} // No permitir cambiar ejercicio por ahora
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleEliminarEjercicio(ej.id)}
                                            className="text-rojo/50 hover:text-rojo transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">Sets</label>
                                            <input
                                                type="number"
                                                value={ej.series}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { series: parseInt(e.target.value) || 3 })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-blanco text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">Reps Min</label>
                                            <input
                                                type="number"
                                                value={ej.repsMin ?? ''}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { repsMin: parseInt(e.target.value) || null })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-blanco text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">Reps Max</label>
                                            <input
                                                type="number"
                                                value={ej.repsMax ?? ''}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { repsMax: parseInt(e.target.value) || null })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-blanco text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">RIR</label>
                                            <input
                                                type="number"
                                                value={ej.RIR ?? ''}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { RIR: parseInt(e.target.value) || null })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-naranja text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">Descanso(s)</label>
                                            <input
                                                type="number"
                                                value={ej.descansoSegundos ?? ''}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { descansoSegundos: parseInt(e.target.value) || null })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-blanco text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[0.5rem] text-gris uppercase block mb-1">Kg</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={ej.pesoSugerido ?? ''}
                                                onChange={(e) => handleActualizarEjercicio(ej.id, { pesoSugerido: parseFloat(e.target.value) || null })}
                                                className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 text-center text-verde text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Botón agregar ejercicio */}
                    <div className="p-4 border-t border-marino-4">
                        <button
                            onClick={() => setBuscadorOpen(true)}
                            className="w-full p-4 border-2 border-dashed border-marino-4 rounded-xl text-gris hover:text-naranja hover:border-naranja/40 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            <span className="text-sm font-black uppercase tracking-widest">Agregar Ejercicio</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== VISTA: LISTA DE PLANTILLAS ==========
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-black text-blanco uppercase">Plantillas de Semana</h3>
                    <p className="text-gris text-sm">Crea y gestiona estructuras de entrenamiento reutilizables</p>
                </div>
                <button
                    onClick={iniciarCreacion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-naranja text-marino rounded-xl font-black uppercase text-sm tracking-widest hover:bg-naranja/80 transition-colors"
                >
                    <Plus size={16} /> Nueva Plantilla
                </button>
            </div>

            {cargando ? (
                <div className="text-center py-12">
                    <Loader2 className="animate-spin text-naranja mx-auto" size={32} />
                </div>
            ) : plantillas.length === 0 ? (
                <div className="bg-marino-2 border border-marino-4 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-marino-3 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-marino-4" />
                    </div>
                    <h4 className="text-xl font-black text-blanco uppercase mb-2">Sin plantillas</h4>
                    <p className="text-gris text-sm mb-6">
                        Crea plantillas de semanas que luego podrás importar a tus clientes.
                    </p>
                    <button
                        onClick={iniciarCreacion}
                        className="px-6 py-3 bg-naranja text-marino rounded-xl font-black uppercase tracking-widest hover:bg-naranja/80"
                    >
                        Crear Primera Plantilla
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {plantillas.map((plantilla) => (
                        <div
                            key={plantilla.id}
                            className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden hover:border-naranja/30 transition-colors"
                        >
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpandida(plantilla.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-naranja/10 rounded-xl flex items-center justify-center">
                                        <Calendar size={20} className="text-naranja" />
                                    </div>
                                    <div>
                                        <p className="text-blanco font-black">{plantilla.plantillaNombre || 'Plantilla sin nombre'}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-[0.5rem] text-naranja font-bold uppercase">
                                                {plantilla.diasSesion.reduce((acc, d) => acc + d.ejercicios.length, 0)} ejercicios
                                            </span>
                                            <span className="text-[0.5rem] text-gris uppercase">
                                                {plantilla.diasSesion.filter(d => d.ejercicios.length > 0).length} días
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            seleccionarPlantilla(plantilla);
                                        }}
                                        className="p-2 text-naranja hover:bg-naranja/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('¿Eliminar?')) {
                                                startTransition(async () => {
                                                    await eliminarPlantillaSemana(plantilla.id);
                                                    await cargarPlantillas();
                                                });
                                            }
                                        }}
                                        className="p-2 text-rojo/50 hover:text-rojo hover:bg-rojo/10 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandida === plantilla.id ? <ChevronUp size={18} className="text-gris" /> : <ChevronDown size={18} className="text-gris" />}
                                </div>
                            </div>
                            
                            {expandida === plantilla.id && (
                                <div className="border-t border-marino-4 p-4 bg-marino-3/20">
                                    <div className="grid grid-cols-7 gap-2">
                                        {plantilla.diasSesion.map((dia) => (
                                            <div key={dia.id} className="bg-marino-2 border border-marino-4 rounded-lg p-3">
                                                <div className="text-[0.6rem] text-naranja font-black uppercase mb-2">{dia.diaSemana}</div>
                                                <div className="text-[0.5rem] text-gris mb-2">{dia.focoMuscular || '—'}</div>
                                                <div className="space-y-1">
                                                    {dia.ejercicios.slice(0, 3).map(ej => (
                                                        <div key={ej.id} className="text-[0.5rem] text-blanco truncate">
                                                            {ej.ejercicio?.nombre || ej.nombreLibre || '—'}
                                                        </div>
                                                    ))}
                                                    {dia.ejercicios.length > 3 && (
                                                        <div className="text-[0.5rem] text-gris">+{dia.ejercicios.length - 3} más</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {buscadorOpen && (
                <BuscadorEjercicios
                    onClose={() => setBuscadorOpen(false)}
                    onSelect={handleSelectEjercicio}
                />
            )}
        </div>
    );
}