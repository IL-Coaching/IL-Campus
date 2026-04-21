"use client"
import { useState } from "react";
import { X, Edit3, Loader2 } from "lucide-react";

interface Props {
    abierto: boolean;
    titulo: string;
    valorInicial: string;
    placeholder?: string;
    onConfirm: (nuevoNombre: string) => Promise<void> | void;
    onClose: () => void;
}

export default function ModalRenombrar({
    abierto,
    titulo,
    valorInicial,
    placeholder = "Nombre del grupo",
    onConfirm,
    onClose
}: Props) {
    const [valor, setValor] = useState(valorInicial);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    if (!abierto) return null;

    const handleConfirm = async () => {
        if (!valor.trim()) {
            setError("El nombre no puede estar vacío.");
            return;
        }
        
        if (valor.trim() === valorInicial.trim()) {
            onClose();
            return;
        }

        setCargando(true);
        setError("");
        try {
            await onConfirm(valor.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al renombrar.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/90 backdrop-blur-xl" onClick={onClose} />
            
            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-marino-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-naranja/20 rounded-lg border border-naranja/30">
                            <Edit3 size={20} className="text-naranja" />
                        </div>
                        <h3 className="font-barlow-condensed font-black uppercase tracking-widest text-sm text-blanco">
                            {titulo}
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

                <div className="p-6 space-y-4">
                    <div>
                        <input
                            type="text"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder={placeholder}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm();
                                if (e.key === 'Escape') onClose();
                            }}
                            className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco font-bold text-sm focus:border-naranja outline-none transition-all placeholder:text-gris/30 shadow-inner"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded-xl text-rojo text-[11px] font-bold text-center uppercase tracking-wider animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={cargando}
                            className="flex-1 py-3 px-4 rounded-xl border border-marino-4 text-gris font-bold text-xs uppercase tracking-wider hover:bg-marino-3 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={cargando || !valor.trim()}
                            className="flex-1 py-3 px-4 rounded-xl bg-naranja hover:bg-naranja-h text-marino font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {cargando ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Renombrar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}