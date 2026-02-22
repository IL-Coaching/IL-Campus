"use client"
import { useState } from "react";
import { X, DollarSign, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import { registrarCobro } from "@/nucleo/acciones/cobro.accion";

interface Props {
    vencimiento: {
        id: string; // planAsignadoId
        fechaVencimiento: Date;
        cliente: { id: string, nombre: string };
        plan: { nombre: string, precio: number };
    };
    onClose: () => void;
}

export default function ModalRegistrarPago({ vencimiento, onClose }: Props) {
    const [monto, setMonto] = useState(vencimiento.plan.precio);
    const [metodo, setMetodo] = useState("Transferencia");
    const [fecha] = useState(new Date().toISOString().split('T')[0]);

    // Sugerimos que el periodo cubra desde el vencimiento actual hasta un mes después (aprox)
    const [desde, setDesde] = useState(new Date(vencimiento.fechaVencimiento).toISOString().split('T')[0]);
    const [hasta, setHasta] = useState(() => {
        const d = new Date(vencimiento.fechaVencimiento);
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });

    const [comprobanteBase64, setComprobanteBase64] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("El archivo es muy pesado. Máximo 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setComprobanteBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await registrarCobro({
                clienteId: vencimiento.cliente.id,
                planAsignadoId: vencimiento.id,
                monto: Number(monto),
                metodo,
                periodoDesde: desde,
                periodoHasta: hasta,
                fechaPago: fecha, // La acción lo usará si es necesario, por ahora usa default now
                comprobanteBase64: comprobanteBase64 || undefined
            });

            if (res.error) {
                setError(res.error);
            } else {
                onClose();
            }
        } catch {
            setError("Ocurrió un error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-marino-4 flex justify-between items-start bg-marino-3/50">
                    <div>
                        <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                            Registrar Cobro
                        </h2>
                        <p className="text-naranja text-[10px] font-black uppercase tracking-[0.2em]">
                            Atleta: {vencimiento.cliente.nombre}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={12} className="text-naranja" /> Monto (ARS)
                            </label>
                            <input
                                type="number"
                                value={monto}
                                onChange={(e) => setMonto(Number(e.target.value))}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={12} className="text-naranja" /> Método
                            </label>
                            <select
                                value={metodo}
                                onChange={(e) => setMetodo(e.target.value)}
                                className="w-full bg-marino border border-marino-4 rounded-xl p-3 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                            >
                                <option>Transferencia</option>
                                <option>Efectivo</option>
                                <option>Mercado Pago</option>
                                <option>Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} className="text-naranja" /> Periodo que Cubre
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                className="flex-1 bg-marino border border-marino-4 rounded-xl p-3 text-blanco text-xs focus:border-naranja/50 outline-none"
                            />
                            <span className="text-gris">→</span>
                            <input
                                type="date"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="flex-1 bg-marino border border-marino-4 rounded-xl p-3 text-blanco text-xs focus:border-naranja/50 outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-gris italic">Se recomienda cubrir desde el último vencimiento.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                            Adjuntar Comprobante (Opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={handleFileChange}
                            className="w-full bg-marino border border-marino-4 rounded-xl p-2 text-gris text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-marino-4 file:text-blanco hover:file:bg-naranja hover:file:text-marino transition-all  outline-none"
                        />
                        {comprobanteBase64 && <p className="text-[10px] text-verde italic">Archivo adjunto listo.</p>}
                    </div>

                    {error && (
                        <div className="p-3 bg-rojo/10 border border-rojo/20 rounded text-rojo text-[11px] font-bold text-center uppercase">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-verde hover:bg-verde-h text-marino font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-verde/10 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? "Procesando..." : (
                            <>
                                <CheckCircle2 size={18} />
                                Confirmar Pago
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
