"use client"
import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { crearEjercicio } from "@/nucleo/acciones/ejercicio.accion";
import {
    GrupoMuscular,
    TipoArticulacion,
    PatronMovimiento,
    TipoEquipamiento,
    Lateralidad,
    PosicionCarga,
    NivelTecnico
} from "@prisma/client";

export default function BotonAltaEjercicio() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para campos dinámicos (arrays)
    const [equipamiento, setEquipamiento] = useState<TipoEquipamiento[]>([]);
    const [musculosSecundarios] = useState<GrupoMuscular[]>([]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const baseData = Object.fromEntries(formData.entries());

        // Construir objeto final
        const data = {
            ...baseData,
            equipamiento,
            musculosSecundarios,
            visibleParaClientes: true
        };

        const res = await crearEjercicio(data);
        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            window.location.reload();
        }
    };

    const toggleEquipamiento = (val: TipoEquipamiento) => {
        setEquipamiento(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-naranja hover:bg-naranja-h transition-all text-marino font-black px-6 py-2.5 rounded-lg uppercase tracking-widest font-barlow-condensed text-sm flex items-center gap-2 shadow-lg shadow-naranja/20"
            >
                <Plus size={18} /> Nuevo Ejercicio
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-marino/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsOpen(false)}></div>
                    <div className="relative bg-marino-2 border border-marino-4 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                            <div>
                                <h3 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-1">Cátalogo Maestro</h3>
                                <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Registrar Nuevo Movimiento Biomecánico</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-marino-4 p-3 rounded-2xl text-gris hover:text-blanco transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {error && (
                                <div className="bg-rojo/10 border border-rojo/20 text-rojo p-4 rounded-2xl text-xs font-bold uppercase text-center">
                                    {error}
                                </div>
                            )}

                            {/* SECCIÓN 1: IDENTIDAD */}
                            <div className="space-y-6">
                                <h4 className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-naranja"></div> Identidad del Movimiento
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Nombre Principal</label>
                                        <input
                                            name="nombre"
                                            required
                                            className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:border-naranja/50 outline-none transition-all font-bold placeholder:text-gris/20"
                                            placeholder="Ej: Curl Femoral Sentado"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">URL Video (YouTube)</label>
                                        <input
                                            name="videoUrl"
                                            className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco text-sm focus:border-naranja/50 outline-none transition-all font-medium placeholder:text-gris/20"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: CLASIFICACIÓN BIOMECÁNICA */}
                            <div className="space-y-6">
                                <h4 className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-naranja"></div> Clasificación Biomecánica
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Músculo Principal</label>
                                        <select name="musculoPrincipal" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                            {Object.values(GrupoMuscular).map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Articulación</label>
                                        <select name="articulacion" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                            {Object.values(TipoArticulacion).map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Patrón</label>
                                        <select name="patronMovimiento" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                            {Object.values(PatronMovimiento).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest text-naranja">Posición Carga (IUSCA)</label>
                                        <select name="posicionCarga" className="w-full bg-naranja/5 border border-naranja/20 rounded-xl px-4 py-3 text-naranja text-xs font-black focus:border-naranja outline-none appearance-none cursor-pointer">
                                            {Object.values(PosicionCarga).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: CONFIGURACIÓN TÉCNICA */}
                            <div className="space-y-6">
                                <h4 className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-naranja"></div> Configuración Técnica
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Equipamiento Multi-select chips */}
                                    <div className="space-y-4">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest flex justify-between">
                                            Equipamiento Requerido
                                            <span className="text-naranja">{equipamiento.length} seleccionados</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.values(TipoEquipamiento).map(eq => (
                                                <button
                                                    key={eq}
                                                    type="button"
                                                    onClick={() => toggleEquipamiento(eq)}
                                                    className={`px-3 py-1.5 rounded-lg text-[0.6rem] font-bold uppercase transition-all border ${equipamiento.includes(eq)
                                                        ? 'bg-naranja border-naranja text-marino'
                                                        : 'bg-marino-3 border-marino-4 text-gris hover:border-gris-claro'
                                                        }`}
                                                >
                                                    {eq}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Lateralidad</label>
                                                <select name="lateralidad" className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold outline-none appearance-none cursor-pointer">
                                                    {Object.values(Lateralidad).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Nivel Técnico</label>
                                                <select name="nivelTecnico" className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold outline-none appearance-none cursor-pointer">
                                                    {Object.values(NivelTecnico).map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 4: CONTENIDO TÉCNICO */}
                            <div className="space-y-6">
                                <h4 className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-naranja"></div> Tutorial y Ejecución
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Descripción / Puntos Clave</label>
                                        <textarea
                                            name="descripcion"
                                            rows={4}
                                            className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco text-sm focus:border-naranja/50 outline-none transition-all font-medium placeholder:text-gris/20 resize-none tabular-nums"
                                            placeholder="Detalla la ejecución paso a paso..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 pt-6 pb-2 bg-marino-2 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-6 py-4 bg-marino-4 hover:bg-marino-5 text-blanco font-black rounded-2xl uppercase tracking-widest text-[0.7rem] transition-all border border-marino-5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-2xl text-[0.7rem] uppercase tracking-[0.2em] shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Registrando Movimiento...</>
                                    ) : (
                                        <>Guardar en Arsenal Técnico</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
