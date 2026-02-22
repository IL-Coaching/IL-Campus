"use client"
import { useState, useEffect } from "react";
import { Search, Play, FileText, Dumbbell, Filter } from "lucide-react";
import { buscarEjercicios } from "@/nucleo/acciones/ejercicio.accion";

interface Ejercicio {
    id: string;
    nombre: string;
    patronMovimiento?: string | null;
    grupoMuscular: string;
    equipoNecesario?: string | null;
    analisisBiomecanico?: string | null;
    videoUrl?: string | null;
}

export default function BibliotecaEjercicios({ iniciales }: { iniciales: Ejercicio[] }) {
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>(iniciales);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim() === "") {
                setEjercicios(iniciales);
                return;
            }
            setLoading(true);
            const results = await buscarEjercicios(query);
            setEjercicios(results);
            setLoading(false);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, iniciales]);

    return (
        <div className="space-y-6">
            {/* Buscador y Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 bg-marino-2 border border-marino-4 p-1.5 rounded-xl flex items-center gap-3 shadow-inner">
                    <div className="bg-marino border border-marino-4 p-2.5 rounded-lg">
                        <Search size={18} className={loading ? "animate-pulse text-naranja" : "text-gris"} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por movimiento, músculo o patrón (ej. Bisagra)..."
                        className="bg-transparent border-none text-blanco text-sm focus:outline-none w-full placeholder:text-gris/50 font-medium"
                    />
                </div>
                <div className="md:col-span-4 flex gap-2">
                    <button className="flex-1 bg-marino-2 border border-marino-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gris hover:text-blanco hover:border-marino-3 transition-all">
                        <Filter size={14} /> Filtros
                    </button>
                    <button className="p-3 bg-marino-2 border border-marino-4 rounded-xl text-gris hover:text-naranja transition-all">
                        <Dumbbell size={18} />
                    </button>
                </div>
            </div>

            {/* Listado / Grid */}
            {ejercicios.length === 0 ? (
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-marino-3 rounded-full flex items-center justify-center mb-6 border border-marino-4">
                        <Dumbbell size={32} className="text-gris opacity-50" />
                    </div>
                    <h3 className="text-lg font-barlow-condensed font-bold text-blanco uppercase tracking-widest mb-1 italic opacity-70">Sin coincidencias</h3>
                    <p className="text-gris max-w-xs text-xs">No encontramos ejercicios que coincidan con tu búsqueda en la biblioteca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ejercicios.map((ejercicio) => (
                        <div
                            key={ejercicio.id}
                            className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden hover:border-naranja/40 transition-all group flex flex-col shadow-lg shadow-marino/50"
                        >
                            {/* Header Ejercicio */}
                            <div className="p-5 flex-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-naranja/80 mb-1 block">
                                    {ejercicio.patronMovimiento || "Movimiento General"}
                                </span>
                                <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tight leading-tight mb-2 group-hover:text-naranja transition-colors">
                                    {ejercicio.nombre}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    <span className="px-2 py-0.5 bg-marino-3 border border-marino-4 rounded text-[10px] font-bold text-gris-claro uppercase">
                                        {ejercicio.grupoMuscular}
                                    </span>
                                    {ejercicio.equipoNecesario && (
                                        <span className="px-2 py-0.5 bg-marino-4 border border-marino-4 rounded text-[10px] font-medium text-gris uppercase">
                                            {ejercicio.equipoNecesario}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gris line-clamp-2 italic leading-relaxed">
                                    {ejercicio.analisisBiomecanico || "Sin descripción técnica disponible."}
                                </p>
                            </div>

                            {/* Footer Acciones */}
                            <div className="bg-marino-3/50 p-4 border-t border-marino-4 flex items-center justify-between gap-3">
                                <a
                                    href={ejercicio.videoUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-marino-4 hover:bg-red-600/10 hover:text-red-500 border border-marino-4 hover:border-red-600/30 text-gris-claro p-2.5 rounded-lg flex items-center justify-center gap-2 transition-all group/btn"
                                >
                                    <div className="bg-red-600 rounded-full p-1 group-hover/btn:scale-110 transition-transform shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                                        <Play size={10} fill="white" stroke="white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Video Técnica</span>
                                </a>
                                <button className="p-2.5 bg-marino-4 border border-marino-4 rounded-lg text-gris hover:text-blanco transition-all">
                                    <FileText size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
