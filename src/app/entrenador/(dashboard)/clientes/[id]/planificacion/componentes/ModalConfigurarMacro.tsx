"use client"
import { useState } from "react";
import { X, Calendar, Clock, Save, Loader2, Info } from "lucide-react";
import { MacrocicloCompleto } from "@/nucleo/tipos/planificacion.tipos";
import { actualizarMacrociclo } from "@/nucleo/acciones/planificacion.accion";
import { useRouter } from "next/navigation";

interface Props {
    macrociclo: MacrocicloCompleto;
    onClose: () => void;
}

export default function ModalConfigurarMacro({ macrociclo, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const duracion = parseInt(formData.get("duracion") as string);
        const fechaInicio = new Date(formData.get("fechaInicio") as string);
        const notas = formData.get("notas") as string;

        const res = await actualizarMacrociclo(macrociclo.id, {
            duracionSemanas: duracion,
            fechaInicio,
            notas
        });

        if (res.exito) {
            router.refresh();
            onClose();
        } else {
            setError(res.error || "Error al actualizar macrociclo");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-marino/80 backdrop-blur-md">
            <div className="bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <div>
                        <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-1">Configuración del Macrociclo</h3>
                        <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Estructura Global de Entrenamiento</p>
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

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-naranja" /> Fecha de Inicio
                            </label>
                            <input
                                name="fechaInicio"
                                type="date"
                                required
                                defaultValue={new Date(macrociclo.fechaInicio).toISOString().split('T')[0]}
                                className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-naranja" /> Duración Total
                            </label>
                            <div className="relative">
                                <input
                                    name="duracion"
                                    type="number"
                                    required
                                    defaultValue={macrociclo.duracionSemanas}
                                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.6rem] font-black uppercase text-gris">Semanas</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            <Info size={12} className="text-naranja" /> Notas Maestras del Plan
                        </label>
                        <textarea
                            name="notas"
                            defaultValue={macrociclo.notas || ""}
                            rows={4}
                            className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all resize-none"
                            placeholder="Objetivos generales del macrociclo, hitos importantes..."
                        ></textarea>
                    </div>

                    <p className="text-[0.6rem] text-gris italic leading-relaxed">
                        <span className="text-naranja font-black">Nota:</span> Al cambiar la duración, el sistema ajustará los slots disponibles para mesociclos, pero no eliminará fases ya creadas.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {loading ? (
                            <><Loader2 size={18} className="animate-spin" /> Actualizando...</>
                        ) : (
                            <><Save size={18} /> Guardar Configuración</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
