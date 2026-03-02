"use client";

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { enviarCheckin } from '@/nucleo/acciones/checkin.accion';
import { useRouter } from 'next/navigation';

interface MiniCheckinProps {
    onSuccess?: () => void;
}

export default function MiniCheckin({ onSuccess }: MiniCheckinProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        energia: 5,
        sueno: 5,
        adherencia: 50,
        problemaFisico: false,
        notaProblema: '',
        intensidad: 'media',
        nota: ''
    });

    const handleEnviar = async () => {
        setIsPending(true);
        setError(null);
        try {
            const result = await enviarCheckin({
                energia: formData.energia,
                sueno: formData.sueno,
                adherencia: formData.adherencia,
                problemaFisico: formData.problemaFisico,
                notaProblema: formData.notaProblema,
                intensidad: formData.intensidad,
                nota: formData.nota
            });
            
            if (result.exito) {
                setEnviado(true);
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.refresh();
                    }
                }, 1500);
            } else {
                setError(result.error || 'Error al enviar check-in');
            }
        } catch {
            setError('Error al enviar check-in');
        } finally {
            setIsPending(false);
        }
    };

    if (enviado) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-400 text-sm font-bold">¡Check-in enviado!</span>
            </div>
        );
    }

    return (
        <div className="bg-marino-2 border border-naranja/30 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-naranja/5 border-b border-naranja/10 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-blanco">Check-in rápido</h3>
                    <p className="text-[0.6rem] text-gris">Completá en 30 segundos</p>
                </div>
                <button 
                    onClick={() => router.push('/alumno/checkin')}
                    className="text-[0.6rem] text-naranja hover:underline"
                >
                    Ver más →
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border-b border-red-500/20">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            <div className="p-4 space-y-4">
                {/* Energía */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gris uppercase">¿Cómo te sentiste?</label>
                        <span className="text-xs text-naranja font-bold">{formData.energia}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.energia}
                        onChange={(e) => setFormData({...formData, energia: parseInt(e.target.value)})}
                        className="w-full h-2 bg-marino-3 rounded-full appearance-none cursor-pointer accent-naranja"
                    />
                </div>

                {/* Sueño */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gris uppercase">¿Cómo dormiste?</label>
                        <span className="text-xs text-blue-400 font-bold">{formData.sueno}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.sueno}
                        onChange={(e) => setFormData({...formData, sueno: parseInt(e.target.value)})}
                        className="w-full h-2 bg-marino-3 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Adherencia */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gris uppercase">% Cumplido</label>
                        <span className="text-xs text-green-400 font-bold">{formData.adherencia}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={formData.adherencia}
                        onChange={(e) => setFormData({...formData, adherencia: parseInt(e.target.value)})}
                        className="w-full h-2 bg-marino-3 rounded-full appearance-none cursor-pointer accent-green-500"
                    />
                </div>

                {/* Problema físico */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFormData({...formData, problemaFisico: false})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            !formData.problemaFisico 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-marino-3 text-gris border border-marino-4'
                        }`}
                    >
                        Sin problemas
                    </button>
                    <button
                        onClick={() => setFormData({...formData, problemaFisico: true})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            formData.problemaFisico 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-marino-3 text-gris border border-marino-4'
                        }`}
                    >
                        Tuve problemas
                    </button>
                </div>

                {formData.problemaFisico && (
                    <input
                        type="text"
                        placeholder="¿Qué problema tuviste?"
                        value={formData.notaProblema}
                        onChange={(e) => setFormData({...formData, notaProblema: e.target.value})}
                        className="w-full bg-marino-3 border border-marino-4 rounded-lg px-3 py-2 text-xs text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                    />
                )}

                {/* Botón enviar */}
                <button
                    onClick={handleEnviar}
                    disabled={isPending}
                    className="w-full bg-naranja hover:bg-naranja-h text-marino font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isPending ? (
                        <div className="w-4 h-4 border-2 border-marino border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={14} /> Enviar check-in
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
