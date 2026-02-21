import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { PlanificacionServicio } from "@/nucleo/servicios/planificacion.servicio";
import { notFound } from "next/navigation";
import ConstructorCliente from "./ConstructorCliente";

/**
 * Página del Constructor de Planificación — ArchSecure AI
 * Carga los datos del servidor y delega la interactividad al cliente.
 */
export default async function Page({ params }: { params: { id: string } }) {
    // 1. Cargar Cliente
    const cliente = await ClienteServicio.obtenerPorId(params.id);
    if (!cliente) notFound();

    // 2. Cargar Planificación Activa (Macrociclo)
    const macrociclo = await PlanificacionServicio.obtenerMacrocicloActivo(params.id);

    return (
        <ConstructorCliente
            cliente={cliente}
            macrocicloInicial={macrociclo}
        />
    );
}
