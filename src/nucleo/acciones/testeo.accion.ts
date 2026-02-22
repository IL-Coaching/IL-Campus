"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";
import { calcularUnRM, calcularFuerzaRelativa, calcularTablaCompleta } from "../testeo/calculos";

/**
 * Acciones del Sistema de Testeo de Fuerza — IL-Campus
 */

export async function configurarDiaTesteo(semanaId: string, ejercicioId: string, modalidad: any) {
    try {
        await getEntrenadorSesion();

        const config = await (prisma as any).configTesteoEjercicio.findFirst({
            where: { semanaId, ejercicioId }
        });

        if (config) {
            await (prisma as any).configTesteoEjercicio.update({
                where: { id: config.id },
                data: { modalidad }
            });
        } else {
            await (prisma as any).configTesteoEjercicio.create({
                data: { semanaId, ejercicioId, modalidad }
            });
        }

        revalidatePath("/entrenador/clientes");
        return { exito: true };
    } catch (error) {
        return { error: "Error al configurar testeo" };
    }
}

export async function registrarResultadoTesteo(data: {
    clienteId: string;
    ejercicioId: string;
    modalidad: any;
    pesoKg: number;
    reps: number;
    mesocicloId?: string;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Validar que el cliente pertenece al entrenador
        const cliente = await prisma.cliente.findFirst({
            where: { id: data.clienteId, entrenadorId: entrenador.id },
            include: { checkins: { orderBy: { fecha: 'desc' }, take: 1 } }
        });

        if (!cliente) throw new Error("Acceso denegado.");

        // 2. Cálculos Científicos (Fórmula O'Conner)
        const unRM = calcularUnRM(data.pesoKg, data.reps);
        const pesoCorporal = cliente.checkins[0]?.pesoKg || 0;
        const fuerzaRelativa = calcularFuerzaRelativa(unRM, pesoCorporal);

        // 3. Registrar en Historial
        await (prisma as any).resultadoTesteo.create({
            data: {
                clienteId: data.clienteId,
                ejercicioId: data.ejercicioId,
                modalidad: data.modalidad,
                pesoUtilizado: data.pesoKg,
                repsRealizadas: data.reps,
                unRMCalculado: unRM,
                fuerzaRelativa: fuerzaRelativa,
                mesocicloId: data.mesocicloId,
            }
        });

        // 4. Cachear porcentajes para acceso rápido
        const tabla = calcularTablaCompleta(unRM);
        await (prisma as any).porcentajesCliente.upsert({
            where: {
                clienteId_ejercicioId: {
                    clienteId: data.clienteId,
                    ejercicioId: data.ejercicioId
                }
            },
            update: {
                ...tabla,
                unRM,
                fechaTesteo: new Date()
            },
            create: {
                clienteId: data.clienteId,
                ejercicioId: data.ejercicioId,
                unRM,
                ...tabla
            }
        });

        revalidatePath("/entrenador/clientes");
        return { exito: true, unRM, fuerzaRelativa };

    } catch (error: any) {
        return { error: error.message || "Error al registrar testeo" };
    }
}

export async function obtenerResultadosTesteo(clienteId: string, ejercicioId: string) {
    try {
        return await (prisma as any).resultadoTesteo.findMany({
            where: { clienteId, ejercicioId },
            orderBy: { fecha: 'desc' }
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function obtenerPorcentajesCalculados(clienteId: string, ejercicioId: string) {
    try {
        const data = await (prisma as any).porcentajesCliente.findUnique({
            where: {
                clienteId_ejercicioId: {
                    clienteId,
                    ejercicioId
                }
            }
        });
        return { exito: true, porcentajes: data };
    } catch (error) {
        console.error(error);
        return { error: "No se pudieron obtener los porcentajes" };
    }
}
