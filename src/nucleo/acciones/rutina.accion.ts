"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todas las rutinas plantilla del entrenador.
 * @security Filtra por entrenadorId en sesión (BOLA).
 */
export async function obtenerRutinas() {
    try {
        const entrenador = await getEntrenadorSesion();

        const rutinas = await prisma.rutinaPlantilla.findMany({
            where: { entrenadorId: entrenador.id },
            include: {
                ejercicios: {
                    orderBy: { orden: 'asc' },
                    include: {
                        ejercicio: {
                            select: { id: true, nombre: true, musculoPrincipal: true, thumbnailUrl: true }
                        }
                    }
                },
                _count: {
                    select: { ejercicios: true }
                }
            },
            orderBy: { creadaEn: 'desc' }
        });

        return { exito: true, rutinas };
    } catch (error) {
        console.error("Error al obtener rutinas:", error);
        return { exito: false, rutinas: [] };
    }
}

/** Datos para crear/actualizar ejercicios dentro de una rutina. */
interface DatosEjercicioRutina {
    ejercicioId?: string | null;
    nombreLibre?: string | null;
    series: number;
    repsMin: number;
    repsMax: number;
    descansoSeg: number;
    tempo?: string | null;
    metodo?: string | null;
    notasTecnicas?: string | null;
    orden: number;
}

/**
 * Crea una nueva rutina plantilla con sus ejercicios.
 * @security Valida entrenadorId en sesión (BOLA).
 */
export async function crearRutina(data: {
    nombre: string;
    descripcion?: string;
    categoria?: string;
    ejercicios: DatosEjercicioRutina[];
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        if (!data.nombre.trim()) return { error: "El nombre de la rutina es obligatorio." };

        const rutina = await prisma.rutinaPlantilla.create({
            data: {
                entrenadorId: entrenador.id,
                nombre: data.nombre.trim(),
                descripcion: data.descripcion?.trim() || null,
                categoria: data.categoria?.trim() || null,
                ejercicios: {
                    create: data.ejercicios.map((ej, i) => ({
                        ejercicioId: ej.ejercicioId || null,
                        nombreLibre: ej.nombreLibre || null,
                        series: ej.series,
                        repsMin: ej.repsMin,
                        repsMax: ej.repsMax,
                        descansoSeg: ej.descansoSeg,
                        tempo: ej.tempo || null,
                        metodo: ej.metodo || null,
                        notasTecnicas: ej.notasTecnicas || null,
                        orden: i
                    }))
                }
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true, rutina };
    } catch (error) {
        console.error("Error al crear rutina:", error);
        return { error: "No se pudo crear la rutina." };
    }
}

/**
 * Actualiza una rutina plantilla existente.
 * Elimina los ejercicios anteriores y los recrea con los nuevos datos.
 * @security Valida propiedad de la rutina por entrenadorId (BOLA).
 */
export async function actualizarRutina(rutinaId: string, data: {
    nombre: string;
    descripcion?: string;
    categoria?: string;
    ejercicios: DatosEjercicioRutina[];
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA
        const rutinaExistente = await prisma.rutinaPlantilla.findFirst({
            where: { id: rutinaId, entrenadorId: entrenador.id }
        });
        if (!rutinaExistente) return { error: "Rutina no encontrada." };

        // Transacción: borrar ejercicios anteriores y recrear
        await prisma.$transaction([
            prisma.ejercicioRutina.deleteMany({ where: { rutinaId } }),
            prisma.rutinaPlantilla.update({
                where: { id: rutinaId },
                data: {
                    nombre: data.nombre.trim(),
                    descripcion: data.descripcion?.trim() || null,
                    categoria: data.categoria?.trim() || null,
                    ejercicios: {
                        create: data.ejercicios.map((ej, i) => ({
                            ejercicioId: ej.ejercicioId || null,
                            nombreLibre: ej.nombreLibre || null,
                            series: ej.series,
                            repsMin: ej.repsMin,
                            repsMax: ej.repsMax,
                            descansoSeg: ej.descansoSeg,
                            tempo: ej.tempo || null,
                            metodo: ej.metodo || null,
                            notasTecnicas: ej.notasTecnicas || null,
                            orden: i
                        }))
                    }
                }
            })
        ]);

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar rutina:", error);
        return { error: "No se pudo actualizar la rutina." };
    }
}

/**
 * Elimina una rutina plantilla y todos sus ejercicios (cascade).
 * @security Valida propiedad por entrenadorId (BOLA).
 */
export async function eliminarRutina(rutinaId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA
        const rutina = await prisma.rutinaPlantilla.findFirst({
            where: { id: rutinaId, entrenadorId: entrenador.id }
        });
        if (!rutina) return { error: "Rutina no encontrada." };

        await prisma.rutinaPlantilla.delete({ where: { id: rutinaId } });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        console.error("Error al eliminar rutina:", error);
        return { error: "No se pudo eliminar la rutina." };
    }
}

/**
 * Duplica una rutina plantilla existente con sus ejercicios.
 * @security Valida propiedad por entrenadorId (BOLA).
 */
export async function duplicarRutina(rutinaId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const original = await prisma.rutinaPlantilla.findFirst({
            where: { id: rutinaId, entrenadorId: entrenador.id },
            include: { ejercicios: { orderBy: { orden: 'asc' } } }
        });
        if (!original) return { error: "Rutina no encontrada." };

        await prisma.rutinaPlantilla.create({
            data: {
                entrenadorId: entrenador.id,
                nombre: `${original.nombre} (copia)`,
                descripcion: original.descripcion,
                categoria: original.categoria,
                ejercicios: {
                    create: original.ejercicios.map((ej) => ({
                        ejercicioId: ej.ejercicioId,
                        nombreLibre: ej.nombreLibre,
                        series: ej.series,
                        repsMin: ej.repsMin,
                        repsMax: ej.repsMax,
                        descansoSeg: ej.descansoSeg,
                        tempo: ej.tempo,
                        metodo: ej.metodo,
                        notasTecnicas: ej.notasTecnicas,
                        orden: ej.orden
                    }))
                }
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        console.error("Error al duplicar rutina:", error);
        return { error: "No se pudo duplicar la rutina." };
    }
}
