"use client"
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from '@/compartido/hooks/useToast';
import {
    Search,
    Play,
    Dumbbell,
    Filter,
    Grid,
    List,
    Columns,
    X,
    ExternalLink,
    Trash2,
    Copy,
    Info,
    Check,
    Loader2
} from "lucide-react";
import {
    buscarEjercicios,
    duplicarEjercicio,
    archivarEjercicio
} from "@/nucleo/acciones/ejercicio.accion";
import { cargarBibliotecaOficial } from "@/nucleo/acciones/biblioteca.accion";
import { purgarTodaLaBiblioteca } from "@/nucleo/acciones/purgar.accion";
import Image from 'next/image';
import {
    GrupoMuscular,
    TipoEquipamiento,
    PatronMovimiento,
    TipoArticulacion,
    PosicionCarga,
    Lateralidad,
    OrigenEjercicio,
    NivelTecnico
} from "@prisma/client";
import { useRouter } from "next/navigation";
import ModalEditarEjercicio from "./ModalEditarEjercicio";
import { FILTRO_TODOS } from "@/nucleo/constantes/enums";

// Definición extendida para la UI
interface Ejercicio {
    id: string;
    nombre: string;
    musculoPrincipal: GrupoMuscular;
    musculosSecundarios: GrupoMuscular[];
    patron: PatronMovimiento;
    articulacion: TipoArticulacion;
    equipamiento: TipoEquipamiento[];
    lateralidad: Lateralidad;
    posicionCarga: PosicionCarga;
    nivelTecnico: NivelTecnico;
    descripcion?: string | null;
    urlVideo?: string | null;
    thumbnailUrl?: string | null;
    origen: OrigenEjercicio;
    visibleParaClientes: boolean;
}

type ViewMode = 'grid' | 'list' | 'muscle';

