"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, MoreVertical, Ban, CheckCircle2, MessageCircle, CreditCard, ChevronRight } from "lucide-react";
import ModalAsignarPlan from "./ModalAsignarPlan";
import ModalGestionPago from "./ModalGestionPago";
import { alternarEstadoCliente } from "@/nucleo/acciones/cliente.accion";

interface PlanAsignado {
    id: string;
    plan: { nombre: string };
    fechaVencimiento: string | Date;
    fechaInicio: string | Date;
    estado: string;
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

const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
    ABONADO: { label: "Abonado", cls: "text-verde  bg-verde/10  border-verde/20" },
    PARCIAL: { label: "Parcial", cls: "text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20" },
    PENDIENTE: { label: "Pendiente", cls: "text-gris   bg-marino-3  border-marino-4" },
    VENCIDO: { label: "Vencido", cls: "text-rojo   bg-rojo/10   border-rojo/20" },
};

function Iniciales({ nombre }: { nombre: string }) {
    const partes = nombre.trim().split(" ");
    const ini = partes.length >= 2
        ? (partes[0][0] + partes[1][0]).toUpperCase()
        : nombre.substring(0, 2).toUpperCase();
    return (
        <div className="w-9 h-9 rounded-lg bg-naranja/10 border border-naranja/20 flex items-center justify-center text-[0.6rem] text-naranja font-black shrink-0">
            {ini}
        </div>
    );
}

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

    function handleToggleStatus(id: string, activo: boolean) {
        startTransition(async () => {
            setMenuAbierto(null);
            const res = await alternarEstadoCliente(id, activo);
            if (!res.exito) alert(res.error || "No se pudo actualizar el cliente");
        });
    }

    const thCls = "py-3 px-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs text-left";

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">

            {/* ── VISTA DESKTOP: Tabla ── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-marino-4 bg-marino-3/30">
                            <th className={thCls}>Cliente</th>
                            <th className={thCls}>Contacto</th>

                            {tabActual === "activos" && (<>
                                <th className={thCls}>Inicio</th>
                                <th className={thCls}>Vencimiento</th>
                                <th className={thCls}>Plan Vigente</th>
                                <th className={thCls}>Estado</th>
                            </>)}

                            {tabActual === "inactivos" && (<>
                                <th className={thCls}>Último Plan</th>
                                <th className={thCls}>Venció</th>
                            </>)}

                            {tabActual === "inscripciones" && (<>
                                <th className={thCls}>Ingreso</th>
                                <th className={thCls}>Acción</th>
                            </>)}

                            <th className={`${thCls} text-right`}>Perfil</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-marino-4/50">
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <Users size={36} />
                                        <p className="font-bold tracking-widest uppercase text-xs text-gris">
                                            Sin clientes en esta sección
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            clientes.map((cliente) => {
                                const ultimoPlan = cliente.planesAsignados?.[0];
                                const whatsappNumber = formatPhone(cliente.telefono);
                                const estadoCfg = ESTADO_CONFIG[ultimoPlan?.estado || "PENDIENTE"] ?? ESTADO_CONFIG.PENDIENTE;
                                const vencido = ultimoPlan && new Date(ultimoPlan.fechaVencimiento) < new Date();

                                return (
                                    <tr key={cliente.id} className="hover:bg-marino-3/20 transition-colors group">

                                        {/* Cliente */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <Iniciales nombre={cliente.nombre} />
                                                <div className="min-w-0">
                                                    <p className="font-barlow-condensed font-black text-blanco text-base uppercase leading-tight truncate">
                                                        {cliente.nombre}
                                                    </p>
                                                    <p className="text-[0.65rem] text-gris truncate">{cliente.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contacto */}
                                        <td className="py-4 px-4">
                                            {whatsappNumber ? (
                                                <a
                                                    href={`https://wa.me/${whatsappNumber}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-bold text-gris-claro hover:text-verde transition-colors"
                                                >
                                                    {cliente.telefono}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gris/40">—</span>
                                            )}
                                        </td>

                                        {/* Activos */}
                                        {tabActual === "activos" && (<>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-gris-claro">
                                                    {ultimoPlan?.fechaInicio
                                                        ? new Date(ultimoPlan.fechaInicio).toLocaleDateString('es-AR')
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold ${vencido ? 'text-rojo' : 'text-gris-claro'}`}>
                                                    {ultimoPlan?.fechaVencimiento
                                                        ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR')
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-barlow-condensed font-black text-naranja uppercase tracking-wide text-sm">
                                                    {ultimoPlan?.plan?.nombre || '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {ultimoPlan && (
                                                    <button
                                                        onClick={() => setClientePago({
                                                            clienteId: cliente.id,
                                                            planAsignadoId: ultimoPlan.id,
                                                            nombre: cliente.nombre,
                                                            estado: ultimoPlan.estado
                                                        })}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[0.65rem] font-black uppercase tracking-widest transition-all hover:brightness-110 ${estadoCfg.cls}`}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {estadoCfg.label}
                                                    </button>
                                                )}
                                            </td>
                                        </>)}

                                        {/* Inactivos */}
                                        {tabActual === "inactivos" && (<>
                                            <td className="py-4 px-4">
                                                <span className="font-barlow-condensed font-black text-gris uppercase tracking-wide">
                                                    {ultimoPlan?.plan?.nombre || '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-rojo/70">
                                                    {ultimoPlan?.fechaVencimiento
                                                        ? new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR')
                                                        : '—'}
                                                </span>
                                            </td>
                                        </>)}

                                        {/* Inscripciones */}
                                        {tabActual === "inscripciones" && (<>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-bold text-gris-claro">
                                                    {new Date(cliente.fechaAlta).toLocaleDateString('es-AR')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => setClienteAsignando({
                                                        id: cliente.id,
                                                        nombre: cliente.nombre,
                                                        ultimoPlanVencimiento: ultimoPlan?.fechaVencimiento
                                                    })}
                                                    className="px-4 py-2 bg-naranja text-marino rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all hover:bg-naranja-h active:scale-95"
                                                >
                                                    Asignar Plan
                                                </button>
                                            </td>
                                        </>)}

                                        {/* Acciones */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-1.5 relative">
                                                <Link
                                                    href={`/entrenador/clientes/${cliente.id}`}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-marino-3 hover:bg-marino-4 text-gris-claro hover:text-blanco rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all border border-marino-4 group-hover:border-marino-3"
                                                >
                                                    Ver Perfil
                                                    <ChevronRight size={12} className="opacity-60" />
                                                </Link>

                                                {(tabActual === "activos" || tabActual === "inactivos") && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMenuAbierto(menuAbierto === cliente.id ? null : cliente.id);
                                                            }}
                                                            className="p-2 bg-marino-3 border border-marino-4 rounded-lg text-gris hover:text-blanco transition-colors"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {menuAbierto === cliente.id && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-40"
                                                                    onClick={() => setMenuAbierto(null)}
                                                                />
                                                                <div className="absolute right-0 top-full mt-1.5 z-50 bg-marino-2 border border-marino-4 rounded-xl shadow-2xl overflow-hidden min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
                                                                    {tabActual === "activos" ? (
                                                                        <button
                                                                            onClick={() => handleToggleStatus(cliente.id, false)}
                                                                            disabled={isPending}
                                                                            className="w-full text-left px-4 py-3 text-[0.65rem] font-black uppercase tracking-widest text-rojo hover:bg-rojo/10 flex items-center gap-3 transition-colors"
                                                                        >
                                                                            <Ban size={14} /> Suspender
                                                                        </button>
                                                                    ) : (<>
                                                                        <button
                                                                            onClick={() => handleToggleStatus(cliente.id, true)}
                                                                            disabled={isPending}
                                                                            className="w-full text-left px-4 py-3 text-[0.65rem] font-black uppercase tracking-widest text-verde hover:bg-verde/10 flex items-center gap-3 border-b border-marino-4 transition-colors"
                                                                        >
                                                                            <CheckCircle2 size={14} /> Reactivar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setMenuAbierto(null);
                                                                                setClienteAsignando({
                                                                                    id: cliente.id,
                                                                                    nombre: cliente.nombre,
                                                                                    ultimoPlanVencimiento: ultimoPlan?.fechaVencimiento
                                                                                });
                                                                            }}
                                                                            className="w-full text-left px-4 py-3 text-[0.65rem] font-black uppercase tracking-widest text-naranja hover:bg-naranja/10 flex items-center gap-3 transition-colors"
                                                                        >
                                                                            <CreditCard size={14} /> Nueva Membresía
                                                                        </button>
                                                                    </>)}
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

            {/* ── VISTA MOBILE: Cards ── */}
            <div className="block md:hidden divide-y divide-marino-4/50">
                {clientes.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                            <Users size={32} />
                            <p className="font-bold tracking-widest uppercase text-xs text-gris">Sin clientes</p>
                        </div>
                    </div>
                ) : (
                    clientes.map((cliente) => {
                        const ultimoPlan = cliente.planesAsignados?.[0];
                        const whatsappNumber = formatPhone(cliente.telefono);
                        const estadoCfg = ESTADO_CONFIG[ultimoPlan?.estado || "PENDIENTE"] ?? ESTADO_CONFIG.PENDIENTE;
                        const vencido = ultimoPlan && new Date(ultimoPlan.fechaVencimiento) < new Date();

                        return (
                            <div key={cliente.id} className="p-4 space-y-3">
                                {/* Cabecera card */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Iniciales nombre={cliente.nombre} />
                                        <div className="min-w-0">
                                            <p className="font-barlow-condensed font-black text-blanco text-base uppercase leading-tight truncate">
                                                {cliente.nombre}
                                            </p>
                                            <p className="text-[0.6rem] text-gris truncate">{cliente.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {whatsappNumber && (
                                            <a
                                                href={`https://wa.me/${whatsappNumber}`}
                                                target="_blank"
                                                className="p-2 bg-verde/10 text-verde rounded-lg border border-verde/20"
                                            >
                                                <MessageCircle size={16} />
                                            </a>
                                        )}
                                        <Link
                                            href={`/entrenador/clientes/${cliente.id}`}
                                            className="p-2 bg-marino-3 text-gris-claro rounded-lg border border-marino-4"
                                        >
                                            <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Datos secundarios */}
                                {tabActual === "activos" && ultimoPlan && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-barlow-condensed font-black text-naranja uppercase text-xs tracking-wide">
                                            {ultimoPlan.plan?.nombre}
                                        </span>
                                        <span className="text-gris/40 text-xs">·</span>
                                        <span className={`text-xs font-bold ${vencido ? 'text-rojo' : 'text-gris'}`}>
                                            Vence {new Date(ultimoPlan.fechaVencimiento).toLocaleDateString('es-AR')}
                                        </span>
                                        <button
                                            onClick={() => setClientePago({
                                                clienteId: cliente.id,
                                                planAsignadoId: ultimoPlan.id,
                                                nombre: cliente.nombre,
                                                estado: ultimoPlan.estado
                                            })}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.6rem] font-black uppercase tracking-widest ${estadoCfg.cls}`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {estadoCfg.label}
                                        </button>
                                    </div>
                                )}

                                {tabActual === "inscripciones" && (
                                    <button
                                        onClick={() => setClienteAsignando({
                                            id: cliente.id,
                                            nombre: cliente.nombre,
                                            ultimoPlanVencimiento: ultimoPlan?.fechaVencimiento
                                        })}
                                        className="w-full py-2.5 bg-naranja text-marino rounded-lg text-[0.65rem] font-black uppercase tracking-widest"
                                    >
                                        Asignar Plan Inicial
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modales */}
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
