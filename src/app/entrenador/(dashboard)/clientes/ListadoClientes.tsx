"use client"
import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import ModalAsignarPlan from "./ModalAsignarPlan";

interface Cliente {
    id: string;
    nombre: string;
    email: string;
    activo: boolean;
    planesAsignados: {
        plan: {
            nombre: string;
        };
    }[];
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
    tabActual: "activos" | "inscripciones";
}

export default function ListadoClientes({ clientes, planes, tabActual }: Props) {
    const [clienteSeleccionado, setClienteSeleccionado] = useState<{ id: string, nombre: string } | null>(null);

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                    <Users size={16} className="text-naranja" />
                    {tabActual === "activos" ? "Lista de Entrenados" : "Pendientes de Plan"} ({clientes.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-marino-4 bg-marino-3/30">
                            <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Nombre</th>
                            <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Email</th>
                            <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Plan Vigente</th>
                            <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Estado</th>
                            <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-marino-4">
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gris italic">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <Users size={32} />
                                        <p>No se encontraron clientes en esta sección.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            clientes.map((cliente) => {
                                const planActual = cliente.planesAsignados[0]?.plan?.nombre;

                                return (
                                    <tr key={cliente.id} className="hover:bg-marino-3/50 transition-colors group">
                                        <td className="p-4 font-medium text-blanco">{cliente.nombre}</td>
                                        <td className="p-4 text-gris-claro font-medium">{cliente.email}</td>
                                        <td className="p-4">
                                            {planActual ? (
                                                <span className="text-naranja font-black tracking-tighter text-sm uppercase italic">
                                                    {planActual}
                                                </span>
                                            ) : (
                                                <span className="text-gris text-xs uppercase font-bold px-2 py-0.5 rounded bg-marino-4">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${cliente.activo
                                                ? 'bg-verde/10 text-verde border-verde/20'
                                                : 'bg-rojo/10 text-rojo border-rojo/20'
                                                }`}>
                                                {cliente.activo ? "Activo" : "En Espera"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {tabActual === "activos" ? (
                                                <Link
                                                    href={`/entrenador/clientes/${cliente.id}`}
                                                    className="bg-marino-4 hover:bg-naranja text-blanco group-hover:text-blanco px-4 py-2 rounded font-barlow-condensed font-bold text-xs uppercase tracking-widest transition-all inline-block"
                                                >
                                                    Ver Perfil
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => setClienteSeleccionado({ id: cliente.id, nombre: cliente.nombre })}
                                                    className="bg-naranja hover:bg-naranja-h text-marino px-4 py-2 rounded font-barlow-condensed font-bold text-xs uppercase tracking-widest transition-all inline-block"
                                                >
                                                    Asignar Plan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {clienteSeleccionado && (
                <ModalAsignarPlan
                    clienteId={clienteSeleccionado.id}
                    clienteNombre={clienteSeleccionado.nombre}
                    planes={planes}
                    onClose={() => setClienteSeleccionado(null)}
                />
            )}
        </div>
    );
}
