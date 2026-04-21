"use client"
import { useState } from "react";
import { X, AlertTriangle, Loader2, Check } from "lucide-react";

interface Props {
    abierto: boolean;
    titulo: string;
    mensaje: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    variante?: 'peligro' | 'advertencia' | 'info';
    onConfirm: () => Promise<void> | void;
    onClose: () => void;
}

export default function ModalConfirmSimple({
    abierto,
    titulo,
    mensaje,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    variante = 'peligro',
    onConfirm,
    onClose
}: Props) {
    const [cargando, setCargando] = useState(false);

    if (!abierto) return null;

    const colores = {
        peligro: {
            icono: 'bg-rojo/20 text-rojo border-rojo/30',
            boton: 'bg-rojo hover:bg-rojo-h text-blanco',
            iconoDetalle: <AlertTriangle size={20} />
        },
        advertencia: {
            icono: 'bg-naranja/20 text-naranja border-naranja/30',
            boton: 'bg-naranja hover:bg-naranja-h text-marino',
            iconoDetalle: <AlertTriangle size={20} />
        },
        info: {
            icono: 'bg-azul/20 text-azul border-azul/30',
            boton: 'bg-verde hover:bg-verde-h text-marino',
            iconoDetalle: <Check size={20} />
        }
    };

    const estilos = colores[variante];

    const handleConfirm = async () => {
        setCargando(true);
        try {
            await onConfirm();
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
                        <div className={`p-2 rounded-lg border ${estilos.icono}`}>
                            {estilos.iconoDetalle}
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

                <div className="p-6">
                    <p className="text-xs text-gris leading-relaxed mb-6">
                        {mensaje}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={cargando}
                            className="flex-1 py-3 px-4 rounded-xl border border-marino-4 text-gris font-bold text-xs uppercase tracking-wider hover:bg-marino-3 transition-colors disabled:opacity-50"
                        >
                            {textoCancelar}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={cargando}
                            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${estilos.boton}`}
                        >
                            {cargando ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                textoConfirmar
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
