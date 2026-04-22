"use client"
import { useState } from "react";
import { X, Layers, Loader2, RotateCcw, ArrowRight } from "lucide-react";

interface Props {
    abierto: boolean;
    cantidadSeleccionados: number;
    onConfirm: (nombre: string, tipo: 'AGRUPACION' | 'CIRCUITO', rounds?: number) => Promise<void> | void;
    onClose: () => void;
}

export default function ModalAgrupar({
    abierto,
    cantidadSeleccionados,
    onConfirm,
    onClose
}: Props) {
    const [nombre, setNombre] = useState("Superserie");
    const [tipo, setTipo] = useState<'AGRUPACION' | 'CIRCUITO'>('AGRUPACION');
    const [rounds, setRounds] = useState(3);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    if (!abierto) return null;

    const handleConfirm = async () => {
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }

        setCargando(true);
        setError("");
        try {
            await onConfirm(nombre.trim(), tipo, tipo === 'CIRCUITO' ? rounds : undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al agrupar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/90 backdrop-blur-xl" onClick={onClose} />
            
            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-marino-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-naranja/20 rounded-lg border border-naranja/30">
                            <Layers size={20} className="text-naranja" />
                        </div>
                        <h3 className="font-barlow-condensed font-black uppercase tracking-widest text-sm text-blanco">
                            Agrupar Ejercicios
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gris hover:text-blanco transition-colors p-1"
                        disabled={cargando}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="p-3 bg-marino-3/50 rounded-xl border border-marino-4">
                        <p className="text-xs text-gris">
                            <span className="text-naranja font-bold">{cantidadSeleccionados}</span> ejercicios seleccionados
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-wider ml-1">
                            Nombre del bloque
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Superserie A, Circuito Core..."
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco font-bold text-sm focus:border-naranja outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-wider ml-1">
                            Tipo de bloque
                        </label>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTipo('AGRUPACION')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    tipo === 'AGRUPACION' 
                                    ? 'border-naranja bg-naranja/10' 
                                    : 'border-marino-4 hover:border-marino-3'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowRight size={16} className={tipo === 'AGRUPACION' ? 'text-naranja' : 'text-gris'} />
                                    <span className="text-xs font-black uppercase tracking-wider text-blanco">Serie</span>
                                </div>
                                <p className="text-[10px] text-gris leading-tight">
                                    Ejercicios con descanso individual entre cada uno
                                </p>
                            </button>

                            <button
                                onClick={() => setTipo('CIRCUITO')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    tipo === 'CIRCUITO' 
                                    ? 'border-naranja bg-naranja/10' 
                                    : 'border-marino-4 hover:border-marino-3'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <RotateCcw size={16} className={tipo === 'CIRCUITO' ? 'text-naranja' : 'text-gris'} />
                                    <span className="text-xs font-black uppercase tracking-wider text-blanco">Circuito</span>
                                </div>
                                <p className="text-[10px] text-gris leading-tight">
                                    Ejercicios consecutivos sin descanso, con rondas
                                </p>
                            </button>
                        </div>
                    </div>

                    {tipo === 'CIRCUITO' && (
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-wider ml-1">
                                Número de rondas
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setRounds(Math.max(1, rounds - 1))}
                                    className="w-10 h-10 rounded-lg border border-marino-4 text-blanco font-bold hover:bg-marino-3"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={rounds}
                                    onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="flex-1 bg-marino border border-marino-4 rounded-lg px-4 py-2 text-center text-blanco font-bold"
                                />
                                <button
                                    onClick={() => setRounds(rounds + 1)}
                                    className="w-10 h-10 rounded-lg border border-marino-4 text-blanco font-bold hover:bg-marino-3"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded-xl text-rojo text-[11px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={cargando}
                            className="flex-1 py-3 px-4 rounded-xl border border-marino-4 text-gris font-bold text-xs uppercase tracking-wider hover:bg-marino-3 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={cargando}
                            className="flex-1 py-3 px-4 rounded-xl bg-naranja hover:bg-naranja-h text-marino font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {cargando ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Agrupar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}