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
    // 1. Obtener sesión
    const entrenador = await getEntrenadorSesion();

    // 2. Usar capa de servicio
    const todosLosClientes = await ClienteServicio.obtenerPorEntrenador(entrenador.id);
    const planes = await PlanServicio.obtenerPorEntrenador(entrenador.id);

    // 3. Segmentación lógica
    const activos = todosLosClientes.filter(c => c.planesAsignados.length > 0);
    const inscripciones = todosLosClientes.filter(c => c.planesAsignados.length === 0);

    const tabActual = searchParams.tab === "inscripciones" ? "inscripciones" : "activos";
    const clientesAMostrar = tabActual === "activos" ? activos : inscripciones;

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Gestión de Clientes
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        {tabActual === "activos"
                            ? "Atletas con membresía activa y seguimiento."
                            : "Nuevos registros pendientes de asignación de plan."}
                    </p>
                </div>
                <BotonAltaManual />
            </div>

            {/* Sistema de Pestañas (Tabs) */}
            <div className="flex border-b border-marino-4 gap-8">
                <Link
                    href="/entrenador/clientes?tab=activos"
                    className={`pb-4 px-2 font-barlow-condensed font-bold uppercase tracking-widest text-sm transition-all relative ${tabActual === "activos" ? "text-naranja" : "text-gris hover:text-blanco"
                        }`}
                >
                    Activos ({activos.length})
                    {tabActual === "activos" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-naranja shadow-[0_0_10px_rgba(249,115,22,0.5)]" />}
                </Link>
                <Link
                    href="/entrenador/clientes?tab=inscripciones"
                    className={`pb-4 px-2 font-barlow-condensed font-bold uppercase tracking-widest text-sm transition-all relative ${tabActual === "inscripciones" ? "text-naranja" : "text-gris hover:text-blanco"
                        }`}
                >
                    Nuevas Inscripciones ({inscripciones.length})
                    {tabActual === "inscripciones" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-naranja shadow-[0_0_10px_rgba(249,115,22,0.5)]" />}
                </Link>
            </div>

            {/* Listado dinámico (Componente de Cliente) */}
            <ListadoClientes
                clientes={clientesAMostrar as unknown as { id: string, nombre: string, email: string, activo: boolean, planesAsignados: { plan: { nombre: string } }[] }[]}
                planes={planes}
                tabActual={tabActual as "activos" | "inscripciones"}
            />
        </div>
    );
}
