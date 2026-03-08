"use server";

import { MetricasServicio } from "../servicios/metricas.servicio";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

/**
 * Obtiene el resumen de métricas para un cliente específico.
 * Cruza adherencia, tonelaje y último check-in.
 */
export async function obtenerResumenMetricasCliente(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Verificar pertenencia (Mitigación BOLA)
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id },
            include: {
                macrociclos: {
                    orderBy: { creadoEn: 'desc' },
                    take: 1
                },
                checkins: {
                    orderBy: { fecha: 'desc' },
                    take: 1
                }
            }
        });

        if (!cliente) throw new Error("Acceso denegado.");

        const macroId = cliente.macrociclos[0]?.id;

        if (!macroId) {
            return {
                exito: true,
                datos: {
                    adherencia: null,
                    tonelaje: null,
                    ultimoCheckin: cliente.checkins[0] || null
                }
            };
        }

        const [adherencia, tonelaje] = await Promise.all([
            MetricasServicio.obtenerAdherenciaCliente(clienteId, macroId),
            MetricasServicio.obtenerProgresoTonelaje(clienteId, macroId)
        ]);

        return {
            exito: true,
            datos: {
                adherencia,
                tonelaje,
                ultimoCheckin: cliente.checkins[0] || null
            }
        };
    } catch (error) {
        console.error("Error al obtener métricas cliente:", error);
        return { exito: false, error: "No se pudieron calcular las métricas." };
    }
}

/**
 * Obtiene los 1RM y porcentajes registrados del cliente para todos los ejercicios.
 */
export async function obtenerFuerzaMaximaCliente(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Verificación BOLA
        const clienteBase = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!clienteBase) return { error: "Acceso denegado" };

        const records = await prisma.porcentajesCliente.findMany({
            where: { clienteId },
            include: {
                ejercicio: { select: { nombre: true, musculoPrincipal: true } }
            },
            orderBy: { fechaTesteo: 'desc' }
        });

        return { exito: true, datos: records };
    } catch (error) {
        console.error("Error obteniendo fuerza máxima:", error);
        return { error: "No se pudo recuperar la información de fuerza." };
    }
}
