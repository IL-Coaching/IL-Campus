export const dynamic = 'force-dynamic';

import Link from "next/link";
import BotonAltaManual from "./BotonAltaManual";
import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { PlanServicio } from "@/nucleo/servicios/plan.servicio";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import ListadoClientes from "./ListadoClientes";

export default async function ClientesPage({
    searchParams
}: {
    searchParams: { tab?: string }
}) {
    const entrenador = await getEntrenadorSesion();

    const todosLosClientes = await ClienteServicio.obtenerPorEntrenador(entrenador.id) || [];
    const planes = await PlanServicio.obtenerPorEntrenador(entrenador.id) || [];

    const activos = todosLosClientes.filter(c => c.activo === true && (c.planesAsignados?.length || 0) > 0);
    const inactivos = todosLosClientes.filter(c => c.activo === false && (c.planesAsignados?.length || 0) > 0);
    const inscripciones = todosLosClientes.filter(c => c.activo === false && (c.planesAsignados?.length || 0) === 0);

    const validTabs = ["activos", "inactivos", "inscripciones"];
    const tabActual = (searchParams?.tab && validTabs.includes(searchParams.tab)) ? searchParams.tab as "activos" | "inactivos" | "inscripciones" : "activos";

    let clientesAMostrar = activos;
    if (tabActual === "inactivos") clientesAMostrar = inactivos;
    if (tabActual === "inscripciones") clientesAMostrar = inscripciones;

    return (
        <div className="space-y-6 fade-up visible">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Gestión de Clientes
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Seguimiento de clientes y formularios
                    </p>
                </div>
                <BotonAltaManual />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-marino-2 border border-marino-4 rounded-xl p-1">
                {[
                    { key: "activos", label: "Activos", count: activos.length },
                    { key: "inactivos", label: "Inactivos", count: inactivos.length },
                    { key: "inscripciones", label: "Inscripciones", count: inscripciones.length },
                ].map(tab => (
                    <Link
                        key={tab.key}
                        href={`/entrenador/clientes?tab=${tab.key}`}
                        className={`flex-1 text-center py-2.5 px-4 rounded-lg font-black uppercase tracking-widest text-xs transition-all
                            ${tabActual === tab.key
                                ? "bg-naranja text-marino shadow-lg"
                                : "text-gris hover:text-blanco hover:bg-marino-3"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 text-[0.6rem] font-black ${tabActual === tab.key ? "opacity-80" : "opacity-50"}`}>
                            ({tab.count})
                        </span>
                    </Link>
                ))}
            </div>

            {/* Listado */}
            <div className="animate-in fade-in duration-300">
                <ListadoClientes
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    clientes={clientesAMostrar as any[]}
                    planes={planes}
                    tabActual={tabActual as "activos" | "inactivos" | "inscripciones"}
                />
            </div>
        </div>
    );
}
