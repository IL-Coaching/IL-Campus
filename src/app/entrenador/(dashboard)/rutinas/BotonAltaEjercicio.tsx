"use client"
import { useState } from "react";
import { Plus, X, Loader2, Dumbbell, Activity, Video } from "lucide-react";
import { crearEjercicio } from "@/nucleo/acciones/ejercicio.accion";

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

        const res = await crearEjercicio(data);
        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            window.location.reload(); // Recargar para ver el nuevo ejercicio
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-marino/80 backdrop-blur-md">
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                            <div>
                                <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-1">Cátalogo Maestro</h3>
                                <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Registrar Nuevo Movimiento</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gris hover:text-blanco transition-colors p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="bg-rojo/10 border border-rojo/20 text-rojo p-3 rounded-lg text-xs font-bold uppercase text-center">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                        <Dumbbell size={12} className="text-naranja" /> Nombre del Ejercicio
                                    </label>
                                    <input
                                        name="nombre"
                                        required
                                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                                        placeholder="Ej: Sentadilla Hack"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-naranja" /> Grupo Muscular
                                    </label>
                                    <select
                                        name="grupoMuscular"
                                        required
                                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold appearance-none"
                                    >
                                        <option value="Pectoral">Pectoral</option>
                                        <option value="Espalda">Espalda</option>
                                        <option value="Hombro">Hombro</option>
                                        <option value="Bíceps">Bíceps</option>
                                        <option value="Tríceps">Tríceps</option>
                                        <option value="Cuádriceps">Cuádriceps</option>
                                        <option value="Isquios">Isquios</option>
                                        <option value="Glúteo">Glúteo</option>
                                        <option value="Core">Core</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block">Patrón de Movimiento</label>
                                    <input
                                        name="patronMovimiento"
                                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all"
                                        placeholder="Ej: Empuje Vertical"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block">Equipo Necesario</label>
                                    <input
                                        name="equipoNecesario"
                                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all"
                                        placeholder="Ej: Barra, Mancuerna"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                    <Video size={12} className="text-naranja" /> URL Tutorial (YouTube / Drive)
                                </label>
                                <input
                                    name="videoUrl"
                                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                                ) : (
                                    <>Guardar en Biblioteca</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
