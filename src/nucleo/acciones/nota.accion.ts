"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todas las notas del entrenador ordenadas por su posición.
 */
export async function obtenerNotas() {
    try {
        const entrenador = await getEntrenadorSesion();

        const notas = await prisma.notaEntrenador.findMany({
            where: { entrenadorId: entrenador.id },
            orderBy: { orden: 'asc' }
        });

        return { exito: true, notas };
    } catch (error) {
        console.error("Error al obtener notas:", error);
        return { exito: false, notas: [] };
    }
}

/**
 * Crea una nueva nota al final de la lista.
 */
export async function crearNota(contenido: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Obtener el orden máximo actual para poner la nueva al final
        const ultimaNota = await prisma.notaEntrenador.findFirst({
            where: { entrenadorId: entrenador.id },
            orderBy: { orden: 'desc' },
            select: { orden: true }
        });

        const nuevoOrden = (ultimaNota?.orden ?? -1) + 1;

        await prisma.notaEntrenador.create({
            data: {
                entrenadorId: entrenador.id,
                contenido,
                orden: nuevoOrden
            }
        });

        revalidatePath('/entrenador/dashboard');
        return { exito: true };
    } catch (error) {
        console.error("Error al crear nota:", error);
        return { error: "No se pudo crear la nota." };
    }
}

/**
 * Actualiza el contenido de una nota existente.
 * @security Valida que la nota pertenece al entrenador en sesión (BOLA).
 */
export async function editarNota(notaId: string, contenido: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const nota = await prisma.notaEntrenador.findFirst({
            where: { id: notaId, entrenadorId: entrenador.id }
        });

        if (!nota) return { error: "Nota no encontrada." };

        await prisma.notaEntrenador.update({
            where: { id: notaId },
            data: { contenido }
        });

        revalidatePath('/entrenador/dashboard');
        return { exito: true };
    } catch (error) {
        console.error("Error al editar nota:", error);
        return { error: "No se pudo editar la nota." };
    }
}

/**
 * Elimina una nota permanentemente.
 * @security Valida que la nota pertenece al entrenador en sesión (BOLA).
 */
export async function eliminarNota(notaId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const nota = await prisma.notaEntrenador.findFirst({
            where: { id: notaId, entrenadorId: entrenador.id }
        });

        if (!nota) return { error: "Nota no encontrada." };

        await prisma.notaEntrenador.delete({ where: { id: notaId } });

        revalidatePath('/entrenador/dashboard');
        return { exito: true };
    } catch (error) {
        console.error("Error al eliminar nota:", error);
        return { error: "No se pudo eliminar la nota." };
    }
}

/**
 * Reordena las notas del entrenador actualizando el campo `orden`.
 * @param idsOrdenados - Array de IDs en el nuevo orden deseado.
 * @security Valida que todas las notas pertenecen al entrenador en sesión.
 */
export async function reordenarNotas(idsOrdenados: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Validar que todas las notas pertenecen al entrenador
        const notasDelEntrenador = await prisma.notaEntrenador.findMany({
            where: { entrenadorId: entrenador.id },
            select: { id: true }
        });

        const idsValidos = new Set(notasDelEntrenador.map(n => n.id));
        const todosValidos = idsOrdenados.every(id => idsValidos.has(id));

        if (!todosValidos) return { error: "Notas inválidas en el reordenamiento." };

        // Actualizar el orden de cada nota
        await prisma.$transaction(
            idsOrdenados.map((id, index) =>
                prisma.notaEntrenador.update({
                    where: { id },
                    data: { orden: index }
                })
            )
        );

        revalidatePath('/entrenador/dashboard');
        return { exito: true };
    } catch (error) {
        console.error("Error al reordenar notas:", error);
        return { error: "No se pudieron reordenar las notas." };
    }
}
