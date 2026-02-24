"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";

/**
 * Obtiene las notas generales del dashboard del entrenador.
 */
export async function obtenerNotasDashboard() {
    try {
        const entrenador = await getEntrenadorSesion();

        const notas = await prisma.notaEntrenador.findMany({
            where: { entrenadorId: entrenador.id },
            orderBy: { creadaEn: 'desc' }
        });

        return { exito: true, notas };
    } catch (error) {
        console.error("Error al obtener notas:", error);
        return { exito: false, notas: [] };
    }
}

/**
 * Crea una nueva nota en el dashboard.
 */
export async function crearNotaDashboard(contenido: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        await prisma.notaEntrenador.create({
            data: {
                entrenadorId: entrenador.id,
                contenido,
                orden: 0 // De momento simple
            }
        });

        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error al crear nota:", error);
        return { error: "No se pudo guardar la nota" };
    }
}

/**
 * Elimina una nota del dashboard.
 */
export async function eliminarNotaDashboard(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        await prisma.notaEntrenador.delete({
            where: { id, entrenadorId: entrenador.id }
        });

        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error al eliminar nota:", error);
        return { error: "No se pudo eliminar la nota" };
    }
}
