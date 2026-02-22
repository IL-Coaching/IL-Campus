/** Listado de vencimientos y renovaciones */
"use client"
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle2, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import ModalRegistrarPago from "./ModalRegistrarPago";

export interface Vencimiento {
    id: string;
    fechaVencimiento: Date;
    cliente: { id: string, nombre: string, email: string };
    plan: { nombre: string, precio: number };
    cobros: {
        id: string;
        periodoHasta: Date;
    }[];
}

interface Props {
    vencimientos: Vencimiento[];
}

export default function ListaVencimientos({ vencimientos }: Props) {
    const [cobroSeleccionado, setCobroSeleccionado] = useState<Vencimiento | null>(null);

    const hoy = new Date();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                    <tr className="border-b border-marino-4 bg-marino-3/30">
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Atleta</th>
                        <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Plan Vigente</th>
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
                            const ultimoCobro = item.cobros[0];

                            // Lógica de estado sugerida: Si el último cobro cubre el periodo actual
                            const esPagado = ultimoCobro && new Date(ultimoCobro.periodoHasta) >= new Date(item.fechaVencimiento);

                            return (
                                <tr key={item.id} className="hover:bg-marino-3/50 transition-all group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-blanco flex items-center gap-2">
                                                {item.cliente.nombre}
                                                <Link href={`/entrenador/clientes/${item.cliente.id}`} title="Ver Perfil">
                                                    <ExternalLink size={12} className="text-gris group-hover:text-naranja transition-colors" />
                                                </Link>
                                            </span>
                                            <span className="text-[10px] text-gris uppercase font-bold tracking-tight">{item.cliente.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-naranja font-black tracking-tighter text-sm uppercase italic">
                                            {item.plan.nombre}
                                        </span>
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
                                        {esPagado ? (
                                            <span className="bg-verde/10 text-verde border border-verde/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                <CheckCircle2 size={12} /> Pagado
                                            </span>
                                        ) : (
                                            <span className={`${estaVencido ? 'bg-rojo/10 text-rojo border-rojo/20 animate-pulse' : 'bg-marino-4 text-gris border-marino-3'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto`}>
                                                <AlertCircle size={12} /> Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setCobroSeleccionado(item)}
                                            className={`${esPagado
                                                ? 'bg-marino-4 text-gris cursor-not-allowed opacity-50'
                                                : 'bg-naranja hover:bg-naranja-h text-marino shadow-lg shadow-naranja/10 hover:shadow-naranja/20'
                                                } px-4 py-2 rounded font-barlow-condensed font-bold text-xs uppercase tracking-widest transition-all`}
                                            disabled={esPagado}
                                        >
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} />
                                                Registrar Pago
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
        </div>
    );
}
