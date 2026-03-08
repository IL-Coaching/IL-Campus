"use server";

import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";
import { revalidatePath } from "next/cache";
import { calcularUnRM, calcularFuerzaRelativa, calcularTablaCompleta } from "../testeo/calculos";

export async function obtenerDatosProgreso() {
    try {
        const cliente = await getAlumnoSesion();

        // Obtener últimos check-ins (últimos 30 días)
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        const checkins = await prisma.checkin.findMany({
            where: {
                clienteId: cliente.id,
                fecha: { gte: hace30Dias }
            },
            orderBy: { fecha: 'desc' }
        });

        // Obtener resultados de testeo
        const resultadosTesteo = await prisma.resultadoTesteo.findMany({
            where: { clienteId: cliente.id },
            include: { ejercicio: { select: { nombre: true, musculoPrincipal: true } } },
            orderBy: { fecha: 'desc' },
            take: 10
        });

        // Calcular estadísticas
        const promedioEnergia = checkins.length > 0
            ? Math.round(checkins.reduce((sum, c) => sum + (c.energia || 0), 0) / checkins.length)
            : 0;

        const promedioSueno = checkins.length > 0
            ? Math.round(checkins.reduce((sum, c) => sum + (c.sueno || 0), 0) / checkins.length)
            : 0;

        const promedioAdherencia = checkins.length > 0
            ? Math.round(checkins.reduce((sum, c) => sum + (c.adherencia || 0), 0) / checkins.length)
            : 0;

        const semanasActivas = Math.ceil((new Date().getTime() - new Date(cliente.fechaAlta).getTime()) / (1000 * 60 * 60 * 24 * 7));

        return {
            exito: true,
            progreso: {
                checkins,
                resultadosTesteo,
                estadisticas: {
                    promedioEnergia,
                    promedioSueno,
                    promedioAdherencia,
                    totalCheckins: checkins.length,
                    semanasActivas,
                    ultimoPeso: checkins[0]?.pesoKg || null
                }
            }
        };
    } catch (error) {
        console.error("Error al obtener datos de progreso:", error);
        return {
            exito: false,
            progreso: {
                checkins: [],
                resultadosTesteo: [],
                estadisticas: {
                    promedioEnergia: 0,
                    promedioSueno: 0,
                    promedioAdherencia: 0,
                    totalCheckins: 0,
                    semanasActivas: 0,
                    ultimoPeso: null
                }
            }
        };
    }
}

export async function obtenerEjerciciosTesteo() {
    try {
        const cliente = await getAlumnoSesion();
        const ejercicios = await prisma.ejercicio.findMany({
            where: { entrenadorId: cliente.entrenadorId, visibleParaClientes: true },
            select: { id: true, nombre: true, musculoPrincipal: true },
            orderBy: { nombre: 'asc' }
        });
        return { exito: true, ejercicios };
    } catch {
        return { error: "No se pudieron obtener ejercicios." };
    }
}

export async function registrarTesteoAlumno(formData: FormData) {
    try {
        const cliente = await getAlumnoSesion();
        const ejercicioId = formData.get("ejercicioId") as string;
        const pesoKg = parseFloat(formData.get("pesoKg") as string);
        const reps = parseInt(formData.get("reps") as string);

        if (!ejercicioId || isNaN(pesoKg) || isNaN(reps)) {
            return { error: "Datos incompletos" };
        }

        const datosCliente = await prisma.cliente.findUnique({
            where: { id: cliente.id },
            include: { checkins: { orderBy: { fecha: 'desc' }, take: 1 } }
        });

        const unRM = calcularUnRM(pesoKg, reps);
        const pesoCorporal = datosCliente?.checkins?.[0]?.pesoKg || 0;
        const fuerzaRelativa = calcularFuerzaRelativa(unRM, pesoCorporal);

        await prisma.resultadoTesteo.create({
            data: {
                clienteId: cliente.id,
                ejercicioId,
                modalidad: "INDIRECTO",
                pesoUtilizado: pesoKg,
                repsRealizadas: reps,
                unRMCalculado: unRM,
                fuerzaRelativa
            }
        });

        const tabla = calcularTablaCompleta(unRM);

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
            where: { clienteId_ejercicioId: { clienteId: cliente.id, ejercicioId } },
            update: { ...porcentajesData, unRM, fechaTesteo: new Date() },
            create: {
                clienteId: cliente.id,
                ejercicioId,
                unRM,
                modalidadTesteo: "INDIRECTO",
                fechaTesteo: new Date(),
                ...porcentajesData
            }
        });

        revalidatePath("/alumno/progreso");
        return { exito: true };

    } catch {
        return { error: "Error al registrar RM" };
    }
}
