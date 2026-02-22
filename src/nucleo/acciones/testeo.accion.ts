"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";
import { calcularUnRM, calcularFuerzaRelativa, calcularTablaCompleta } from "../testeo/calculos";

/**
 * Acciones del Sistema de Testeo de Fuerza — IL-Campus
 */

export async function configurarDiaTesteo(semanaId: string, ejercicioId: string, modalidad: string) {
    try {
        await getEntrenadorSesion();

        // @ts-expect-error - Campos de esquema extendidos
        const config = await prisma.configTesteoEjercicio.findFirst({
            where: { semanaId, ejercicioId }
        });

        if (config) {
            // @ts-expect-error - Campos de esquema extendidos
            await prisma.configTesteoEjercicio.update({
                where: { id: config.id },
                data: { modalidad }
            });
        } else {
            // @ts-expect-error - Campos de esquema extendidos
            await prisma.configTesteoEjercicio.create({
                data: { semanaId, ejercicioId, modalidad }
            });
        }

        revalidatePath("/entrenador/clientes");
        return { exito: true };
    } catch {
        return { error: "Error al configurar testeo" };
    }
}

export async function registrarResultadoTesteo(data: {
    clienteId: string;
    ejercicioId: string;
    modalidad: string;
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

        const unRM = calcularUnRM(data.pesoKg, data.reps);
        const checkinReciente = (cliente as { checkins?: { pesoKg?: number }[] }).checkins?.[0];
        const pesoCorporal = checkinReciente?.pesoKg || 0;
        const fuerzaRelativa = calcularFuerzaRelativa(unRM, pesoCorporal);

        // 3. Registrar en Historial
        // @ts-expect-error - Campos de esquema extendidos
        await prisma.resultadoTesteo.create({
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
        // @ts-expect-error - Campos de esquema extendidos
        await prisma.porcentajesCliente.upsert({
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al registrar testeo";
        return { error: message };
    }
}

export async function obtenerResultadosTesteo(clienteId: string, ejercicioId: string) {
    try {
        // @ts-expect-error - Campos de esquema extendidos
        return await prisma.resultadoTesteo.findMany({
            where: { clienteId, ejercicioId },
            orderBy: { fecha: 'desc' }
        });
    } catch (error: unknown) {
        console.error(error);
        return [];
    }
}

export async function obtenerPorcentajesCalculados(clienteId: string, ejercicioId: string) {
    try {
        // @ts-expect-error - Campos de esquema extendidos
        const data = await prisma.porcentajesCliente.findUnique({
            where: {
                clienteId_ejercicioId: {
                    clienteId,
                    ejercicioId
                }
            }
        });
        return { exito: true, porcentajes: data };
    } catch (error: unknown) {
        console.error(error);
        return { error: "No se pudieron obtener los porcentajes" };
    }
}
