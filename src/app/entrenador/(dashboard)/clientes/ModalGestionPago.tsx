"use client";

import { useState, useTransition } from "react";
import { X, DollarSign, Calendar, CreditCard, ChevronRight, Check } from "lucide-react";
import { registrarCobro } from "@/nucleo/acciones/cobro.accion";
import { cambiarEstadoPagoPlan } from "@/nucleo/acciones/cliente.accion";

interface Props {
    data: {
        clienteId: string;
        planAsignadoId: string;
        nombre: string;
        estado: string;
    };
    onClose: () => void;
}

const METODOS_PAGO = [
    "Transferencia",
    "Efectivo",
    "Mercado Pago",
    "Binance",
    "Otro"
];

const ESTADOS_PAGO = [
    { value: "ABONADO", label: "Abonado", color: "bg-verde", icon: Check },
    { value: "PARCIAL", label: "Pago Parcial", color: "bg-[#eab308]", icon: DollarSign },
    { value: "PENDIENTE", label: "Pendiente", color: "bg-gris-claro", icon: Calendar },
    { value: "VENCIDO", label: "Vencido", color: "bg-rojo", icon: X }
];

export default function ModalGestionPago({ data, onClose }: Props) {
    const [estado, setEstado] = useState(data.estado);
    const [monto, setMonto] = useState("");
    const [metodo, setMetodo] = useState("Transferencia");
    const [notas, setNotas] = useState("");
    const [isPending, startTransition] = useTransition();

    async function handleGuardar() {
        startTransition(async () => {
            // 1. Actualizar estado del plan si cambió
            if (estado !== data.estado) {
                const resEstado = await cambiarEstadoPagoPlan(data.planAsignadoId, estado);
                if (!resEstado.exito) {
                    alert(resEstado.error);
                    return;
                }
            }

            // 2. Si hay monto, registrar un cobro
            if (monto && parseFloat(monto) > 0) {
                const resCobro = await registrarCobro({
                    clienteId: data.clienteId,
                    planAsignadoId: data.planAsignadoId,
                    montoArs: parseFloat(monto),
                    metodo,
                    notas,
                    periodoDesde: new Date(), // Ajustar según lógica
                    periodoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Ajustar según lógica
                });

                if (!resCobro.exito) {
                    alert(resCobro.error);
                    return;
                }
            }

            onClose();
        });
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino-1/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#12182b] border border-[#1a233a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-[#1a233a] bg-gradient-to-r from-naranja/10 to-transparent flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco tracking-widest leading-none">Gestión de Cobro</h2>
                        <p className="text-naranja text-[0.6rem] font-black uppercase tracking-[0.3em] mt-2 italic">{data.nombre}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-marino-3 border border-marino-4 rounded-2xl text-gris hover:text-blanco transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Selector de Estado */}
                    <div className="space-y-4">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gris block ml-1">Estado de Membresía</label>
                        <div className="grid grid-cols-2 gap-3">
                            {ESTADOS_PAGO.map((est) => {
                                const Icon = est.icon;
                                const active = estado === est.value;
                                return (
                                    <button
                                        key={est.value}
                                        onClick={() => setEstado(est.value)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${active
                                                ? `bg-marino-3 border-${est.value === 'ABONADO' ? 'verde' : est.value === 'PARCIAL' ? '[#eab308]' : est.value === 'VENCIDO' ? 'rojo' : 'marino-4'} ring-2 ring-opacity-20`
                                                : 'bg-marino-2 border-marino-4 hover:border-marino-3'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${active ? est.color : 'bg-marino-4 text-gris'}`}>
                                            <Icon size={16} className={active ? 'text-marino' : 'text-gris'} />
                                        </div>
                                        <span className={`text-[0.65rem] font-black uppercase tracking-widest ${active ? 'text-blanco' : 'text-gris'}`}>
                                            {est.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Registro de Monto */}
                    <div className="space-y-4 pt-4 border-t border-marino-4/30">
                        <div className="flex items-center justify-between">
                            <label className="text-[0.6rem] font-black uppercase tracking-widest text-gris ml-1">Registrar Pago Nuevo (Opcional)</label>
                            <CreditCard size={14} className="text-naranja opacity-50" />
                        </div>

                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-naranja font-black text-xl">$</div>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="w-full bg-marino-3 border-2 border-marino-4 focus:border-naranja rounded-2xl py-5 pl-12 pr-6 text-blanco font-barlow-condensed font-black text-2xl outline-none placeholder:opacity-20 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <select
                                value={metodo}
                                onChange={(e) => setMetodo(e.target.value)}
                                className="bg-marino-2 border-2 border-marino-4 rounded-xl py-4 px-4 text-[0.65rem] font-black uppercase tracking-widest text-gris outline-none focus:border-naranja transition-all"
                            >
                                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Notas (Ej: Enero p1)"
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                className="bg-marino-2 border-2 border-marino-4 rounded-xl py-4 px-4 text-[0.65rem] font-black uppercase tracking-widest text-blanco placeholder:text-gris/50 outline-none focus:border-naranja transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-marino-3/50 border-t border-[#1a233a] flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] text-gris hover:text-blanco bg-marino-2 border border-marino-4 hover:bg-marino-3 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={isPending}
                        className="flex-[2] py-5 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] text-marino bg-naranja hover:bg-naranja-h shadow-lg shadow-naranja/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isPending ? "Guardando..." : "Confirmar Cambios"}
                        {!isPending && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
