"use server";

import { prisma } from "@/baseDatos/conexion";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";

interface EstadoGamificacion {
    xp: number;
    nivel: number;
    rachas: number;
    maxRacha: number;
    ultimoCheckin: string | null;
    logrosDesbloqueados: { logroId: string, unlockedAt: Date | string }[];
}

/**
 * Obtiene el estado de gamificación persistido desde la base de datos para el alumno actual.
 */
export async function obtenerGamificacion() {
    try {
        const clienteBase = await getAlumnoSesion();

        // El cliente desde getAlumnoSesion a veces trae solo { id }
        if (!clienteBase?.id) return { error: "No autorizado" };

        let gamificacion = await prisma.gamificacionCliente.findUnique({
            where: { clienteId: clienteBase.id }
        });

        if (!gamificacion) {
            gamificacion = await prisma.gamificacionCliente.create({
                data: {
                    clienteId: clienteBase.id,
                    nivel: 1,
                    experiencia: 0,
                    rachaDias: 0,
                    ultimoCheckin: null,
                    logrosGenerales: []
                }
            });
        }

        return { exito: true, datos: gamificacion };
    } catch (error) {
        console.error("Error al obtener gamificacion:", error);
        return { error: "No se pudo obtener el estado de gamificación." };
    }
}

/**
 * Sincroniza (sobrescribe/actualiza) el estado local de gamificación hacia la base de datos.
 * Para evitar race conditions severas, confía de forma optimista en el cliente (Zustand).
 */
export async function sincronizarGamificacion(estado: EstadoGamificacion) {
    try {
        const clienteBase = await getAlumnoSesion();
        if (!clienteBase?.id) return { error: "No autorizado" };

        const logrosGuardar = estado.logrosDesbloqueados.map(l => l.logroId);

        await prisma.gamificacionCliente.upsert({
            where: { clienteId: clienteBase.id },
            update: {
                experiencia: estado.xp,
                nivel: estado.nivel,
                rachaDias: estado.rachas,
                ultimoCheckin: estado.ultimoCheckin ? new Date(estado.ultimoCheckin) : null,
                logrosGenerales: logrosGuardar
            },
            create: {
                clienteId: clienteBase.id,
                experiencia: estado.xp,
                nivel: estado.nivel,
                rachaDias: estado.rachas,
                ultimoCheckin: estado.ultimoCheckin ? new Date(estado.ultimoCheckin) : null,
                logrosGenerales: logrosGuardar
            }
        });

        return { exito: true };
    } catch (error) {
        console.error("Error al sincronizar gamificacion:", error);
        return { error: "No se pudo sincronizar la gamificación." };
    }
}
