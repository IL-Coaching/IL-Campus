"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { revalidatePath } from "next/cache";

/**
 * Obtiene los check-ins pendientes de revisión (no vistos).
 * @security Filtra por entrenadorId en sesión (BOLA).
 */
export async function obtenerCheckinsNoVistos() {
    try {
        const entrenador = await getEntrenadorSesion();

        const checkins = await prisma.checkin.findMany({
            where: {
                cliente: { entrenadorId: entrenador.id },
                visto: false
            },
            include: {
                cliente: { select: { id: true, nombre: true, email: true } }
            },
            orderBy: { fecha: 'desc' }
        });

        return { exito: true, checkins };
    } catch (error) {
        console.error("Error al obtener check-ins:", error);
        return { exito: false, checkins: [] };
    }
}

/**
 * Obtiene el historial completo de check-ins de un cliente.
 * @security Valida que el cliente pertenece al entrenador (BOLA).
 */
export async function obtenerHistorialCheckins(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id },
            select: { id: true, nombre: true }
        });
        if (!cliente) return { error: "Cliente no encontrado." };

        const checkins = await prisma.checkin.findMany({
            where: { clienteId },
            orderBy: { fecha: 'desc' }
        });

        return { exito: true, checkins, cliente };
    } catch (error) {
        console.error("Error al obtener historial:", error);
        return { error: "No se pudo cargar el historial." };
    }
}

/**
 * Marca un check-in como visto por el entrenador.
 * @security Valida que el check-in pertenece a un cliente del entrenador (BOLA).
 */
export async function marcarCheckinVisto(checkinId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA: verificar cadena checkin → cliente → entrenador
        const checkin = await prisma.checkin.findFirst({
            where: {
                id: checkinId,
                cliente: { entrenadorId: entrenador.id }
            }
        });

        if (!checkin) return { error: "Check-in no encontrado." };

        await prisma.checkin.update({
            where: { id: checkinId },
            data: { visto: true }
        });

        revalidatePath('/entrenador/mensajeria');
        return { exito: true };
    } catch (error) {
        console.error("Error al marcar check-in:", error);
        return { error: "No se pudo marcar como visto." };
    }
}
