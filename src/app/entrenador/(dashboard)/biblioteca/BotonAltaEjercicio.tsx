"use client"
import { useState } from "react";
import { Plus, X, Loader2, Video } from "lucide-react";
import { crearEjercicio } from "@/nucleo/acciones/ejercicio.accion";
import {
    GrupoMuscular,
    TipoArticulacion,
    PatronMovimiento
} from "@prisma/client";

export default function BotonAltaEjercicio() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Campos por defecto para compatibilidad con el esquema
        const payload = {
            ...data,
            equipamiento: [], // Corregido: no usar "OTRO" que no existe en el Enum
            lateralidad: "BILATERAL",
            visibleParaClientes: true
        };

        const res = await crearEjercicio(payload);
        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            window.location.reload();
        }
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
                    <div className="relative bg-marino-2 border border-marino-4 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                            <div>
                                <h3 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-1">Cátalogo Maestro</h3>
                                <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Registrar Nuevo Movimiento</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-marino-4 p-3 rounded-2xl text-gris hover:text-blanco transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {error && (
                                <div className="bg-rojo/10 border border-rojo/20 text-rojo p-4 rounded-2xl text-xs font-bold uppercase text-center">
                                    {error}
                                </div>
                            )}

                            {/* Campo: NOMBRE */}
                            <div className="space-y-2">
                                <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Nombre Principal</label>
                                <input
                                    name="nombre"
                                    required
                                    className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:border-naranja/50 outline-none transition-all font-bold placeholder:text-gris/20"
                                    placeholder="Ej: Press de Banca Plano"
                                    autoFocus
                                />
                            </div>

                            {/* Grid: CLASIFICACIÓN */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Grupo Muscular Principal</label>
                                    <select name="musculoPrincipal" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                        {Object.values(GrupoMuscular).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Patrón de Movimiento</label>
                                    <select name="patronMovimiento" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                        {Object.values(PatronMovimiento).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Complejidad Articular</label>
                                    <select name="articulacion" required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                        {Object.values(TipoArticulacion).map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                        <Video size={10} className="text-naranja" /> URL Video (YouTube) Copcional
                                    </label>
                                    <input
                                        name="videoUrl"
                                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs focus:border-naranja/50 outline-none transition-all font-medium placeholder:text-gris/20"
                                        placeholder="https://youtu.be/..."
                                    />
                                </div>
                            </div>

                            {/* Descripción Opcional */}
                            <div className="space-y-2">
                                <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Notas Técnicas Breves (Opcional)</label>
                                <textarea
                                    name="descripcion"
                                    rows={3}
                                    className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco text-sm focus:border-naranja/50 outline-none transition-all font-medium placeholder:text-gris/20 resize-none"
                                    placeholder="Claves para la ejecución..."
                                ></textarea>
                            </div>

                            <div className="sticky bottom-0 pt-6 pb-2 bg-marino-2 flex gap-4 mt-auto">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-6 py-4 bg-marino-4 hover:bg-marino-5 text-blanco font-black rounded-2xl uppercase tracking-widest text-[0.7rem] transition-all border border-marino-5"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-2xl text-[0.7rem] uppercase tracking-[0.2em] shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                                    ) : (
                                        <>Añadir al Arsenal</>
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
