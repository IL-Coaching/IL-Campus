"use client";

import { useState, useTransition } from "react";
import { toast } from '@/compartido/hooks/useToast';
import { useRouter } from "next/navigation";
import { Info, Receipt, CreditCard, Plus, Clock, CheckCircle2, AlertCircle, Calendar, Star } from "lucide-react";
import ModalRegistrarPago from "./ModalRegistrarPago";
import { toggleVIPCliente } from "@/nucleo/acciones/cliente.accion";

interface CobroConPlan {
    id: string;
    montoArs: number;
    fecha: Date;
    metodo: string;
    periodoDesde: Date;
    periodoHasta: Date;
    planAsignado?: { plan: { nombre: string } };
}

export interface ResumenFinanciero {
    cobros: CobroConPlan[];
    planActivo: { id: string; plan: { nombre: string }; fechaInicio: Date; fechaVencimiento: Date } | null;
    estado: 'AL_DIA' | 'VENCIDO' | 'SIN_PLAN';
    diasParaVencer: number;
}

interface Props {
    clienteId: string;
    clienteNombre: string;
    resumen: ResumenFinanciero | null;
    esVIP: boolean;
}

export default function TabFinanzasClient({ clienteId, clienteNombre, resumen, esVIP }: Props) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [clienteEsVIP, setClienteEsVIP] = useState(esVIP);

    function handleToggleVIP() {
        startTransition(async () => {
            const res = await toggleVIPCliente(clienteId, !clienteEsVIP);
            if (res.exito) {
                setClienteEsVIP(!clienteEsVIP);
                router.refresh();
            } else {
                toast.error(res.error || "Error al cambiar estado VIP");
            }
        });
    }

    const totalFacturado = resumen?.cobros.reduce((acc: number, c: CobroConPlan) => acc + c.montoArs, 0) || 0;
    const ultimoCobro = resumen?.cobros[0];

    return (
        <div className="space-y-8 fade-up visible pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                    <h3 className="text-xl md:text-2xl font-barlow-condensed font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro tracking-tight leading-none">
                        Estado de Cuenta & Finanzas
                    </h3>
                    <p className="text-[0.65rem] text-gris font-bold uppercase tracking-[0.2em] mt-1">Registro de membresías y transacciones</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 md:py-3 bg-gradient-to-r from-verde to-emerald-500 hover:from-emerald-500 hover:to-verde text-marino font-black rounded-2xl text-[0.65rem] uppercase tracking-widest transition-all shadow-xl shadow-verde/20 active:scale-95 hover:-translate-y-1"
                >
                    <Plus size={18} strokeWidth={3} /> Registrar Nuevo Cobro
                </button>
            </div>

            {/* Banner de Estado — Mobile First */}
            <div className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl overflow-hidden relative group transition-all duration-500 ${resumen?.estado === 'AL_DIA' ? 'bg-verde/5 border-verde/20' :
                resumen?.estado === 'VENCIDO' ? 'bg-rojo/5 border-rojo/20' : 'bg-marino-3/50 border-marino-4'
                }`}>
                <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                    <div className={`p-4 md:p-5 rounded-2xl transition-colors duration-300 ${resumen?.estado === 'AL_DIA' ? 'bg-verde/10 text-verde group-hover:bg-verde/20' :
                        resumen?.estado === 'VENCIDO' ? 'bg-rojo/10 text-rojo group-hover:bg-rojo/20' : 'bg-marino-4 text-gris group-hover:bg-marino-3'
                        }`}>
                        {resumen?.estado === 'AL_DIA' ? <CheckCircle2 size={32} /> :
                            resumen?.estado === 'VENCIDO' ? <AlertCircle size={32} /> : <Clock size={32} />}
                    </div>
                    <div>
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-60">Status de Membresía</span>
                        <h4 className={`text-2xl md:text-4xl font-barlow-condensed font-black uppercase leading-none mt-1 ${resumen?.estado === 'AL_DIA' ? 'text-verde' :
                            resumen?.estado === 'VENCIDO' ? 'text-rojo' : 'text-blanco'
                            }`}>
                            {resumen?.estado === 'AL_DIA' ? "Al Día / Solvente" :
                                resumen?.estado === 'VENCIDO' ? "Membresía Vencida" : "Sin Plan Activo"}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={handleToggleVIP}
                                disabled={isPending}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[0.6rem] font-black uppercase tracking-widest transition-all ${clienteEsVIP
                                    ? 'bg-[#EAB308]/20 border-[#EAB308]/40 text-[#EAB308] hover:bg-[#EAB308]/30'
                                    : 'bg-marino-3 border-marino-4 text-gris hover:text-naranja hover:border-naranja/40'
                                    }`}
                            >
                                <Star size={14} className={clienteEsVIP ? "fill-current" : ""} />
                                {clienteEsVIP ? "VIP ACTIVO" : "Activar VIP"}
                            </button>
                        </div>
                        <p className="text-[0.7rem] md:text-xs text-gris font-medium mt-2 max-w-md">
                            {resumen?.estado === 'AL_DIA' ? `Próximo vencimiento automático en ${resumen.diasParaVencer} días.` :
                                resumen?.estado === 'VENCIDO' ? "El cliente ha superado la fecha límite de pago." : "Asigne un plan para comenzar el seguimiento."}
                        </p>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end relative z-10 w-full md:w-auto border-t md:border-t-0 border-marino-4/50 pt-4 md:pt-0">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-gris mb-1">Cierre de Periodo</span>
                    <p className="text-xl md:text-2xl font-barlow-condensed font-black text-blanco italic">
                        {resumen?.planActivo ? new Date(resumen.planActivo.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : "--/--/--"}
                    </p>
                </div>

                {/* Decoración de fondo */}
                <div className="absolute -bottom-10 -right-10 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                    <Receipt size={280} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-marino-2 border border-marino-4 p-5 md:p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-naranja/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-marino-3 rounded-xl flex items-center justify-center text-naranja border border-marino-4 group-hover:bg-marino-4 transition-colors shrink-0">
                        <Receipt size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block truncate">Total Invertido</span>
                        <div className="text-xl md:text-2xl font-barlow-condensed font-black text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro mt-1">${totalFacturado.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-5 md:p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-verde/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-marino-3 rounded-xl flex items-center justify-center text-verde border border-marino-4 group-hover:bg-marino-4 transition-colors shrink-0">
                        <CreditCard size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block truncate">Último Pago</span>
                        <div className="text-xl md:text-2xl font-barlow-condensed font-black text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro mt-1">
                            {ultimoCobro ? `$${ultimoCobro.montoArs.toLocaleString()}` : "$0"}
                        </div>
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-5 md:p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-azul-claro/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-marino-3 rounded-xl flex items-center justify-center text-azul-claro border border-marino-4 group-hover:bg-marino-4 transition-colors shrink-0">
                        <Calendar size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block truncate">Última Transacción</span>
                        <div className="text-xl md:text-2xl font-barlow-condensed font-black text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro mt-1 truncate">
                            {ultimoCobro ? new Date(ultimoCobro.fecha).toLocaleDateString() : "--/--/--"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado de Cobros — Adaptativo */}
            <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-marino-4 bg-marino-3/30 flex justify-between items-center">
                    <h4 className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-blanco">Historial de Transacciones</h4>
                    <span className="text-[0.6rem] font-black text-gris uppercase bg-marino-4 px-3 py-1.5 rounded-full ring-1 ring-marino-4">{resumen?.cobros.length} REGISTROS</span>
                </div>

                {/* Vista MOBILE: Cards / Vista DESKTOP: Table */}
                <div className="block md:hidden divide-y divide-marino-4">
                    {resumen?.cobros.length === 0 ? (
                        <div className="p-16 text-center">
                            <Info size={32} className="mx-auto text-marino-4 mb-4" />
                            <p className="text-[0.65rem] font-bold text-gris-claro uppercase tracking-widest leading-relaxed">Sin registros de pago<br />en el historial actual.</p>
                        </div>
                    ) : resumen?.cobros.map((cobro: CobroConPlan) => (
                        <div key={cobro.id} className="p-5 active:bg-marino-3/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-[0.6rem] font-black text-gris uppercase tracking-widest">{new Date(cobro.fecha).toLocaleDateString('es-AR')}</p>
                                    <h5 className="text-sm font-black text-blanco uppercase mt-0.5">{cobro.planAsignado?.plan?.nombre || "Pago Manual"}</h5>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-barlow-condensed font-black text-verde italic leading-tight">${cobro.montoArs.toLocaleString()}</p>
                                    <span className="text-[0.55rem] font-bold text-gris-claro uppercase tracking-tight">{cobro.metodo}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-marino-4/30">
                                <Clock size={12} className="text-naranja" />
                                <p className="text-[0.6rem] font-medium text-gris uppercase tracking-wider">
                                    Periodo {new Date(cobro.periodoDesde).toLocaleDateString()} al {new Date(cobro.periodoHasta).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-marino-3/50 text-[0.6rem] font-black uppercase tracking-widest text-gris border-b border-marino-4">
                                <th className="p-5">Fecha de Cobro</th>
                                <th className="p-5">Plan / Membresía</th>
                                <th className="p-5">Método de Pago</th>
                                <th className="p-5">Periodo Cubierto</th>
                                <th className="p-5 text-right">Monto (ARS)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {resumen?.cobros.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Info size={40} className="mx-auto text-marino-4 mb-4" />
                                        <p className="text-[0.65rem] font-black text-gris uppercase tracking-[0.2em] italic">Aún no se han registrado cobros para este cliente.</p>
                                    </td>
                                </tr>
                            ) : resumen?.cobros.map((cobro: CobroConPlan) => (
                                <tr key={cobro.id} className="hover:bg-marino-3/30 transition-colors group">
                                    <td className="p-5">
                                        <p className="text-sm font-bold text-blanco uppercase">{new Date(cobro.fecha).toLocaleDateString()}</p>
                                        <p className="text-[0.55rem] text-gris uppercase font-black tracking-tighter opacity-50 mt-0.5">ID: {cobro.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-[0.65rem] font-black text-naranja uppercase tracking-widest italic flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-naranja shadow-[0_0_8px_rgba(232,119,23,0.5)]"></div>
                                            {cobro.planAsignado?.plan?.nombre || "Pago Manual / Ajuste"}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-[0.6rem] font-black text-gris-claro uppercase tracking-[0.2em] bg-marino-3 px-3 py-1.5 rounded-lg border border-marino-4">
                                            {cobro.metodo}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-[0.65rem] font-bold text-blanco uppercase tracking-widest">
                                            {new Date(cobro.periodoDesde).toLocaleDateString()} — {new Date(cobro.periodoHasta).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-5 text-right">
                                        <span className="text-2xl font-barlow-condensed font-black text-verde italic group-hover:scale-110 inline-block transition-transform">
                                            ${cobro.montoArs.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <ModalRegistrarPago
                    clienteId={clienteId}
                    clienteNombre={clienteNombre}
                    planesAsignados={resumen?.planActivo ? [resumen.planActivo] : []}
                    onClose={() => {
                        setModalOpen(false);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
