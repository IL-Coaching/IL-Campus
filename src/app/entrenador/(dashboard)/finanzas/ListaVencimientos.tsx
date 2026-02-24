/** Listado de vencimientos y renovaciones */
"use client"
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle2, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import ModalRegistrarPago from "@/app/entrenador/(dashboard)/finanzas/ModalRegistrarPago";
import ModalCobrosHistorial from "@/app/entrenador/(dashboard)/finanzas/ModalCobrosHistorial";

export interface Vencimiento {
    id: string;
    fechaVencimiento: Date;
    cliente: {
        id: string,
        nombre: string,
        email: string,
        planesAsignados: { plan: { nombre: string } }[]
    };
    plan: { nombre: string, precio: number };
    cobros: {
        id: string;
        fecha: Date;
        montoArs: number;
        metodo: string;
        periodoDesde: Date;
        periodoHasta: Date;
        comprobanteUrl: string | null;
    }[];
}

interface Props {
    vencimientos: Vencimiento[];
}

export default function ListaVencimientos({ vencimientos }: Props) {
    const [cobroSeleccionado, setCobroSeleccionado] = useState<Vencimiento | null>(null);
    const [historialSeleccionado, setHistorialSeleccionado] = useState<Vencimiento | null>(null);

    const hoy = new Date();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                    <tr className="border-b border-marino-4 bg-marino-3/30">
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Atleta</th>
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Suscripción gestionada</th>
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Vencimiento</th>
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs text-center">Estado Pago</th>
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-marino-4">
                    {vencimientos.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gris italic">
                                No se encontraron vencimientos próximos. ¡Todo al día!
                            </td>
                        </tr>
                    ) : (
                        vencimientos.map((item) => {
                            const diasParaVencer = Math.ceil((new Date(item.fechaVencimiento).getTime() - hoy.getTime()) / (1000 * 3600 * 24));
                            const estaVencido = diasParaVencer < 0;

                            // Lógica de Pagos Parciales: Buscar cobros que cubren el periodo en cuestión
                            const cobrosDelCiclo = item.cobros.filter(c => new Date(c.periodoHasta) >= new Date(item.fechaVencimiento));
                            const totalPagado = cobrosDelCiclo.reduce((sum, c) => sum + c.montoArs, 0);
                            const metaPago = item.plan.precio;

                            let estadoPago = "PENDIENTE";
                            if (totalPagado >= metaPago) estadoPago = "PAGADO";
                            else if (totalPagado > 0) estadoPago = "PARCIAL";

                            // 🚨 DETECCIÓN DE DESCALCE (Plan Cobro vs Plan Acceso)
                            const planAcceso = item.cliente.planesAsignados[0]?.plan.nombre;
                            const hayDescalce = planAcceso && planAcceso !== item.plan.nombre;

                            return (
                                <tr key={item.id} className="hover:bg-marino-3/50 transition-all group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-blanco flex items-center gap-2 text-sm">
                                                {item.cliente.nombre}
                                                <Link href={`/entrenador/clientes/${item.cliente.id}`} title="Ver Perfil">
                                                    <ExternalLink size={12} className="text-gris group-hover:text-naranja transition-colors" />
                                                </Link>
                                            </span>
                                            <span className="text-[10px] text-gris uppercase font-bold tracking-tight">{item.cliente.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-naranja font-black tracking-tighter text-sm uppercase italic">
                                                    {item.plan.nombre}
                                                </span>
                                                {hayDescalce && (
                                                    <span className="bg-rojo/10 text-rojo border border-rojo/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter animate-pulse" title={`El cliente tiene acceso a ${planAcceso}, pero se le está gestionando un cobro por ${item.plan.nombre}`}>
                                                        ⚠️ DESCALCE
                                                    </span>
                                                )}
                                            </div>
                                            {hayDescalce && (
                                                <span className="text-[9px] text-gris font-bold uppercase italic">
                                                    Acceso Actual: <span className="text-blanco">{planAcceso}</span>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${estaVencido ? 'text-rojo' : 'text-blanco'}`}>
                                                {format(new Date(item.fechaVencimiento), "dd 'de' MMM", { locale: es })}
                                            </span>
                                            <span className={`text-[10px] uppercase font-black tracking-widest ${estaVencido ? 'text-rojo/70' : diasParaVencer <= 3 ? 'text-naranja' : 'text-gris'
                                                }`}>
                                                {estaVencido ? "VENCIDO" : `FALTAN ${diasParaVencer} DÍAS`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {estadoPago === "PAGADO" ? (
                                            <span className="bg-verde/10 text-verde border border-verde/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                <CheckCircle2 size={12} /> AL DÍA
                                            </span>
                                        ) : estadoPago === "PARCIAL" ? (
                                            <div className="flex flex-col items-center">
                                                <span className="bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto cursor-pointer" onClick={() => setHistorialSeleccionado(item)}>
                                                    PAGO PARCIAL
                                                </span>
                                                <span className="text-[10px] text-naranja font-black uppercase tracking-tighter mt-1 hover:underline cursor-pointer" onClick={() => setHistorialSeleccionado(item)}>
                                                    Falta ${(metaPago - totalPagado).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`${estaVencido ? 'bg-rojo/10 text-rojo border-rojo/20 animate-pulse' : 'bg-marino-4 text-gris border-marino-3'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto`}>
                                                <AlertCircle size={12} /> IMPAGO
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setHistorialSeleccionado(item)}
                                            className="text-gris hover:text-blanco border border-marino-4 bg-marino-3 hover:bg-marino-4 px-3 py-2 rounded text-xs uppercase font-bold tracking-widest transition-all"
                                            title="Ver Historial"
                                        >
                                            Ver Hist.
                                        </button>
                                        <button
                                            onClick={() => setCobroSeleccionado(item)}
                                            className={`${estadoPago === "PAGADO"
                                                ? 'bg-verde/20 hover:bg-verde/30 text-verde'
                                                : 'bg-naranja hover:bg-naranja-h text-marino shadow-lg shadow-naranja/10 hover:shadow-naranja/20'
                                                } px-4 py-2 rounded font-barlow-condensed font-bold text-xs uppercase tracking-widest transition-all min-w-32 justify-center flex`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} />
                                                {estadoPago === "PAGADO" ? "ADELANTAR PAGO" : "SUMAR PAGO"}
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {cobroSeleccionado && (
                <ModalRegistrarPago
                    vencimiento={{
                        id: cobroSeleccionado.id,
                        fechaVencimiento: cobroSeleccionado.fechaVencimiento,
                        cliente: {
                            id: cobroSeleccionado.cliente.id,
                            nombre: cobroSeleccionado.cliente.nombre
                        },
                        plan: {
                            nombre: cobroSeleccionado.plan.nombre,
                            precio: cobroSeleccionado.plan.precio
                        }
                    }}
                    onClose={() => setCobroSeleccionado(null)}
                />
            )}

            {historialSeleccionado && (
                <ModalCobrosHistorial
                    clienteNombre={historialSeleccionado.cliente.nombre}
                    cobros={historialSeleccionado.cobros}
                    onClose={() => setHistorialSeleccionado(null)}
                />
            )}
        </div>
    );
}
