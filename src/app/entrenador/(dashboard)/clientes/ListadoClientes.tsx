"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, MoreVertical, Ban, CheckCircle2 } from "lucide-react";
import ModalAsignarPlan from "./ModalAsignarPlan";
import { cambiarEstadoPagoPlan, alternarEstadoCliente } from "@/nucleo/acciones/cliente.accion";

interface PlanAsignado {
    id: string;
    plan: { nombre: string };
    fechaVencimiento: string | Date;
    fechaInicio: string | Date; // agregado
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
        <div className="bg-[#12182b] border border-[#1a233a] rounded-xl shadow-2xl">
            {/* Solo aplicamos overflow en mobile para evitar que se escapan las cards, 
                pero NO en desktop para que el dropdown flote libremente */}
            <div className="w-full">
                <table className="w-full text-center text-sm whitespace-nowrap md:whitespace-normal">
                    <thead className="hidden md:table-header-group">
                        <tr className="border-b-2 border-[#1a233a] bg-[#1a233a]/50">
                            <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem] text-left md:text-center w-full md:w-auto">Nombre</th>
                            <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Contacto</th>

                            {tabActual === "activos" && (
                                <>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Inicio</th>
                                    <th className="py-5 px-4 font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] text-[0.8rem]">Vencimiento</th>
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
                                    <tr key={cliente.id} className="block md:table-row hover:bg-[#1a233a] transition-all duration-300 group border-b border-[#1a233a] md:border-b-0 mb-4 md:mb-0 bg-marino-2 md:bg-transparent rounded-xl md:rounded-none p-4 md:p-0">
                                        {/* NOMBRE & AVATAR */}
                                        <td className="flex items-center gap-4 py-2 md:py-4 px-2 md:px-4 font-medium text-blanco min-w-[200px] border-b md:border-b-0 md:border-r border-[#1a233a]/50 md:h-full md:table-cell text-left md:text-center w-full md:w-auto">
                                            <div className="flex items-center gap-4 w-full justify-between md:justify-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blanco border-2 border-[#1a233a] flex items-center justify-center text-[0.5rem] text-marino font-black uppercase overflow-hidden shadow-lg shadow-blanco/5 shrink-0">
                                                        FOTO<br />PERFIL
                                                    </div>
                                                    <span className="font-bold text-blanco whitespace-normal text-left break-words">{cliente.nombre}</span>
                                                </div>
                                                {/* En mobile agregamos las acciones resumidas al costado del nombre si es posible o un icono extra */}
                                            </div>
                                        </td>

                                        {/* CONTACTO */}
                                        <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                            <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Contacto</span>
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
                                        {/* CELDAS CENTRALES DINAMICAS */}
                                        {tabActual === "activos" && (
                                            <>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                                    <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Inicio</span>
                                                    <span className="text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                        {ultimoPlan?.fechaInicio ? new Date(ultimoPlan.fechaInicio).toLocaleDateString('es-AR') : '-'}
                                                    </span>
                                                </td>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                                    <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Vencimiento</span>
                                                    <span className="text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                        {ultimoPlan?.fechaVencimiento ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR') : '-'}
                                                    </span>
                                                </td>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                                    <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Plan</span>
                                                    {ultimoPlan?.plan?.nombre ? (
                                                        <span className="font-barlow-condensed font-black text-[#f5f5f5] uppercase tracking-widest text-sm">
                                                            {ultimoPlan.plan.nombre}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gris">-</span>
                                                    )}
                                                </td>
                                                <td className="block md:table-cell py-3 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                                    <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Pago</span>
                                                    <div className="relative inline-block w-full md:max-w-[150px]">
                                                        {ultimoPlan && (
                                                            <select
                                                                className="appearance-none w-full bg-[#0a101f] border border-[#1a233a]  text-[#f5f5f5] text-[10px] md:text-[11px] font-bold uppercase tracking-widest rounded-lg py-3 md:py-2 pl-8 pr-8 cursor-pointer focus:outline-none focus:border-naranja shadow-inner"
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
                                                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-[#0a101f] ${ESTADOS_PAGO.find(e => e.value === ultimoPlan.estado)?.color || 'bg-gris-claro'}`}
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
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center text-gris">
                                                    <span className="md:hidden text-xs font-bold text-gris/50 uppercase tracking-widest block mb-1">Último Plan</span>
                                                    {ultimoPlan?.plan?.nombre
                                                        ? <span className="font-barlow-condensed font-black tracking-widest text-[#f5f5f5]/70 uppercase">{ultimoPlan.plan.nombre}</span>
                                                        : '-'}
                                                </td>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                    <span className="md:hidden text-xs font-bold text-gris/50 uppercase tracking-widest block mb-1">Vencimiento</span>
                                                    {ultimoPlan?.fechaVencimiento ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR') : '-'}
                                                </td>
                                            </>
                                        )}

                                        {tabActual === "inscripciones" && (
                                            <>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center">
                                                    <span className="md:hidden text-xs font-bold text-gris uppercase tracking-widest block mb-1">Seleccionar Plan</span>
                                                    <button
                                                        onClick={() => setClienteAsignando({ id: cliente.id, nombre: cliente.nombre })}
                                                        className="text-xs font-bold uppercase tracking-widest text-naranja border border-naranja/30 bg-naranja/5 py-2 px-4 rounded-lg hover:bg-naranja hover:text-marino transition-all relative pr-8 w-full md:w-auto"
                                                    >
                                                        Desplegar
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70">⌄</span>
                                                    </button>
                                                </td>
                                                <td className="block md:table-cell py-2 md:py-4 px-2 md:px-4 md:border-r border-[#1a233a]/50 text-left md:text-center text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                    <span className="md:hidden text-xs font-bold text-gris/50 uppercase tracking-widest block mb-1">Fecha Ingreso</span>
                                                    {new Date(cliente.fechaAlta).toLocaleDateString('es-AR')}
                                                </td>
                                            </>
                                        )}

                                        {/* ACCIONES FINALES */}
                                        <td className="block md:table-cell py-4 px-2 md:px-4 border-t border-[#1a233a]/50 md:border-t-0 text-right h-full static md:relative min-w-[120px]">
                                            <div className="flex flex-row md:flex-row items-center justify-end w-full gap-2">
                                                <Link
                                                    href={`/entrenador/clientes/${cliente.id}`}
                                                    className="flex-1 md:flex-none text-center bg-[#e87717] hover:bg-[#ff8620] text-blanco px-5 py-2.5 md:py-2 rounded-lg md:rounded-full font-barlow-condensed font-black text-sm md:text-xs uppercase tracking-widest transition-all shadow-md shadow-naranja/20"
                                                >
                                                    Perfil
                                                </Link>

                                                {/* Dropdown 3 dots solo para activos/inactivos */}
                                                {(tabActual === "activos" || tabActual === "inactivos") && (
                                                    <div className="relative static md:relative w-12 md:w-auto shrink-0 flex justify-end">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === cliente.id ? null : cliente.id) }}
                                                            className="p-2 text-gris hover:text-blanco bg-[#0a101f] border border-[#1a233a] rounded-lg transition-colors h-full flex items-center justify-center w-full md:w-auto"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {menuAbierto === cliente.id && (
                                                            <>
                                                                <div className="fixed md:hidden inset-0 z-40 bg-negro/50" onClick={() => setMenuAbierto(null)}></div>
                                                                <div className="fixed md:absolute bottom-0 left-0 w-full md:max-w-max md:w-48 md:bottom-auto md:right-0 md:-left-auto md:top-full md:mt-2 bg-[#151c2e] border-t md:border border-[#2b3552] rounded-t-2xl md:rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] md:shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden fade-in duration-200">
                                                                    <div className="w-12 h-1.5 bg-marino-4 rounded-full mx-auto my-3 md:hidden"></div>
                                                                    {tabActual === "activos" ? (
                                                                        <button
                                                                            onClick={() => handleToggleStatus(cliente.id, false)}
                                                                            disabled={isPending}
                                                                            className="w-full text-left px-6 py-5 md:px-4 md:py-3 text-sm md:text-xs font-bold uppercase tracking-widest text-rojo hover:bg-[#0a101f] flex items-center gap-3 md:gap-2 active:bg-marino-4"
                                                                        >
                                                                            <Ban size={18} className="md:w-[14px] md:h-[14px]" /> Suspender Cliente
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleToggleStatus(cliente.id, true)}
                                                                                disabled={isPending}
                                                                                className="w-full text-left px-6 py-5 md:px-4 md:py-3 text-sm md:text-xs font-bold uppercase tracking-widest text-verde hover:bg-[#0a101f] flex items-center gap-3 md:gap-2 active:bg-marino-4 border-b border-[#2b3552]"
                                                                            >
                                                                                <CheckCircle2 size={18} className="md:w-[14px] md:h-[14px]" /> Reactivar Acceso
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setMenuAbierto(null); setClienteAsignando({ id: cliente.id, nombre: cliente.nombre }) }}
                                                                                className="w-full text-left px-6 py-5 md:px-4 md:py-3 text-sm md:text-xs font-bold uppercase tracking-widest text-naranja hover:bg-[#0a101f] flex items-center gap-3 md:gap-2 active:bg-marino-4 pb-8 md:pb-3"
                                                                            >
                                                                                Asignar Nuevo Plan
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
