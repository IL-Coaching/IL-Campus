"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { FinanzasServicio } from "../servicios/finanzas.servicio";
import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";

/**
 * Acciones de Finanzas — ArchSecure AI
 */

export async function registrarCobroAction(data: {
    clienteId: string;
    monto: number;
    metodo: string;
    planAsignadoId?: string;
    periodoDesde: Date;
    periodoHasta: Date;
    notas?: string;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA: Verificar que el cliente pertenece al entrenador
        const clientePropio = await prisma.cliente.findFirst({
            where: { id: data.clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) {
            throw new Error("No tienes permiso para registrar cobros a este cliente.");
        }

        await FinanzasServicio.registrarCobro(data);

        revalidatePath(`/entrenador/clientes/${data.clienteId}`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error desconocido al registrar el cobro" };
    }
}

export async function obtenerResumenFinanciero(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA
        const clientePropio = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) throw new Error("Acceso denegado.");

        return await FinanzasServicio.obtenerResumenCliente(clienteId);
    } catch (error) {
        console.error("Error al obtener resumen financiero:", error);
        return null;
    }
}
