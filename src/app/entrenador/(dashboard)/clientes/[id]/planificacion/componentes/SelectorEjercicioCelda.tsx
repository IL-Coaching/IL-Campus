"use client"
import { useState, useEffect, useRef } from 'react';
import { Dumbbell, Video, Check } from 'lucide-react';
import { buscarEjercicios } from '@/nucleo/acciones/ejercicio.accion';
import { Ejercicio } from '@prisma/client';

interface SelectorEjercicioCeldaProps {
    initialValue: string;
    ejercicioId?: string | null;
    esBiblioteca: boolean;
    onSelect: (data: { nombre: string; ejercicioId: string | null; esBiblioteca: boolean }) => void;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function SelectorEjercicioCelda({
    initialValue,
    ejercicioId,
    esBiblioteca,
    onSelect,
    onOpenChange
}: SelectorEjercicioCeldaProps) {
    const [inputValue, setInputValue] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const [resultados, setResultados] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Notificar al padre cuando cambia el estado de apertura
    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    // Búsqueda con debounce
    useEffect(() => {
        if (!isOpen || inputValue.length < 2) {
            setResultados([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const res = await buscarEjercicios(inputValue);
            setResultados((res as Ejercicio[]) || []);
            setLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [inputValue, isOpen]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Si cerramos sin seleccionar, notificamos el valor actual como texto libre
                if (inputValue !== initialValue) {
                    onSelect({ nombre: inputValue, ejercicioId: null, esBiblioteca: false });
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [inputValue, initialValue, onSelect]);

    const handleSelectResult = (ej: Ejercicio) => {
        setInputValue(ej.nombre);
        setIsOpen(false);
        onSelect({
            nombre: ej.nombre,
            ejercicioId: ej.id,
            esBiblioteca: true
        });
    };

    return (
        <div className="relative w-full group" ref={containerRef}>
            <div className="flex flex-col">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setIsOpen(false);
                            onSelect({ nombre: inputValue, ejercicioId: null, esBiblioteca: false });
                        }
                    }}
                    className="w-full bg-marino border border-white/5 rounded-lg px-2 py-2 text-blanco font-black text-sm uppercase tracking-tight focus:ring-1 focus:ring-naranja/50 focus:border-naranja/50 focus:bg-marino-3 placeholder:text-gris/20 group-hover:text-naranja transition-all shadow-inner"
                    placeholder="Escribir..."
                />

                {esBiblioteca && ejercicioId && (
                    <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
                        <span className="text-[0.5rem] text-naranja font-black uppercase tracking-tight flex items-center gap-1">
                            <Check size={9} strokeWidth={3} /> Biblioteca
                        </span>
                    </div>
                )}
            </div>

            {/* Dropdown de Autocompletado */}
            {isOpen && (inputValue.length >= 2 || loading) && (
                <div className="absolute top-full left-0 w-80 mt-1 bg-marino-2 border border-marino-4 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                        <span className="text-[0.6rem] font-black text-gris uppercase tracking-widest px-2">Sugerencias del Arsenal</span>
                        {loading && <div className="w-3 h-3 border-2 border-naranja border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {resultados.length === 0 && !loading ? (
                            <div className="p-4 text-center">
                                <p className="text-[0.65rem] text-gris italic">No se encontraron coincidencias exactas.</p>
                                <p className="text-[0.55rem] text-naranja font-bold uppercase mt-1">Se guardará como &quot;Texto Libre&quot;</p>
                            </div>
                        ) : (
                            resultados.map((ej) => (
                                <button
                                    key={ej.id}
                                    onClick={() => handleSelectResult(ej)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-marino-3 text-left border-b border-marino-4/50 last:border-0 transition-colors group/item"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-marino-4 flex items-center justify-center text-gris group-hover/item:text-naranja transition-colors shrink-0">
                                        <Dumbbell size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.75rem] font-black text-blanco uppercase truncate group-hover/item:text-naranja">{ej.nombre}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[0.55rem] text-naranja font-black uppercase tracking-tighter">{ej.musculoPrincipal}</span>
                                            {ej.posicionCarga === 'LONGITUD_LARGA' && (
                                                <span className="text-[0.5rem] bg-naranja/10 text-naranja px-1 rounded font-black uppercase">IUSCA 🟢</span>
                                            )}
                                        </div>
                                    </div>
                                    {ej.urlVideo && (
                                        <Video size={14} className="text-rojo/40 group-hover/item:text-rojo transition-colors" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="p-2 bg-marino-3/30 border-t border-marino-4 text-[0.55rem] text-center text-gris/50 uppercase font-bold tracking-tighter">
                        Enter o Salir para confirmar texto libre
                    </div>
                </div>
            )}
        </div>
    );
}
