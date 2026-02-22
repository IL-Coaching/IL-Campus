"use client"
import { useState } from "react";
import { X, Calendar, CreditCard, Shield } from "lucide-react";
import { asignarMembresia } from "@/nucleo/acciones/cliente.accion";

interface Plan {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
}

interface Props {
    clienteId: string;
    clienteNombre: string;
    planes: Plan[];
    onClose: () => void;
}

export default function ModalAsignarPlan({ clienteId, clienteNombre, planes, onClose }: Props) {
    const [planId, setPlanId] = useState("");
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleAsignar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!planId) {
            setError("Selecciona un plan primero");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await asignarMembresia({
                clienteId,
                planId,
                fechaInicio
            });

            if (res.error) {
                setError(res.error);
            } else {
                onClose();
            }
        } catch {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop con desfoque */}
            <div
                className="absolute inset-0 bg-marino/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                            Asignar Membresía
                        </h2>
                        <p className="text-naranja text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            Atleta: <span className="text-blanco">{clienteNombre}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gris hover:text-blanco p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleAsignar} className="p-6 space-y-6">
                    {/* Selección de Plan */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                            <CreditCard size={14} className="text-naranja" />
                            Elegir Plan
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {planes.length === 0 ? (
                                <div className="p-10 border border-dashed border-marino-4 rounded-2xl text-center space-y-4 bg-marino-3/20">
                                    <Shield size={32} className="mx-auto text-gris/50" />
                                    <p className="text-xs text-gris italic">Configurando planes maestros...</p>
                                </div>
                            ) : (
                                planes.map((plan) => {
                                    const isElite = plan.nombre.includes("Elite");
                                    const isGymRat = plan.nombre.includes("GymRat");
                                    const isStart = plan.nombre.includes("Start");

                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setPlanId(plan.id)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${planId === plan.id
                                                ? 'bg-naranja border-naranja text-marino shadow-2xl shadow-naranja/20'
                                                : 'bg-marino-3/30 border-marino-4 text-blanco hover:border-naranja/50 hover:bg-marino-3'
                                                }`}
                                        >
                                            {/* Indicador de Nivel */}
                                            <div className="flex flex-col gap-1 items-start relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded ${planId === plan.id ? 'bg-marino text-naranja' : 'bg-naranja/10 text-naranja'}`}>
                                                        {isStart ? "Nivel 1" : isGymRat ? "Nivel 2" : isElite ? "Nivel 3" : "Oficial"}
                                                    </span>
                                                    <p className="font-barlow-condensed font-black uppercase tracking-tight text-base italic">
                                                        {plan.nombre.split('-')[1]?.trim() || plan.nombre}
                                                    </p>
                                                </div>
                                                <p className={`text-[10px] uppercase font-bold tracking-widest ${planId === plan.id ? 'text-marino/80' : 'text-gris'}`}>
                                                    {plan.duracionDias} DÍAS DE SEGUIMIENTO EVOLUTIVO
                                                </p>
                                            </div>

                                            {/* Precio */}
                                            <div className="text-right relative z-10">
                                                <p className="font-barlow-condensed font-black text-xl italic leading-none">
                                                    ${plan.precio.toLocaleString()}
                                                </p>
                                                <p className={`text-[9px] font-black uppercase tracking-tighter ${planId === plan.id ? 'text-marino/70' : 'text-naranja/70'}`}>
                                                    INVERSIÓN FINAL
                                                </p>
                                            </div>

                                            {/* Decoración sutil al seleccionar */}
                                            {planId === plan.id && (
                                                <div className="absolute right-[-10px] top-[-10px] opacity-10">
                                                    <Shield size={100} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Fecha de Inicio */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-naranja" />
                            Fecha de Inicio
                        </label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                        />
                        <p className="text-[10px] text-gris italic">
                            El vencimiento se calculará automáticamente según la duración del plan.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded text-rojo text-[11px] font-bold text-center uppercase">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !planId}
                            className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 disabled:grayscale transition-all text-marino font-bold py-4 rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-naranja/10 hover:shadow-naranja/20"
                        >
                            {isSubmitting ? "Procesando..." : "Confirmar Asignación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
