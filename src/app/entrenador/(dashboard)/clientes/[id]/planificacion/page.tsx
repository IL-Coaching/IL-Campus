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

    // 3. Calcular Límite Comercial (+ 1 semana de tolerancia)
    let limiteComercialSemanas = 4; // Default por si no tiene plan 
    if (cliente.planesAsignados && cliente.planesAsignados.length > 0) {
        // Asume el primer plan activo o el más reciente
        const planAsignado = cliente.planesAsignados[0];
        const diasTotales = planAsignado.plan?.duracionDias || 0;
        if (diasTotales > 0) {
            limiteComercialSemanas = Math.ceil(diasTotales / 7) + 8; // +8 semanas de margen (2 meses aprox)
        }
    }

    return (
        <ConstructorCliente
            cliente={cliente}
            macrocicloInicial={macrociclo}
            limiteComercialSemanas={limiteComercialSemanas}
        />
    );
}
