"use server"

import { getEntrenadorSesion } from "../seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

/**
 * obtenerBitacoraCliente - Recupera todo el historial de entrenamiento de un cliente.
 */
export async function obtenerBitacoraCliente(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA: Verificar propiedad
        const clienteActivo = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!clienteActivo) {
            return { exito: false, error: "Acceso denegado" };
        }

        // Obtener la planificación completa con foco en Semanas y Sesiones Reales (ordenada por defecto)
        const macrociclos = await prisma.macrociclo.findMany({
            where: { clienteId },
            include: {
                bloquesMensuales: {
                    include: {
                        semanas: {
                            include: {
                                diasSesion: {
                                    include: {
                                        ejercicios: {
                                            include: { ejercicio: { select: { nombre: true, musculoPrincipal: true } } }
                                        },
                                        sesionesReales: {
                                            include: { series: true, metricas: true }
                                        }
                                    }
                                }
                            },
                            orderBy: { numeroSemana: 'asc' }
                        }
                    },
                    orderBy: { duracion: 'asc' } // No es exacto, pero la BD asegura un id
                }
            },
            orderBy: { fechaInicio: 'desc' }
        });

        return { exito: true, macrociclos };
    } catch {
        return { exito: false, error: "Error al cargar la bitácora." };
    }
}
