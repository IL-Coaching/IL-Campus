"use server";

import { prisma } from "@/baseDatos/conexion";
import { getAlumnoSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";

/**
 * guardarSeries — Acción del alumno para registrar su entrenamiento real.
 * Crea o reutiliza la SesionRegistrada del día y persiste cada SerieRegistrada.
 * @security Solo el alumno autenticado puede guardar sus propias series (anti-BOLA).
 */
export async function guardarSeries(data: {
    diaId: string;
    ejercicioPlanificadoId: string;
    series: { pesoKg: number | null; repsReales: number | null }[];
}) {
    try {
        const alumno = await getAlumnoSesion();

        // Mitigación BOLA: Verificar que el día pertenece al alumno autenticado
        const diaValido = await prisma.diaSesion.findFirst({
            where: {
                id: data.diaId,
                semana: {
                    bloqueMensual: {
                        macrociclo: {
                            clienteId: alumno.id
                        }
                    }
                }
            }
        });

        if (!diaValido) {
            return { error: "Acceso denegado al recurso." };
        }

        // Buscar o crear SesionRegistrada de hoy para este día
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        let sesion = await prisma.sesionRegistrada.findFirst({
            where: {
                clienteId: alumno.id,
                diaId: data.diaId,
                fecha: { gte: hoy, lt: manana }
            }
        });

        if (!sesion) {
            sesion = await prisma.sesionRegistrada.create({
                data: {
                    clienteId: alumno.id,
                    diaId: data.diaId,
                    completada: false
                }
            });
        }

        // Eliminar series previas de este ejercicio en esta sesión
        await prisma.serieRegistrada.deleteMany({
            where: {
                sesionId: sesion.id,
                ejercicioPlanificadoId: data.ejercicioPlanificadoId
            }
        });

        // Crear las nuevas series
        const seriesData = data.series
            .filter(s => s.pesoKg !== null || s.repsReales !== null)
            .map(s => ({
                sesionId: sesion!.id,
                ejercicioPlanificadoId: data.ejercicioPlanificadoId,
                pesoKg: s.pesoKg,
                repsReales: s.repsReales,
                completada: true
            }));

        if (seriesData.length > 0) {
            await prisma.serieRegistrada.createMany({ data: seriesData });
        }

        revalidatePath("/alumno/rutina");
        return { exito: true, sesionId: sesion.id };
    } catch (error) {
        console.error("Error al guardar series:", error);
        return { error: error instanceof Error ? error.message : "No se pudieron guardar las series." };
    }
}

/**
 * obtenerSeriesRegistradas — Devuelve las series del alumno para un día dado (hoy).
 */
export async function obtenerSeriesRegistradas(diaId: string) {
    try {
        const alumno = await getAlumnoSesion();

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const sesion = await prisma.sesionRegistrada.findFirst({
            where: {
                clienteId: alumno.id,
                diaId,
                fecha: { gte: hoy, lt: manana }
            },
            include: {
                series: true
            }
        });

        return { exito: true, series: sesion?.series ?? [] };
    } catch {
        return { exito: false, series: [] };
    }
}
