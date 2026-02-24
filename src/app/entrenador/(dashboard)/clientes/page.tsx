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

    // Segmentación lógica (Activos, Inactivos, Inscripciones)
    const activos = todosLosClientes.filter(c => c.activo === true && (c.planesAsignados?.length || 0) > 0);
    const inactivos = todosLosClientes.filter(c => c.activo === false && (c.planesAsignados?.length || 0) > 0);
    const inscripciones = todosLosClientes.filter(c => c.activo === false && (c.planesAsignados?.length || 0) === 0);

    const validTabs = ["activos", "inactivos", "inscripciones"];
    const tabActual = (searchParams?.tab && validTabs.includes(searchParams.tab)) ? searchParams.tab as "activos" | "inactivos" | "inscripciones" : "activos";

    let clientesAMostrar = activos;
    if (tabActual === "inactivos") clientesAMostrar = inactivos;
    if (tabActual === "inscripciones") clientesAMostrar = inscripciones;

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header Mínimo - Diseño de plantilla */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a101f] p-6 rounded-t-xl border-l-[3px] border-naranja relative shadow-xl overflow-hidden mt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#060e22] to-transparent pointer-events-none" />
                <div className="relative z-10 w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-widest text-[#f5f5f5] mb-1 italic" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            GESTION DE CLIENTES
                        </h1>
                        <p className="text-gris/90 font-medium text-sm">
                            Seguimiento de clientes y formularios:
                        </p>
                    </div>
                    <BotonAltaManual />
                </div>
            </div>

            {/* Píldoras Navegación (Tabs) Estilo Plantilla */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 w-full">
                <Link
                    href="/entrenador/clientes?tab=activos"
                    className={`flex-1 text-center py-3.5 px-4 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl
                        ${tabActual === "activos"
                            ? "bg-[#e87717] text-blanco"
                            : "bg-[#151c2e] text-blanco hover:bg-[#1a233a] border border-[#1a233a]"
                        }`}
                >
                    Clientes Activos <br className="hidden lg:block" />({activos.length})
                </Link>
                <Link
                    href="/entrenador/clientes?tab=inactivos"
                    className={`flex-1 text-center py-3.5 px-4 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl
                        ${tabActual === "inactivos"
                            ? "bg-[#e87717] text-blanco"
                            : "bg-[#151c2e] text-blanco hover:bg-[#1a233a] border border-[#1a233a]"
                        }`}
                >
                    Clientes Inactivos <br className="hidden lg:block" />({inactivos.length})
                </Link>
                <Link
                    href="/entrenador/clientes?tab=inscripciones"
                    className={`flex-1 text-center py-3.5 px-4 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl
                        ${tabActual === "inscripciones"
                            ? "bg-[#e87717] text-blanco"
                            : "bg-[#151c2e] text-blanco hover:bg-[#1a233a] border border-[#1a233a]"
                        }`}
                >
                    Inscripciones <br className="hidden lg:block" />({inscripciones.length})
                </Link>
            </div>

            {/* Listado dinámico (Componente de Cliente) */}
            <div className="animate-in fade-in duration-500">
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
