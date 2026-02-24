"use client"
import { useState } from "react";
import { X, Calendar, DollarSign, Wallet, Save, Loader2, Info } from "lucide-react";
import { registrarCobroAction } from "@/nucleo/acciones/finanzas.accion";

interface Props {
    clienteId: string;
    clienteNombre: string;
    planesAsignados: { id: string, plan: { nombre: string }, fechaInicio: Date, fechaVencimiento: Date }[];
    onClose: () => void;
}

export default function ModalRegistrarPago({ clienteId, clienteNombre, planesAsignados, onClose }: Props) {
    const [monto, setMonto] = useState("");
    const [metodo, setMetodo] = useState("EFECTIVO");
    const [planAsignadoId, setPlanAsignadoId] = useState(planesAsignados[0]?.id || "");
    const [periodoDesde, setPeriodoDesde] = useState(new Date().toISOString().split('T')[0]);
    const [periodoHasta, setPeriodoHasta] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });
    const [notas, setNotas] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!monto || isNaN(Number(monto))) {
            setError("Ingresa un monto válido");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await registrarCobroAction({
                clienteId,
                monto: Number(monto),
                metodo,
                planAsignadoId: planAsignadoId || undefined,
                periodoDesde: new Date(periodoDesde),
                periodoHasta: new Date(periodoHasta),
                notas
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-blanco">
            <div className="absolute inset-0 bg-marino/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-marino-4 flex justify-between items-start bg-marino-3/50">
                    <div>
                        <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tight text-naranja">
                            Registrar Cobro Manual
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-gris">
                            Atleta: <span className="text-blanco">{clienteNombre}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleGuardar} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monto */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={14} className="text-verde" />
                                Importe Abonado (ARS)
                            </label>
                            <input
                                type="number"
                                required
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-2xl font-barlow-condensed font-black text-blanco focus:outline-none focus:border-verde/50 transition-colors"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Metodo */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                                <Wallet size={14} className="text-naranja" />
                                Método de Pago
                            </label>
                            <select
                                value={metodo}
                                onChange={(e) => setMetodo(e.target.value)}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-sm text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                            >
                                <option value="EFECTIVO">Efectivo / Cash</option>
                                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                <option value="MERCADOPAGO">Mercado Pago</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>

                    {/* Vincular a Plan */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-azul-claro" />
                            Vincular a Membresía
                        </label>
                        <select
                            value={planAsignadoId}
                            onChange={(e) => setPlanAsignadoId(e.target.value)}
                            className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-sm text-blanco focus:outline-none focus:border-azul-claro/50 transition-colors"
                        >
                            <option value="">No vincular (Pago Suelto)</option>
                            {planesAsignados.map(pa => (
                                <option key={pa.id} value={pa.id}>
                                    {pa.plan.nombre} ({new Date(pa.fechaInicio).toLocaleDateString()} - {new Date(pa.fechaVencimiento).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Periodo cubierto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Cobro Desde
                            </label>
                            <input
                                type="date"
                                value={periodoDesde}
                                onChange={(e) => setPeriodoDesde(e.target.value)}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-sm text-blanco focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gris uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Cobro Hasta (Vencimiento)
                            </label>
                            <input
                                type="date"
                                value={periodoHasta}
                                onChange={(e) => setPeriodoHasta(e.target.value)}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-sm text-blanco focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gris uppercase tracking-widest">Breve descripción / Notas</label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-sm text-blanco focus:outline-none h-20 resize-none"
                            placeholder="Comprobante enviado por WPP, etc..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded text-rojo text-[11px] font-bold text-center uppercase">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-marino-4 hover:bg-marino-3 text-blanco font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] bg-verde hover:bg-verde/80 disabled:opacity-50 transition-all text-marino font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-verde/10"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Confirmar Cobro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
