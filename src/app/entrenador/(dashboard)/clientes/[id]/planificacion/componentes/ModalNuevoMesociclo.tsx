"use client"
import { useState } from "react";
import { X, Target, Zap, PlusCircle, Loader2 } from "lucide-react";
import { MacrocicloCompleto } from "@/nucleo/tipos/planificacion.tipos";
import { agregarMesociclo } from "@/nucleo/acciones/planificacion.accion";
import { useRouter } from "next/navigation";

interface Props {
    macrociclo: MacrocicloCompleto;
    onClose: () => void;
}

export default function ModalNuevoMesociclo({ macrociclo, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [numSemanas, setNumSemanas] = useState(4);
    const [numSesiones, setNumSesiones] = useState(3);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const proximoMes = macrociclo.bloquesMensuales.length + 1;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const objetivo = formData.get("objetivo") as string;
        const metodo = formData.get("metodo") as string;
        const rangoReferencia = formData.get("rangoReferencia") as string;

        const res = await agregarMesociclo(macrociclo.id, {
            objetivo,
            metodo,
            rangoReferencia,
            numeroMes: proximoMes,
            numSemanas,
            numSesiones
        });

        if (res.exito) {
            router.refresh();
            onClose();
        } else {
            setError(res.error || "Error al crear mesociclo");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-marino/80 backdrop-blur-md">
            <div className="bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-naranja/10">
                    <div>
                        <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-1">Añadir Mes {proximoMes}</h3>
                        <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Nuevo Mesociclo de Entrenamiento</p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-2">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-rojo/10 border border-rojo/20 text-rojo p-3 rounded-lg text-xs font-bold uppercase text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block">Semanas (Duración)</label>
                            <div className="flex items-center gap-3 bg-marino-3 border border-marino-4 rounded-xl p-2">
                                <button type="button" onClick={() => setNumSemanas(Math.max(1, numSemanas - 1))} className="w-8 h-8 rounded-lg bg-marino-4 text-blanco font-bold">-</button>
                                <span className="flex-1 text-center font-black text-naranja">{numSemanas}</span>
                                <button type="button" onClick={() => setNumSemanas(Math.min(8, numSemanas + 1))} className="w-8 h-8 rounded-lg bg-marino-4 text-blanco font-bold">+</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest block">Días / Semana</label>
                            <div className="flex items-center gap-3 bg-marino-3 border border-marino-4 rounded-xl p-2">
                                <button type="button" onClick={() => setNumSesiones(Math.max(1, numSesiones - 1))} className="w-8 h-8 rounded-lg bg-marino-4 text-blanco font-bold">-</button>
                                <span className="flex-1 text-center font-black text-naranja">{numSesiones}</span>
                                <button type="button" onClick={() => setNumSesiones(Math.min(7, numSesiones + 1))} className="w-8 h-8 rounded-lg bg-marino-4 text-blanco font-bold">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            <Target size={12} className="text-naranja" /> Objetivo del Bloque
                        </label>
                        <textarea
                            name="objetivo"
                            required
                            rows={3}
                            placeholder="Ej: Mejorar técnica en básicos, acondicionamiento cardiovascular..."
                            className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all resize-none text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-naranja" /> Método Sugerido
                        </label>
                        <textarea
                            name="metodo"
                            rows={2}
                            placeholder="Ej: Full body / Intensidad: 70-75% RM..."
                            className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all resize-none text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-naranja" /> Rango & Descanso
                        </label>
                        <textarea
                            name="rangoReferencia"
                            rows={2}
                            placeholder="Ej: 10-12 reps / 1.30 min descanso..."
                            className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all resize-none text-sm font-medium"
                        />
                    </div>

                    <div className="bg-marino-3 border-l-4 border-l-naranja p-4 rounded-r-lg">
                        <p className="text-[0.6rem] text-blanco font-medium italic">
                            Se inicializarán {numSemanas} semanas con {numSesiones} sesiones pre-estructuradas. Podrás añadir o quitar días libremente luego.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-5 rounded-xl text-lg uppercase tracking-[0.2em] font-barlow-condensed shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {loading ? (
                            <><Loader2 size={24} className="animate-spin" /> Estructurando...</>
                        ) : (
                            <><PlusCircle size={24} /> Inicializar Mes {proximoMes}</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
