"use client"
import { useState, useEffect } from 'react';
import { Search, X, Dumbbell, Loader2, Play, Video } from 'lucide-react';
import Image from 'next/image';
import { buscarEjercicios } from '@/nucleo/acciones/ejercicio.accion';
import type { Ejercicio } from '@prisma/client';

interface BuscadorEjerciciosProps {
    onClose: () => void;
    onSelect?: (ejercicio: Ejercicio | { id: string | null, nombreLibre: string }) => void;
}

export default function BuscadorEjercicios({ onClose, onSelect }: BuscadorEjerciciosProps) {
    const [musculoFiltro, setMusculoFiltro] = useState('Todos');
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);
            const resultados = await buscarEjercicios(query, musculoFiltro);
            setResultados(resultados as Ejercicio[]);
            setLoading(false);
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
                        <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-1">Catálogo de Ejercicios</h3>
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

                    <div className="flex flex-wrap gap-2 text-white">
                        {['TODOS', 'PECHO', 'ESPALDA', 'HOMBROS', 'BICEPS', 'TRICEPS', 'CUADRICEPS', 'ISQUIOTIBIALES', 'GLUTEO', 'CORE'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMusculoFiltro(m === 'TODOS' ? 'Todos' : m)}
                                className={`px-4 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest transition-all ${(musculoFiltro === m || (m === 'TODOS' && musculoFiltro === 'Todos'))
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

                    {query && (
                        <div
                            className="flex items-center justify-between p-4 bg-marino-3/50 border border-naranja/40 rounded-xl hover:bg-naranja/10 group transition-all cursor-pointer mb-4"
                            onClick={() => onSelect && onSelect({ id: null, nombreLibre: query })}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-naranja/20 flex items-center justify-center text-naranja">
                                    <span className="font-black text-xl">+</span>
                                </div>
                                <div>
                                    <p className="text-naranja font-black text-[0.9rem] uppercase tracking-tight">Agregar Actividad Libre</p>
                                    <p className="text-[0.65rem] text-gris font-medium tracking-widest">&quot;{query}&quot;</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {resultados.map((ej: Ejercicio) => (
                        <div
                            key={ej.id}
                            className="flex items-center justify-between p-4 bg-marino-3/50 border border-marino-4 rounded-xl hover:border-naranja/40 group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-xl bg-marino-4 flex items-center justify-center text-gris group-hover:text-naranja transition-colors overflow-hidden">
                                    {ej.thumbnailUrl ? (
                                        <Image
                                            src={ej.thumbnailUrl}
                                            alt={ej.nombre}
                                            fill
                                            className="object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <Dumbbell size={24} />
                                    )}
                                    {ej.urlVideo && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-marino/40">
                                            <Play size={16} className="text-blanco fill-blanco" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-blanco font-black text-[0.9rem] uppercase tracking-tight">{ej.nombre}</p>
                                        {ej.urlVideo && <Video size={14} className="text-rojo" />}
                                    </div>
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <span className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">{ej.musculoPrincipal}</span>
                                        {ej.posicionCarga === 'LONGITUD_LARGA' && (
                                            <span className="flex items-center gap-1 bg-naranja/20 text-naranja px-2 py-0.5 rounded text-[0.55rem] font-black uppercase tracking-tighter border border-naranja/30">
                                                🟢 IUSCA: Larga
                                            </span>
                                        )}
                                        {ej.articulacion && (
                                            <span className="text-[0.55rem] text-gris font-bold uppercase tracking-widest leading-none">• {ej.articulacion}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelect && onSelect(ej)}
                                className="bg-marino-4 hover:bg-naranja hover:text-marino text-naranja font-black py-2.5 px-6 rounded-xl text-[0.65rem] uppercase tracking-widest transition-all border border-marino-4 hover:border-naranja shadow-lg"
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
