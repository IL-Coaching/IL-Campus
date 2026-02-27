"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, MoreVertical, Ban, CheckCircle2, MessageCircle, CreditCard } from "lucide-react";
import ModalAsignarPlan from "./ModalAsignarPlan";
import ModalGestionPago from "./ModalGestionPago";
import { alternarEstadoCliente } from "@/nucleo/acciones/cliente.accion";

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
    const [clienteAsignando, setClienteAsignando] = useState<{ id: string, nombre: string, ultimoPlanVencimiento?: string | Date } | null>(null);
    const [clientePago, setClientePago] = useState<{ clienteId: string, planAsignadoId: string, nombre: string, estado: string } | null>(null);
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function formatPhone(phone: string | null) {
        if (!phone) return null;
        const cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.length > 5 ? cleaned : null;
    }

    // Handlers
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
                <table className="w-full text-center text-sm md:whitespace-nowrap">
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
                                    <tr key={cliente.id} className="block md:table-row hover:bg-marino-3/30 transition-all duration-300 md:border-b-0 border-b border-marino-4/50 md:p-0 p-4 relative mb-2 md:mb-0 bg-marino-2 md:bg-transparent rounded-2xl md:rounded-none">
                                        {/* NOMBRE & AVATAR (Vista Card en Mobile) */}
                                        <td className="block md:table-cell py-2 md:py-6 md:px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group shrink-0">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-naranja to-azul-claro rounded-full opacity-20 blur-sm group-hover:opacity-100 transition duration-500"></div>
                                                    <div className="relative w-12 h-12 rounded-full bg-marino-3 border-2 border-marino-4 flex items-center justify-center text-[0.6rem] text-naranja font-black uppercase overflow-hidden">
                                                        {cliente.nombre.substring(0, 2)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-barlow-condensed font-black text-blanco text-lg uppercase leading-tight truncate">{cliente.nombre}</p>
                                                    <p className="text-[0.65rem] text-gris font-medium uppercase tracking-widest truncate">{cliente.email}</p>
                                                </div>
                                                {/* Acceso Rápido WPP en Mobile */}
                                                {whatsappNumber && (
                                                    <div className="md:hidden">
                                                        <a
                                                            href={`https://wa.me/${whatsappNumber}`}
                                                            target="_blank"
                                                            className="w-10 h-10 bg-verde/10 text-verde rounded-xl flex items-center justify-center border border-verde/20 active:scale-90 transition-all"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* CONTACTO (Solo Desktop) */}
                                        <td className="hidden md:table-cell py-4 px-4 border-l border-marino-4/30">
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
                                        {/* INFO DE PLAN (Flexible) */}
                                        {tabActual === "activos" && (
                                            <>
                                                <td className="block md:table-cell py-1 md:py-4 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between gap-1">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Inicio</span>
                                                        <span className="text-xs font-black text-gris-claro uppercase tracking-widest">
                                                            {ultimoPlan?.fechaInicio ? new Date(ultimoPlan.fechaInicio).toLocaleDateString('es-AR') : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell py-1 md:py-4 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between gap-1">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Vencimiento</span>
                                                        <span className={`text-xs font-black uppercase tracking-widest ${ultimoPlan && new Date(ultimoPlan.fechaVencimiento) < new Date() ? 'text-rojo' : 'text-gris-claro'
                                                            }`}>
                                                            {ultimoPlan?.fechaVencimiento ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR') : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell py-1 md:py-4 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between gap-1">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Membresía</span>
                                                        <span className="font-barlow-condensed font-black text-naranja uppercase tracking-widest text-sm text-right md:text-center">
                                                            {ultimoPlan?.plan?.nombre || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell py-3 md:py-4 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between gap-3">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Estado Pago</span>
                                                        {ultimoPlan && (
                                                            <button
                                                                onClick={() => setClientePago({ clienteId: cliente.id, planAsignadoId: ultimoPlan.id, nombre: cliente.nombre, estado: ultimoPlan.estado })}
                                                                className={`w-full max-w-[140px] flex items-center justify-center gap-2 bg-marino-3 border border-marino-4 text-[0.65rem] font-black uppercase tracking-widest rounded-xl py-2.5 transition-all hover:border-naranja active:scale-95 ${ultimoPlan.estado === 'ABONADO' ? 'text-verde' : 'text-blanco'
                                                                    }`}
                                                            >
                                                                <div className={`w-2.5 h-2.5 rounded-full ${ESTADOS_PAGO.find(e => e.value === (ultimoPlan.estado || "PENDIENTE"))?.color} shadow-[0_0_8px_currentColor]`} />
                                                                {ESTADOS_PAGO.find(e => e.value === (ultimoPlan.estado || "PENDIENTE"))?.label}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {tabActual === "inactivos" && (
                                            <>
                                                <td className="block md:table-cell py-2 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Último Plan</span>
                                                        <span className="font-barlow-condensed font-black tracking-widest text-gris-claro uppercase">{ultimoPlan?.plan?.nombre || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell py-2 px-0 md:px-4 md:border-l border-marino-4/30 text-right md:text-center">
                                                    <div className="flex md:flex-col items-center justify-between">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Vencimiento</span>
                                                        <span className="text-xs font-bold text-gris uppercase tracking-widest">
                                                            {ultimoPlan?.fechaVencimiento ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR') : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {tabActual === "inscripciones" && (
                                            <>
                                                <td className="block md:table-cell py-2 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <div className="flex md:flex-col items-center justify-between">
                                                        <span className="md:hidden text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Ingreso</span>
                                                        <span className="text-xs font-bold text-gris-claro uppercase tracking-widest">
                                                            {new Date(cliente.fechaAlta).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="block md:table-cell py-3 px-0 md:px-4 md:border-l border-marino-4/30">
                                                    <button
                                                        onClick={() => setClienteAsignando({
                                                            id: cliente.id,
                                                            nombre: cliente.nombre,
                                                            ultimoPlanVencimiento: ultimoPlan?.fechaVencimiento
                                                        })}
                                                        className="w-full md:w-auto px-6 py-3 bg-naranja/10 text-naranja border border-naranja/20 rounded-xl text-[0.65rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                                                    >
                                                        Asignar Plan Inicial
                                                    </button>
                                                </td>
                                            </>
                                        )}

                                        {/* ACCIONES FINALES */}
                                        <td className="block md:table-cell py-4 md:py-4 px-0 md:px-4 md:border-l border-marino-4/30">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/entrenador/clientes/${cliente.id}`}
                                                    className="flex-1 text-center bg-marino-4 hover:bg-marino-3 text-blanco py-4 md:py-2 px-4 rounded-xl md:rounded-full font-black text-[0.65rem] uppercase tracking-[0.2em] transition-all border border-marino shadow-sm active:scale-95"
                                                >
                                                    Abrir Perfil
                                                </Link>
                                                {(tabActual === "activos" || tabActual === "inactivos") && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === cliente.id ? null : cliente.id) }}
                                                        className="p-4 md:p-2 bg-marino-3 border border-marino-4 rounded-xl text-gris hover:text-blanco transition-colors active:scale-90"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                )}
                                            </div>

                                            {menuAbierto === cliente.id && (
                                                <div className="fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:top-full z-[110] p-4 md:p-0 md:mt-2">
                                                    <div className="fixed inset-0 bg-marino/80 backdrop-blur-sm md:hidden" onClick={() => setMenuAbierto(null)}></div>
                                                    <div className="relative bg-marino-2 border border-marino-4 rounded-3xl md:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                                                        <div className="w-12 h-1.5 bg-marino-4 rounded-full mx-auto my-4 md:hidden opacity-50"></div>
                                                        {tabActual === "activos" ? (
                                                            <button
                                                                onClick={() => handleToggleStatus(cliente.id, false)}
                                                                disabled={isPending}
                                                                className="w-full text-left px-8 py-6 md:px-4 md:py-3 text-[0.65rem] font-black uppercase tracking-widest text-rojo hover:bg-rojo/10 flex items-center gap-4 transition-colors active:bg-rojo/20"
                                                            >
                                                                <Ban size={20} /> Suspender Acceso
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleStatus(cliente.id, true)}
                                                                    disabled={isPending}
                                                                    className="w-full text-left px-8 py-6 md:px-4 md:py-3 text-[0.65rem] font-black uppercase tracking-widest text-verde hover:bg-verde/10 flex items-center gap-4 border-b border-marino-4 transition-colors active:bg-verde/20"
                                                                >
                                                                    <CheckCircle2 size={20} /> Reactivar Cliente
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setMenuAbierto(null);
                                                                        setClienteAsignando({
                                                                            id: cliente.id,
                                                                            nombre: cliente.nombre,
                                                                            ultimoPlanVencimiento: ultimoPlan?.fechaVencimiento
                                                                        })
                                                                    }}
                                                                    className="w-full text-left px-8 py-6 md:px-4 md:py-3 text-[0.65rem] font-black uppercase tracking-widest text-naranja hover:bg-naranja/10 flex items-center gap-4 transition-colors active:bg-naranja/20 md:pb-3 pb-12"
                                                                >
                                                                    <CreditCard size={20} /> Nueva Membresía
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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
                    ultimoPlanVencimiento={clienteAsignando.ultimoPlanVencimiento}
                    planes={planes}
                    onClose={() => setClienteAsignando(null)}
                />
            )}

            {clientePago && (
                <ModalGestionPago
                    data={clientePago}
                    onClose={() => setClientePago(null)}
                />
            )}
        </div>
    );
}
