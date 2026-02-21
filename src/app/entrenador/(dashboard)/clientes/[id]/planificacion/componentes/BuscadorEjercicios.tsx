"use client"
import { useState, useEffect } from 'react';
import { Search, X, Dumbbell, Loader2 } from 'lucide-react';
import { buscarEjerciciosCatalogo } from '@/nucleo/acciones/ejercicio.accion';
import type { Ejercicio } from '@prisma/client';

interface BuscadorEjerciciosProps {
    onClose: () => void;
    onSelect?: (ejercicio: Ejercicio) => void;
}

export default function BuscadorEjercicios({ onClose, onSelect }: BuscadorEjerciciosProps) {
    const [musculoFiltro, setMusculoFiltro] = useState('Todos');
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 1 || musculoFiltro !== 'Todos') {
                setLoading(true);
                const busqueda = query === '' && musculoFiltro !== 'Todos' ? musculoFiltro : query;
                const res = await buscarEjerciciosCatalogo(busqueda);
                if (res.exito) {
                    setResultados(res.resultados);
                }
                setLoading(false);
            } else {
                setResultados([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, musculoFiltro]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-1">Cátalogo de Ejercicios</h3>
                        <p className="text-xs text-gris font-bold tracking-widest uppercase italic font-barlow">Busca en tu biblioteca personal de IL-Coaching</p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-6 space-y-6">
                    <div className="relative">
                        {loading ? (
                            <Loader2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-naranja animate-spin" />
                        ) : (
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gris" />
                        )}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ej: Sentadilla, Prensa, Cuádriceps..."
                            className="w-full bg-marino-3 border border-marino-4 rounded-xl py-4 pl-12 pr-4 text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['Todos', 'Pectoral', 'Espalda', 'Hombro', 'Brazo', 'Cuádriceps', 'Isquios', 'Glúteo', 'Core'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMusculoFiltro(m)}
                                className={`px-4 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest transition-all ${musculoFiltro === m
                                    ? 'bg-naranja text-marino shadow-lg shadow-naranja/20'
                                    : 'bg-marino-3 border border-marino-4 text-gris hover:text-blanco hover:border-gris'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Results */}
                <div className="max-h-[400px] min-h-[100px] overflow-y-auto px-6 pb-6 space-y-2">
                    {resultados.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Dumbbell size={32} className="mx-auto text-marino-4 mb-3" />
                            <p className="text-gris italic text-sm">Empieza a escribir para buscar ejercicios...</p>
                        </div>
                    )}

                    {resultados.map((ej) => (
                        <div
                            key={ej.id}
                            className="flex items-center justify-between p-4 bg-marino-3/50 border border-marino-4 rounded-xl hover:border-naranja/40 group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-marino-4 flex items-center justify-center text-gris group-hover:text-naranja transition-colors">
                                    <Dumbbell size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-blanco font-bold leading-none mb-1">{ej.nombre}</p>
                                    <div className="flex gap-2">
                                        <span className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">{ej.grupoMuscular}</span>
                                        {ej.equipoNecesario && (
                                            <span className="text-[0.6rem] text-[#60A5FA] font-black uppercase tracking-widest leading-none">• {ej.equipoNecesario}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelect && onSelect(ej)}
                                className="bg-marino-4 hover:bg-naranja hover:text-marino text-naranja font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest transition-all"
                            >
                                + Agregar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
