"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";

/**
 * Obtiene todas las notificaciones no purgadas del entrenador.
 * Las no leídas aparecen primero, ordenadas por fecha descendente.
 */
export async function obtenerNotificaciones() {
    try {
        const entrenador = await getEntrenadorSesion();

        const notificaciones = await prisma.notificacion.findMany({
            where: {
                entrenadorId: entrenador.id,
                purgada: false
            },
            orderBy: [
                { leida: 'asc' },
                { creadaEn: 'desc' }
            ]
        });

        return { exito: true, notificaciones };
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return { exito: false, notificaciones: [] };
    }
}

/**
 * Marca una notificación como leída o no leída (toggle).
 * @security Valida que la notificación pertenece al entrenador en sesión (BOLA).
 */
export async function toggleLeidaNotificacion(notificacionId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const notificacion = await prisma.notificacion.findFirst({
            where: { id: notificacionId, entrenadorId: entrenador.id }
        });

        if (!notificacion) return { error: "Notificación no encontrada." };

        await prisma.notificacion.update({
            where: { id: notificacionId },
            data: { leida: !notificacion.leida }
        });

        return { exito: true };
    } catch (error) {
        console.error("Error toggle notificación:", error);
        return { error: "No se pudo actualizar la notificación." };
    }
}

/**
 * Purga notificaciones leídas (las marca como purgadas, no elimina de DB).
 * @param ids - Array de IDs a purgar. Si está vacío, purga todas las leídas.
 */
export async function purgarNotificaciones(ids: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();

        if (ids.length > 0) {
            await prisma.notificacion.updateMany({
                where: {
                    id: { in: ids },
                    entrenadorId: entrenador.id
                },
                data: { purgada: true }
            });
        } else {
            // Purgar todas las leídas
            await prisma.notificacion.updateMany({
                where: {
                    entrenadorId: entrenador.id,
                    leida: true
                },
                data: { purgada: true }
            });
        }

        return { exito: true };
    } catch (error) {
        console.error("Error al purgar notificaciones:", error);
        return { error: "No se pudieron purgar las notificaciones." };
    }
}

/**
 * Crea una notificación para el entrenador.
 * Uso interno desde otros módulos (finanzas, vencimientos, formularios, mensajes).
 */
export async function crearNotificacion(data: {
    entrenadorId: string;
    tipo: "MENSAJE_DIRECTO" | "FINANZA" | "VENCIMIENTO_MEMBRESIA" | "NUEVO_FORMULARIO";
    titulo: string;
    cuerpo: string;
}) {
    try {
        await prisma.notificacion.create({ data });
        return { exito: true };
    } catch (error) {
        console.error("Error al crear notificación:", error);
        return { error: "No se pudo crear la notificación." };
    }
}
