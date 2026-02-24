"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, MoreVertical, Ban, CheckCircle } from "lucide-react";
import ModalAsignarPlan from "./ModalAsignarPlan";
import { cambiarEstadoPagoPlan, alternarEstadoCliente } from "@/nucleo/acciones/cliente.accion";

interface PlanAsignado {
    id: string;
    plan: { nombre: string };
    fechaVencimiento: string | Date;
    fechaInicio: string | Date;
    estado: string; // "ABONADO", "PENDIENTE", "PARCIAL", "VENCIDO"
}

interface Cliente {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    activo: boolean;
    fechaAlta: string | Date;
    planesAsignados: PlanAsignado[];
    formularioInscripcion: unknown;
}

interface Plan {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
}

interface Props {
    clientes: Cliente[];
    planes: Plan[];
    tabActual: "activos" | "inactivos" | "inscripciones";
}

const ESTADOS_PAGO = [
    { value: "ABONADO", label: "Abonado", color: "bg-verde" },
    { value: "PARCIAL", label: "Parcial", color: "bg-[#eab308]" },
    { value: "PENDIENTE", label: "Pendiente", color: "bg-gris-claro" },
    { value: "VENCIDO", label: "Vencido", color: "bg-rojo" }
];

export default function ListadoClientes({ clientes, planes, tabActual }: Props) {
    const [clienteAsignando, setClienteAsignando] = useState<{ id: string, nombre: string } | null>(null);
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function formatPhone(phone: string | null) {
        if (!phone) return null;
        const cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.length > 5 ? cleaned : null;
    }

    // Handlers
    function handleUpdateEstadoPago(planAsignadoId: string, nuevoEstado: string) {
        startTransition(async () => {
            const res = await cambiarEstadoPagoPlan(planAsignadoId, nuevoEstado);
            if (!res.exito) alert(res.error || "No se pudo cambiar el estado");
        });
    }

    function handleToggleStatus(id: string, activo: boolean) {
        startTransition(async () => {
            setMenuAbierto(null);
            const res = await alternarEstadoCliente(id, activo);
            if (!res.exito) alert(res.error || "No se pudo actualizar el cliente");
        });
    }

    return (
        <div className="bg-[#12182b] border border-[#1a233a] rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-center text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b-2 border-[#1a233a] bg-[#1a233a]/50">
                            <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Nombre</th>
                            <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Contacto</th>

                            {tabActual === "activos" && (
                                <>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Plan Vigente</th>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Pago</th>
                                </>
                            )}

                            {tabActual === "inactivos" && (
                                <>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Último Plan</th>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Vencimiento</th>
                                </>
                            )}

                            {tabActual === "inscripciones" && (
                                <>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Seleccionar Plan</th>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Fecha de Ingreso</th>
                                </>
                            )}

                            <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem] text-right">Perfil</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#1a233a] bg-[#12182b]">
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center text-gris italic">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <Users size={40} />
                                        <p className="font-bold tracking-widest uppercase">No hay clientes ({tabActual})</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            clientes.map((cliente) => {
                                const ultimoPlan = cliente.planesAsignados?.[0];
                                const whatsappNumber = formatPhone(cliente.telefono);

                                return (
                                    <tr key={cliente.id} className="hover:bg-[#1a233a] transition-all duration-300 group">
                                        {/* NOMBRE & AVATAR */}
                                        <td className="py-4 px-4 font-medium text-blanco flex items-center gap-4 min-w-[200px] border-r border-[#1a233a]/50 h-full">
                                            <div className="w-10 h-10 rounded-full bg-blanco border-2 border-[#1a233a] flex items-center justify-center text-[0.5rem] text-marino font-black uppercase overflow-hidden shadow-lg shadow-blanco/5 shrink-0">
                                                FOTO<br />PERFIL
                                            </div>
                                            <span className="font-bold text-blanco/90 whitespace-normal text-left break-words">{cliente.nombre}</span>
                                        </td>

                                        {/* CONTACTO */}
                                        <td className="py-4 px-4 border-r border-[#1a233a]/50">
                                            {whatsappNumber ? (
                                                <a
                                                    href={`https://wa.me/${whatsappNumber}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20"
                                                >
                                                    {cliente.telefono}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gris-claro/50">{cliente.telefono || '-'}</span>
                                            )}
                                        </td>

                                        {/* CELDAS CENTRALES DINAMICAS */}
                                        {tabActual === "activos" && (
                                            <>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50">
                                                    {ultimoPlan?.plan?.nombre && (
                                                        <span className="font-barlow-condensed italic font-black text-[#f5f5f5] uppercase tracking-tighter text-base">
                                                            {ultimoPlan.plan.nombre}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50">
                                                    <div className="relative inline-block w-full max-w-[150px]">
                                                        {ultimoPlan && (
                                                            <select
                                                                className="appearance-none w-full bg-[#0a101f] border border-[#1a233a] text-[#f5f5f5] text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-lg py-2 pl-7 pr-8 cursor-pointer focus:outline-none focus:border-naranja shadow-inner"
                                                                value={ultimoPlan.estado || "PENDIENTE"}
                                                                onChange={(e) => handleUpdateEstadoPago(ultimoPlan.id, e.target.value)}
                                                                disabled={isPending}
                                                            >
                                                                {ESTADOS_PAGO.map(est => (
                                                                    <option key={est.value} value={est.value}>{est.label}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                        {/* Icono indicador del estado actual superpuesto */}
                                                        {ultimoPlan && (
                                                            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-[#0a101f] ${ESTADOS_PAGO.find(e => e.value === ultimoPlan.estado)?.color || 'bg-gris-claro'}`}
                                                                style={{ backgroundColor: ESTADOS_PAGO.find(e => e.value === ultimoPlan.estado)?.value === "ABONADO" ? "#22c55e" : ESTADOS_PAGO.find(e => e.value === ultimoPlan.estado)?.value === "VENCIDO" ? "#ef4444" : ESTADOS_PAGO.find(e => e.value === ultimoPlan.estado)?.value === "PARCIAL" ? "#eab308" : "#9ca3af" }} />
                                                        )}
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-naranja">
                                                            ⌄
                                                        </div>
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {tabActual === "inactivos" && (
                                            <>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50 text-gris">
                                                    {ultimoPlan?.plan?.nombre
                                                        ? <span className="font-barlow-condensed font-black tracking-widest text-[#f5f5f5]/70 uppercase">{ultimoPlan.plan.nombre}</span>
                                                        : '-'}
                                                </td>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50 text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                    {ultimoPlan?.fechaVencimiento ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR') : '-'}
                                                </td>
                                            </>
                                        )}

                                        {tabActual === "inscripciones" && (
                                            <>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50">
                                                    <button
                                                        onClick={() => setClienteAsignando({ id: cliente.id, nombre: cliente.nombre })}
                                                        className="text-xs font-bold uppercase tracking-widest text-naranja border border-naranja/30 bg-naranja/5 py-1.5 px-4 rounded-lg hover:bg-naranja hover:text-marino transition-all relative pr-8"
                                                    >
                                                        Desplegar
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70">⌄</span>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 border-r border-[#1a233a]/50 text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                    {new Date(cliente.fechaAlta).toLocaleDateString('es-AR')}
                                                </td>
                                            </>
                                        )}

                                        {/* ACCIONES FINALES */}
                                        <td className="py-4 px-4 text-right flex items-center justify-end h-full gap-2 relative min-w-[120px]">
                                            <Link
                                                href={`/entrenador/clientes/${cliente.id}`}
                                                className="bg-[#e87717] hover:bg-[#ff8620] text-blanco px-5 py-2 rounded-full font-barlow-condensed font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-naranja/20"
                                            >
                                                Perfil
                                            </Link>

                                            {/* Dropdown 3 dots solo para activos/inactivos */}
                                            {(tabActual === "activos" || tabActual === "inactivos") && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setMenuAbierto(menuAbierto === cliente.id ? null : cliente.id)}
                                                        className="p-2 text-gris hover:text-blanco bg-[#0a101f] border border-[#1a233a] rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {menuAbierto === cliente.id && (
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#151c2e] border border-[#2b3552] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden fade-in duration-200">
                                                            {tabActual === "activos" ? (
                                                                <button
                                                                    onClick={() => handleToggleStatus(cliente.id, false)}
                                                                    disabled={isPending}
                                                                    className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-rojo hover:bg-[#0a101f] flex items-center gap-2"
                                                                >
                                                                    <Ban size={14} /> Suspender Cliente
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleToggleStatus(cliente.id, true)}
                                                                        disabled={isPending}
                                                                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-verde hover:bg-[#0a101f] flex items-center gap-2 border-b border-[#2b3552]"
                                                                    >
                                                                        <CheckCircle size={14} /> Reactivar Acceso
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setMenuAbierto(null); setClienteAsignando({ id: cliente.id, nombre: cliente.nombre }) }}
                                                                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-naranja hover:bg-[#0a101f] flex items-center gap-2"
                                                                    >
                                                                        Asignar Nuevo Plan
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {clienteAsignando && (
                <ModalAsignarPlan
                    clienteId={clienteAsignando.id}
                    clienteNombre={clienteAsignando.nombre}
                    planes={planes}
                    onClose={() => setClienteAsignando(null)}
                />
            )}
        </div>
    );
}
