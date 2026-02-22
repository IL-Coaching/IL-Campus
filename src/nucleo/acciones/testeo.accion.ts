"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";
import { calcularUnRM, calcularFuerzaRelativa, calcularTablaCompleta } from "../testeo/calculos";
import { ModalidadTesteo } from "@prisma/client";

/**
 * Acciones del Sistema de Testeo de Fuerza — IL-Campus
 */

export async function configurarDiaTesteo(semanaId: string, ejercicioId: string, modalidad: ModalidadTesteo) {
    try {
        await getEntrenadorSesion();

        const config = await prisma.configTesteoEjercicio.findFirst({
            where: { semanaId, ejercicioId }
        });

        if (config) {
            await prisma.configTesteoEjercicio.update({
                where: { id: config.id },
                data: { modalidad }
            });
        } else {
            await prisma.configTesteoEjercicio.create({
                data: { semanaId, ejercicioId, modalidad, orden: 0 }
            });
        }

        revalidatePath("/entrenador/clientes");
        return { exito: true };
    } catch (error) {
        console.error(error);
        return { error: "Error al configurar testeo" };
    }
}

export async function registrarResultadoTesteo(data: {
    clienteId: string;
    ejercicioId: string;
    modalidad: ModalidadTesteo;
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
        const checkinReciente = cliente.checkins?.[0];
        const pesoCorporal = checkinReciente?.pesoKg || 0;
        const fuerzaRelativa = calcularFuerzaRelativa(unRM, pesoCorporal);

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

        const tabla = calcularTablaCompleta(unRM);

        // Mapeo manual para asegurar compatibilidad con el esquema Prisma
        const porcentajesData = {
            p100: tabla.find(f => f.reps === 1)?.pesoKg || 0,
            p94_3: tabla.find(f => f.reps === 2)?.pesoKg || 0,
            p90_6: tabla.find(f => f.reps === 3)?.pesoKg || 0,
            p88_1: tabla.find(f => f.reps === 4)?.pesoKg || 0,
            p85_6: tabla.find(f => f.reps === 5)?.pesoKg || 0,
            p83_1: tabla.find(f => f.reps === 6)?.pesoKg || 0,
            p80_7: tabla.find(f => f.reps === 7)?.pesoKg || 0,
            p78_6: tabla.find(f => f.reps === 8)?.pesoKg || 0,
            p76_5: tabla.find(f => f.reps === 9)?.pesoKg || 0,
            p74_4: tabla.find(f => f.reps === 10)?.pesoKg || 0,
            p72_3: tabla.find(f => f.reps === 11)?.pesoKg || 0,
            p70_3: tabla.find(f => f.reps === 12)?.pesoKg || 0,
            p68_8: tabla.find(f => f.reps === 13)?.pesoKg || 0,
            p67_5: tabla.find(f => f.reps === 14)?.pesoKg || 0,
            p66_2: tabla.find(f => f.reps === 15)?.pesoKg || 0,
            p65_0: tabla.find(f => f.reps === 16)?.pesoKg || 0,
            p63_8: tabla.find(f => f.reps === 17)?.pesoKg || 0,
            p62_7: tabla.find(f => f.reps === 18)?.pesoKg || 0,
        };

        await prisma.porcentajesCliente.upsert({
            where: {
                clienteId_ejercicioId: {
                    clienteId: data.clienteId,
                    ejercicioId: data.ejercicioId
                }
            },
            update: {
                ...porcentajesData,
                unRM,
                fechaTesteo: new Date()
            },
            create: {
                clienteId: data.clienteId,
                ejercicioId: data.ejercicioId,
                unRM,
                modalidadTesteo: data.modalidad,
                fechaTesteo: new Date(),
                ...porcentajesData
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
