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
    series: { pesoKg: number | null; repsReales: number | null; notas?: string | null }[];
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

        // PRICIPIO: "El cuerpo no entiende de calendarios, solo de estímulos".
        // Buscamos la sesión registrada para este ESTÍMULO (diaId). 
        // Ya no validamos si fue iniciada "hoy" o "ayer", simplemente buscamos la sesión en curso.
        let sesion = await prisma.sesionRegistrada.findFirst({
            where: {
                clienteId: alumno.id,
                diaId: data.diaId
            },
            orderBy: {
                fecha: 'desc' // Tomar el intento más reciente de este estímulo
            }
        });

        if (!sesion) {
            sesion = await prisma.sesionRegistrada.create({
                data: {
                    clienteId: alumno.id,
                    diaId: data.diaId,
                    completada: false // Requiere finalizar manualmente
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

        // Crear las nuevas series (ahora puede solo guardar notas sin reps/peso)
        // Filtramos para asegurar que peso y reps sean positivos si se proveen
        const seriesData = data.series
            .filter(s => {
                const tienePeso = s.pesoKg !== null && s.pesoKg > 0;
                const tieneReps = s.repsReales !== null && s.repsReales > 0;
                const tieneNotas = s.notas !== null && s.notas && s.notas.trim() !== "";
                return tienePeso || tieneReps || tieneNotas;
            })
            .map(s => ({
                sesionId: sesion!.id,
                ejercicioPlanificadoId: data.ejercicioPlanificadoId,
                pesoKg: s.pesoKg !== null && s.pesoKg > 0 ? s.pesoKg : null,
                repsReales: s.repsReales !== null && s.repsReales > 0 ? s.repsReales : null,
                notas: s.notas || null,
                completada: true
            }));

        if (seriesData.length > 0) {
            await prisma.serieRegistrada.createMany({ data: seriesData });
        }

        revalidatePath("/alumno/rutina");
        revalidatePath("/alumno/dashboard");
        return { exito: true, sesionId: sesion.id };
    } catch (error) {
        console.error("Error al guardar series:", error);
        return { error: error instanceof Error ? error.message : "No se pudieron guardar las series." };
    }
}

/**
 * obtenerSeriesRegistradas — Devuelve las series del alumno para un día dado.
 * Ya no dependemos de fechas, si una sesión existe para el estímulo `diaId` (sea de ayer o de hace un mes),
 * seguimos con esa hasta que esté marcada como `completada: true`.
 */
export async function obtenerSeriesRegistradas(diaId: string) {
    try {
        const alumno = await getAlumnoSesion();

        const sesion = await prisma.sesionRegistrada.findFirst({
            where: {
                clienteId: alumno.id,
                diaId
            },
            orderBy: {
                fecha: 'desc'
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

/**
 * finalizarSesion — Marca la sesión del estímulo como completada.
 */
export async function finalizarSesion(diaId: string) {
    try {
        const alumno = await getAlumnoSesion();

        const sesion = await prisma.sesionRegistrada.findFirst({
            where: {
                clienteId: alumno.id,
                diaId
            },
            orderBy: {
                fecha: 'desc'
            }
        });

        if (!sesion) {
            // Si no hay sesión, creamos una completada (ej: el alumno entró y finalizó sin cargar nada)
            await prisma.sesionRegistrada.create({
                data: {
                    clienteId: alumno.id,
                    diaId,
                    completada: true
                }
            });
        } else if (!sesion.completada) {
            await prisma.sesionRegistrada.update({
                where: { id: sesion.id },
                data: { completada: true }
            });
        }

        revalidatePath("/alumno/rutina");
        revalidatePath("/alumno/dashboard");
        return { exito: true };
    } catch (error) {
        console.error("Error al finalizar sesión:", error);
        return { error: "No se pudo finalizar la sesión." };
    }
}
