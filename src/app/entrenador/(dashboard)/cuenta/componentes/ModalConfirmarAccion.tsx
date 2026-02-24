"use client"
import { useState } from "react";
import { X, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

interface Props {
    titulo: string;
    descripcion: string;
    onConfirm: (password: string) => Promise<void>;
    onClose: () => void;
}

export default function ModalConfirmarAccion({ titulo, descripcion, onConfirm, onClose }: Props) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return setError("La contraseña es obligatoria.");

        setLoading(true);
        setError("");
        try {
            await onConfirm(password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error de validación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-marino-4 bg-marino-3/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-naranja/20 rounded-lg">
                            <ShieldCheck size={20} className="text-naranja" />
                        </div>
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">{titulo}</h3>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-3">
                        <p className="text-xs text-gris leading-relaxed">
                            {descripcion}
                        </p>
                        <div className="p-3 bg-naranja/10 border border-naranja/20 rounded-xl flex gap-3 items-center">
                            <AlertTriangle size={16} className="text-naranja shrink-0" />
                            <p className="text-[10px] text-naranja font-bold uppercase tracking-wider">Esta es una zona de alta seguridad.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-[0.2em] ml-1">Verificación de Identidad</label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña actual"
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco font-bold text-sm focus:border-naranja outline-none transition-all placeholder:text-gris/30 shadow-inner"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded-xl text-rojo text-[11px] font-bold text-center uppercase tracking-wider animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blanco hover:bg-naranja text-marino font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                                Validar y Continuar
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
