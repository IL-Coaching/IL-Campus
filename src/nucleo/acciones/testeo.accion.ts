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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config = await (prisma as any).configTesteoEjercicio.findFirst({
            where: { semanaId, ejercicioId }
        });

        if (config) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).configTesteoEjercicio.update({
                where: { id: config.id },
                data: { modalidad }
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).configTesteoEjercicio.create({
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

        const cliente = await prisma.cliente.findFirst({
            where: { id: data.clienteId, entrenadorId: entrenador.id },
            include: { checkins: { orderBy: { fecha: 'desc' }, take: 1 } }
        });

        if (!cliente) throw new Error("Acceso denegado.");

        const unRM = calcularUnRM(data.pesoKg, data.reps);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkinReciente = (cliente as any).checkins?.[0];
        const pesoCorporal = checkinReciente?.pesoKg || 0;
        const fuerzaRelativa = calcularFuerzaRelativa(unRM, pesoCorporal);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const tabla = calcularTablaCompleta(unRM);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al registrar testeo";
        return { error: message };
    }
}

export async function obtenerResultadosTesteo(clienteId: string, ejercicioId: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (prisma as any).resultadoTesteo.findMany({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await (prisma as any).porcentajesCliente.findUnique({
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
