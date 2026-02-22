"use client"
import { useState } from "react";
import { X, CheckCircle2, Calendar, CreditCard, Shield } from "lucide-react";
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
                        <div className="grid grid-cols-1 gap-2">
                            {planes.length === 0 ? (
                                <div className="p-8 border border-dashed border-marino-4 rounded-xl text-center space-y-4">
                                    <p className="text-xs text-gris italic">No se encontraron los planes del flyer en tu cuenta.</p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setIsSubmitting(true);
                                            const { sincronizarPlanesMaestros } = await import("@/nucleo/acciones/biblioteca.accion");
                                            await sincronizarPlanesMaestros();
                                            window.location.reload();
                                        }}
                                        className="text-[0.6rem] font-black text-naranja uppercase tracking-widest border border-naranja/30 px-4 py-2 rounded-lg hover:bg-naranja/10 transition-all flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <Shield size={12} /> Sincronizar con Flyer Oficial
                                    </button>
                                </div>
                            ) : (
                                planes.map((plan) => (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => setPlanId(plan.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${planId === plan.id
                                            ? 'bg-naranja border-naranja text-marino shadow-lg shadow-naranja/20'
                                            : 'bg-marino border-marino-4 text-gris-claro hover:border-marino-3 hover:bg-marino-3'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-barlow-condensed font-black uppercase tracking-tight">
                                                {plan.nombre}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold opacity-70">
                                                {plan.duracionDias} días de asesoría
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">
                                                ${plan.precio.toLocaleString()}
                                            </p>
                                            {planId === plan.id && <CheckCircle2 size={16} />}
                                        </div>
                                    </button>
                                ))
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
