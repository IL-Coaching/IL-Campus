"use client"
import { useState } from "react";
import { X, Calendar, CreditCard, Shield, Copy, Check } from "lucide-react";
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
    ultimoPlanVencimiento?: string | Date;
    planes: Plan[];
    onClose: () => void;
}

export default function ModalAsignarPlan({ clienteId, clienteNombre, ultimoPlanVencimiento, planes, onClose }: Props) {
    const [planId, setPlanId] = useState("");
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successCode, setSuccessCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Detección de Conflicto
    const hoy = new Date();
    const vencimientoActual = ultimoPlanVencimiento ? new Date(ultimoPlanVencimiento) : null;
    const tienePlanActivo = vencimientoActual && vencimientoActual > hoy;

    function handleProgramarAlVencimiento() {
        if (vencimientoActual) {
            const mananaAlVencimiento = new Date(vencimientoActual);
            mananaAlVencimiento.setDate(mananaAlVencimiento.getDate() + 1);
            setFechaInicio(mananaAlVencimiento.toISOString().split('T')[0]);
        }
    }

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
            } else if (res.codigoActivacion) {
                setSuccessCode(res.codigoActivacion);
            } else {
                onClose();
            }
        } catch {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        if (successCode) {
            navigator.clipboard.writeText(successCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                            {successCode ? "¡Plan Asignado!" : "Asignar Membresía"}
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

                {successCode ? (
                    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-naranja/10 rounded-full flex items-center justify-center text-naranja mx-auto ring-4 ring-naranja/5">
                                <Shield size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-blanco font-bold text-sm uppercase tracking-widest">Código de Activación</p>
                                <p className="text-gris text-[10px] uppercase font-bold tracking-tighter">Enviá este código al atleta para que pueda ingresar por primera vez</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-naranja to-naranja-h opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative flex items-center justify-between bg-marino border border-marino-4 p-5 rounded-2xl overflow-hidden">
                                <span className="text-2xl font-barlow-condensed font-black text-naranja tracking-[0.2em] italic">
                                    {successCode}
                                </span>
                                <button
                                    onClick={copyToClipboard}
                                    className={`p-3 rounded-xl transition-all ${copied ? 'bg-verde text-marino' : 'bg-marino-4 text-blanco hover:bg-marino-3'}`}
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-marino-4">
                            <p className="text-[10px] text-gris text-center italic">
                                El atleta deberá ingresar este código junto con su email en la pantalla de acceso.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-marino-3 hover:bg-marino-4 text-blanco font-bold py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all border border-marino-4"
                            >
                                Finalizar y Volver
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleAsignar} className="p-6 space-y-6">
                        {/* Alerta de Conflicto de Plan Activo */}
                        {tienePlanActivo && (
                            <div className="p-4 bg-naranja/10 border border-naranja/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-naranja" size={20} />
                                    <div className="flex-1">
                                        <p className="text-[0.65rem] font-black uppercase text-naranja tracking-widest">Atención: Plan Vigente</p>
                                        <p className="text-[0.6rem] text-gris font-medium">El atleta tiene un plan activo hasta el {vencimientoActual?.toLocaleDateString()}.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleProgramarAlVencimiento}
                                    className="w-full py-2 bg-naranja/20 hover:bg-naranja/30 border border-naranja/30 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-blanco transition-all"
                                >
                                    Programar al finalizar el actual
                                </button>
                            </div>
                        )}

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
                )}
            </div>
        </div>
    );
}