export default function BibliotecaEjercicios({ iniciales }: { iniciales: Ejercicio[] }) {
    const router = useRouter();
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>(iniciales);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filtros activos
    const [filtroMusculo, setFiltroMusculo] = useState<string>(FILTRO_TODOS);
    const [filtroEquipamiento, setFiltroEquipamiento] = useState<string>(FILTRO_TODOS);
    const [filtroPatron, setFiltroPatron] = useState<string>(FILTRO_TODOS);

    // Ejercicio seleccionado para modal de detalle
    const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null);
    const [editingEjercicio, setEditingEjercicio] = useState<Ejercicio | null>(null);

    // Filtrado local combinado
    const ejerciciosFiltrados = useMemo(() => {
        return ejercicios.filter(ej => {
            const matchQuery = ej.nombre.toLowerCase().includes(query.toLowerCase());
            const matchMusculo = filtroMusculo === FILTRO_TODOS || ej.musculoPrincipal === filtroMusculo;
            const matchEquipo = filtroEquipamiento === FILTRO_TODOS || ej.equipamiento.includes(filtroEquipamiento as TipoEquipamiento);
            const matchPatron = filtroPatron === FILTRO_TODOS || ej.patron === filtroPatron;

            return matchQuery && matchMusculo && matchEquipo && matchPatron;
        });
    }, [ejercicios, query, filtroMusculo, filtroEquipamiento, filtroPatron]);

    // Búsqueda en servidor con debounce
    useEffect(() => {
        if (query.trim() === "") {
            setEjercicios(iniciales);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const results = await buscarEjercicios(query);
            setEjercicios(results as Ejercicio[]);
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, iniciales]);

    const handleDuplicar = async (id: string) => {
        if (!confirm("¿Duplicar este ejercicio?")) return;
        const res = await duplicarEjercicio(id);
        if (res.exito) {
            router.refresh();
            const nuevos = await buscarEjercicios("");
            setEjercicios(nuevos as Ejercicio[]);
        }
    };

    const handleArchivar = async (id: string) => {
        if (!confirm("¿Archivar este ejercicio? Dejará de aparecer en las búsquedas.")) return;
        const res = await archivarEjercicio(id);
        if (res.exito) {
            setEjercicios(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleCargarOficial = async () => {
        if (!confirm("Se cargarán los ejercicios base de IL-Coaching. ¿Continuar?")) return;
        setLoading(true);
        const res = await cargarBibliotecaOficial();
        if (res.exito) {
            toast.exito(`Se cargaron ${res.creados} ejercicios nuevos.`);
            const nuevos = await buscarEjercicios("");
            setEjercicios(nuevos as Ejercicio[]);
        } else {
            toast.error(res.error || "Error al cargar biblioteca oficial");
        }
        setLoading(false);
    };

    const handlePurgar = async () => {
        if (!confirm("Esto eliminará TODOS los ejercicios de tu biblioteca (oficiales y personalizados). ¿Estás seguro?")) return;
        setLoading(true);
        const res = await purgarTodaLaBiblioteca();
        if (res.success) {
            toast.exito(`Se eliminaron ${res.eliminados} ejercicios.`);
            setEjercicios([]);
            router.refresh();
        } else {
            toast.error(res.error || "Error al purgar biblioteca");
        }
        setLoading(false);
    };

    const extractYouTubeId = useCallback((url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }, []);

    return (
        <div className="space-y-6">
            {/* Barra de Herramientas Principal */}
            <div className="bg-marino-2 border border-marino-4 p-4 rounded-2xl shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Buscador */}
                    <div className="flex-1 relative group">
                        <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-naranja animate-pulse' : 'text-gris group-focus-within:text-naranja'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por movimiento o técnica..."
                            className="w-full bg-marino-3 border border-marino-4 focus:border-naranja/50 rounded-xl py-3 pl-12 pr-4 text-sm text-blanco transition-all focus:outline-none placeholder:text-gris/40 font-medium"
                        />
                    </div>

                    {/* Botones de Control */}
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-1 md:flex-none px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${showFilters ? 'bg-naranja text-marino border-naranja' : 'bg-marino-3 border-marino-4 text-gris hover:text-blanco'
                                }`}
                        >
                            <Filter size={16} /> <span className="hidden sm:inline">Filtros</span> {showFilters ? '✓' : ''}
                        </button>

                        <button
                            onClick={handleCargarOficial}
                            disabled={loading}
                            className="flex-1 md:flex-none px-4 py-3 rounded-xl border bg-marino-3 border-marino-4 text-gris hover:text-naranja transition-all flex items-center justify-center gap-2 text-[0.6rem] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Dumbbell size={16} />}
                            <span className="hidden sm:inline">Biblioteca IL</span>
                            <span className="sm:hidden">IL</span>
                        </button>

                        <button
                            onClick={handlePurgar}
                            disabled={loading}
                            className="flex-1 md:flex-none px-4 py-3 rounded-xl border bg-marino-3 border-marino-4 text-gris hover:text-rojo transition-all flex items-center justify-center gap-2 text-[0.6rem] font-black uppercase tracking-widest disabled:opacity-50"
                            title="Eliminar ejercicios pre-cargados"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>

                        <div className="bg-marino-3 border border-marino-4 rounded-xl p-1 flex gap-1 w-full md:w-auto justify-around sm:justify-start">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex-1 md:flex-none p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-naranja text-marino shadow-lg' : 'text-gris hover:text-blanco'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 md:flex-none p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-naranja text-marino shadow-lg' : 'text-gris hover:text-blanco'}`}
                            >
                                <List size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('muscle')}
                                className={`flex-1 md:flex-none p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'muscle' ? 'bg-naranja text-marino shadow-lg' : 'text-gris hover:text-blanco'}`}
                            >
                                <Columns size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dropdown de Filtros Expandible */}
                {showFilters && (
                    <div className="pt-4 border-t border-marino-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-2 block">Grupo Muscular</label>
                            <select
                                value={filtroMusculo}
                                onChange={(e) => setFiltroMusculo(e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco focus:outline-none"
                            >
                                <option value="TODOS">Todos los músculos</option>
                                {Object.values(GrupoMuscular).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-2 block">Equipamiento</label>
                            <select
                                value={filtroEquipamiento}
                                onChange={(e) => setFiltroEquipamiento(e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco focus:outline-none"
                            >
                                <option value="TODOS">Cualquier equipo</option>
                                {Object.values(TipoEquipamiento).map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-2 block">Patrón</label>
                            <select
                                value={filtroPatron}
                                onChange={(e) => setFiltroPatron(e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco focus:outline-none"
                            >
                                <option value="TODOS">Cualquier patrón</option>
                                {Object.values(PatronMovimiento).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end pb-0.5">
                            <button
                                onClick={() => {
                                    setFiltroMusculo(FILTRO_TODOS);
                                    setFiltroEquipamiento(FILTRO_TODOS);
                                    setFiltroPatron(FILTRO_TODOS);
                                    setQuery("");
                                }}
                                className="text-[0.6rem] font-black text-gris hover:text-rojo uppercase tracking-widest transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Contador de Resultados */}
            <div className="flex items-center justify-between px-2">
                <span className="text-[0.65rem] font-bold text-gris uppercase tracking-[0.2em]">
                    Mostrando <span className="text-blanco">{ejerciciosFiltrados.length}</span> ejercicios encontrados
                </span>
            </div>

            {/* VISTAS */}
            {loading && ejercicios.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="text-naranja animate-spin mb-4" />
                    <p className="text-gris text-xs uppercase tracking-widest font-bold">Consultando Arsenal...</p>
                </div>
            ) : ejerciciosFiltrados.length === 0 ? (
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                    <Dumbbell size={48} className="text-marino-4 mb-4" />
                    <p className="text-gris italic text-sm">No se encontraron ejercicios con estos criterios.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* VISTA GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ejerciciosFiltrados.map((ej) => (
                        <div
                            key={ej.id}
                            onClick={() => setSelectedEjercicio(ej)}
                            className="group relative bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden hover:border-naranja/50 transition-all duration-300 cursor-pointer flex flex-col shadow-xl"
                        >
                            {/* Thumbnail Area */}
                            <div className="aspect-video bg-marino-3 relative overflow-hidden">
                                {ej.thumbnailUrl ? (
                                    <Image
                                        src={ej.thumbnailUrl}
                                        alt={ej.nombre}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-90"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-marino-4">
                                        <Play size={40} className="opacity-20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-marino-2 via-transparent to-transparent opacity-80"></div>

                                {/* Badges Flotantes */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 scale-90 origin-top-right">
                                    {ej.posicionCarga === 'LONGITUD_LARGA' && (
                                        <div className="bg-naranja text-marino px-2 py-0.5 rounded font-black text-[0.55rem] uppercase tracking-tighter flex items-center gap-1">
                                            <Check size={8} /> IUSCA ⭐
                                        </div>
                                    )}
                                    {ej.origen === 'PERSONALIZADO' && (
                                        <div className="bg-marino-4 text-blanco px-2 py-0.5 rounded font-black text-[0.55rem] uppercase tracking-tighter border border-white/10">
                                            DUEÑO
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-4 flex-1 flex flex-col">
                                <span className="text-[0.6rem] font-black text-naranja/80 uppercase tracking-widest mb-1 block">
                                    {(ej.patron as string).replace(/_/g, ' ')}
                                </span>
                                <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tight leading-tight mb-3 group-hover:text-naranja transition-colors">
                                    {ej.nombre}
                                </h3>

                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    <span className="px-2 py-0.5 bg-marino-3 border border-marino-4 rounded text-[0.55rem] font-black text-gris-claro uppercase tracking-tighter">
                                        {ej.musculoPrincipal}
                                    </span>
                                    {ej.equipamiento.slice(0, 2).map((eq, i) => (
                                        <span key={`${ej.id}-eq-${i}`} className="px-2 py-0.5 bg-marino-4 border border-marino-4 rounded text-[0.55rem] font-medium text-gris uppercase tracking-tighter">
                                            {eq}
                                        </span>
                                    ))}
                                    {ej.equipamiento.length > 2 && <span className="text-[0.5rem] text-gris self-center">+{ej.equipamiento.length - 2}</span>}
                                </div>
                            </div>

                            {/* Hover Actions Bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-naranja flex items-center justify-around translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-2">
                                <button className="text-marino font-black text-[0.6rem] uppercase tracking-widest flex items-center gap-2 hover:scale-110 transition-transform">
                                    <Dumbbell size={12} /> Detalle
                                </button>
                                <div className="w-[1px] h-3 bg-marino/20"></div>
                                <button onClick={(e) => { e.stopPropagation(); handleDuplicar(ej.id); }} className="text-marino font-black text-[0.6rem] uppercase tracking-widest flex items-center gap-2 hover:scale-110 transition-transform">
                                    <Copy size={12} /> Clonar
                                </button>
                                <div className="w-[1px] h-3 bg-marino/20"></div>
                                <button onClick={(e) => { e.stopPropagation(); handleArchivar(ej.id); }} className="text-marino font-black text-[0.6rem] uppercase tracking-widest flex items-center gap-2 hover:scale-110 transition-transform">
                                    <Trash2 size={12} /> Ocultar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : viewMode === 'list' ? (
                /* VISTA LISTA */
                <div className="bg-marino-2 border border-marino-4 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-marino-3 border-b border-marino-4">
                                <th className="p-4 font-black uppercase text-naranja tracking-widest">Ejercicio</th>
                                <th className="p-4 font-black uppercase text-gris tracking-widest">Músculo</th>
                                <th className="p-4 font-black uppercase text-gris tracking-widest">Equipo</th>
                                <th className="p-4 font-black uppercase text-gris tracking-widest">Lateralidad</th>
                                <th className="p-4 font-black uppercase text-gris tracking-widest">Posición</th>
                                <th className="p-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {ejerciciosFiltrados.map(ej => (
                                <tr key={ej.id} onClick={() => setSelectedEjercicio(ej)} className="hover:bg-marino-3 transition-colors cursor-pointer group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {ej.urlVideo && <div className="w-2 h-2 rounded-full bg-naranja animate-pulse"></div>}
                                            <span className="font-bold text-blanco group-hover:text-naranja transition-all">{ej.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gris-claro font-medium">{ej.musculoPrincipal}</td>
                                    <td className="p-4 text-gris font-medium uppercase">{ej.equipamiento.join(', ')}</td>
                                    <td className="p-4 text-gris font-medium">{ej.lateralidad}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[0.5rem] font-black uppercase tracking-widest ${ej.posicionCarga === 'LONGITUD_LARGA' ? 'bg-naranja/10 text-naranja border border-naranja/20' : 'bg-marino-4 text-gris border border-marino-5'
                                            }`}>
                                            {ej.posicionCarga.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleDuplicar(ej.id); }} className="p-2 bg-marino-4 rounded-lg text-gris hover:text-naranja"><Copy size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleArchivar(ej.id); }} className="p-2 bg-marino-4 rounded-lg text-gris hover:text-rojo"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* VISTA AGRUPADA POR MÚSCULO */
                <div className="space-y-12">
                    {Object.values(GrupoMuscular).map(musculo => {
                        const exs = ejerciciosFiltrados.filter(e => e.musculoPrincipal === musculo);
                        if (exs.length === 0) return null;
                        return (
                            <div key={`group-${musculo}`} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco flex items-center gap-3">
                                        {musculo}
                                        <span className="text-sm font-bold text-naranja bg-naranja/10 px-2 py-1 rounded-lg tabular-nums">{exs.length}</span>
                                    </h2>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-marino-4 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {exs.map(ej => (
                                        <div
                                            key={`muscle-item-${ej.id}`}
                                            onClick={() => setSelectedEjercicio(ej)}
                                            className="bg-marino-3/50 border border-marino-4 p-4 rounded-2xl hover:border-naranja/40 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[0.6rem] font-black text-naranja uppercase tracking-tighter">{ej.patron.replace(/_/g, ' ')}</span>
                                                {ej.urlVideo && <Play size={10} className="text-red-500" fill="currentColor" />}
                                            </div>
                                            <p className="font-bold text-blanco text-sm leading-tight mb-2 group-hover:text-naranja transition-colors">{ej.nombre}</p>
                                            <p className="text-[0.6rem] text-gris font-medium uppercase">{ej.equipamiento[0]} · {ej.posicionCarga}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* MODAL DE DETALLE */}
            {selectedEjercicio && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-marino/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedEjercicio(null)}></div>
                    <div className="relative bg-marino-2 border border-marino-4 rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-naranja/10 rounded-2xl">
                                    <Dumbbell className="text-naranja" size={24} />
                                </div>
                                <div className="max-w-[calc(100%-100px)]">
                                    <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco leading-none mb-1 truncate">{selectedEjercicio.nombre}</h3>
                                    <span className="text-xs font-bold text-naranja uppercase tracking-widest">{selectedEjercicio.musculoPrincipal} · {selectedEjercicio.patron}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEjercicio(null)} className="p-3 bg-marino-4 hover:bg-marino-5 text-gris hover:text-blanco rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido Modal */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 scrollbar-hide">
                            {/* Columna Izquierda: Video */}
                            <div className="space-y-6">
                                <div className="aspect-video rounded-3xl overflow-hidden bg-black border-4 border-marino-4 shadow-inner relative group">
                                    {selectedEjercicio.urlVideo ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${extractYouTubeId(selectedEjercicio.urlVideo)}`}
                                            className="w-full h-full"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gris/20 p-10 text-center">
                                            <Play size={64} className="mb-4" />
                                            <p className="font-black uppercase tracking-widest text-xs">Sin video disponible</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-marino-3/50 p-6 rounded-3xl border border-marino-4">
                                    <h4 className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Info size={14} /> Ficha Técnica
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                        <div className="space-y-1">
                                            <p className="text-[0.55rem] font-bold text-gris uppercase">Articulación</p>
                                            <p className="text-xs font-black text-blanco uppercase tracking-tight">{selectedEjercicio.articulacion}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[0.55rem] font-bold text-gris uppercase">Posición Carga</p>
                                            <p className="text-xs font-black text-naranja uppercase tracking-tight">{selectedEjercicio.posicionCarga}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[0.55rem] font-bold text-gris uppercase">Lateralidad</p>
                                            <p className="text-xs font-black text-blanco uppercase tracking-tight">{selectedEjercicio.lateralidad}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[0.55rem] font-bold text-gris uppercase">Equipamiento</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(selectedEjercicio.equipamiento || []).map(eq => (
                                                    <span key={`${selectedEjercicio.id}-modal-eq-${eq}`} className="px-2 py-0.5 bg-marino-4 rounded text-[0.6rem] font-medium text-gris uppercase">{eq}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Texto */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="text-[0.7rem] font-black text-blanco uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-6 h-[2px] bg-naranja"></div> Ejecución Técnica
                                    </h4>
                                    <p className="text-sm font-medium text-gris-claro leading-relaxed whitespace-pre-wrap italic">
                                        {selectedEjercicio.descripcion || "No hay instrucciones detalladas para este ejercicio. Seguí el video adjunto para la técnica correcta."}
                                    </p>
                                </div>

                                <div className="bg-rojo/5 border border-rojo/20 p-6 rounded-3xl space-y-4">
                                    <h4 className="text-[0.7rem] font-black text-rojo uppercase tracking-[0.3em] flex items-center gap-3">
                                        <X size={14} /> Errores Comunes
                                    </h4>
                                    <p className="text-sm font-medium text-gris leading-relaxed italic">
                                        Mantené el control en todo momento. Evitá el uso de inercia y asegurá el rango completo de movimiento especificado por los pilares de IL-COACHING.
                                    </p>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        onClick={() => {
                                            setEditingEjercicio(selectedEjercicio);
                                            setSelectedEjercicio(null);
                                        }}
                                        className="flex-1 py-4 bg-naranja hover:bg-naranja-h transition-all text-marino font-black rounded-2xl text-[0.7rem] uppercase tracking-widest shadow-xl shadow-naranja/20 flex items-center justify-center gap-2"
                                    >
                                        Editar Ejercicio
                                    </button>
                                    <button
                                        onClick={() => window.open(selectedEjercicio.urlVideo || "#", "_blank")}
                                        className="px-6 py-4 bg-marino-4 hover:bg-marino-5 text-blanco font-black rounded-2xl uppercase tracking-widest text-[0.7rem] transition-all border border-marino-5"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingEjercicio && (
                <ModalEditarEjercicio
                    ejercicio={editingEjercicio}
                    onClose={() => setEditingEjercicio(null)}
                />
            )}
        </div>
    );
}
