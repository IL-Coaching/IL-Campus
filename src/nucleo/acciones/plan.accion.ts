"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { revalidatePath } from "next/cache";
import { EsquemaPlan, EsquemaActualizarPlan } from "../validadores/plan.validador";

/**
 * Obtiene la lista de planes del entrenador actual.
 */
export async function obtenerPlanes() {
    try {
        const entrenador = await getEntrenadorSesion();
        const planes = await prisma.plan.findMany({
            where: { entrenadorId: entrenador.id },
            orderBy: { creadoEn: 'desc' },
            include: {
                _count: { select: { asignaciones: true } }
            }
        });
        return { exito: true, planes };
    } catch (error) {
        console.error("Error al obtener planes:", error);
        return { exito: false, error: "No se pudieron obtener los planes." };
    }
}

/**
 * Crea un nevo plan.
 */
export async function crearPlan(data: unknown) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Validación con Zod
        const datosValidados = EsquemaPlan.parse(data);

        // Si el nuevo plan es popular, desmarcar los demás primero
        if (datosValidados.esPopular) {
            await prisma.plan.updateMany({
                where: { entrenadorId: entrenador.id },
                data: { esPopular: false }
            });
        }

        const nuevoPlan = await prisma.plan.create({
            data: {
                entrenadorId: entrenador.id,
                ...datosValidados
            }
        });

        revalidatePath('/entrenador/planes');
        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true, plan: nuevoPlan };
    } catch (error) {
        console.error("Error al crear plan:", error);
        return { exito: false, error: "No se pudo crear el plan." };
    }
}

/**
 * Actualiza un plan existente. Requiere validación BOLA.
 */
export async function actualizarPlan(id: string, data: unknown) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Validación con Zod incorporando el id
        const datosValidados = EsquemaActualizarPlan.parse({ id, ...(data as object) });

        // Si se está marcando como popular, desmarcar los demás primero
        if (datosValidados.esPopular === true) {
            await prisma.plan.updateMany({
                where: { entrenadorId: entrenador.id, id: { not: id } },
                data: { esPopular: false }
            });
        }

        await prisma.plan.update({
            where: { id: datosValidados.id, entrenadorId: entrenador.id }, // BOLA
            data: {
                nombre: datosValidados.nombre,
                precio: datosValidados.precio,
                precioPromocional: datosValidados.precioPromocional,
                mesesPromocion: datosValidados.mesesPromocion,
                duracionDias: datosValidados.duracionDias,
                descripcion: datosValidados.descripcion,
                beneficios: datosValidados.beneficios,
                visible: datosValidados.visible,
                esPopular: datosValidados.esPopular
            }
        });

        revalidatePath('/entrenador/planes');
        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar plan:", error);
        return { exito: false, error: "No se pudo actualizar el plan." };
    }
}

/**
 * Elimina un plan existente si no tiene asignaciones.
 */
export async function eliminarPlan(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Validar si tiene asignaciones (no se puede borrar físicamente si las tiene)
        const count = await prisma.planAsignado.count({
            where: { planId: id, plan: { entrenadorId: entrenador.id } } // BOLA indirecto
        });

        if (count > 0) {
            return { exito: false, error: "No puedes eliminar un plan que ya tiene clientes asignados. Ocultalo en su lugar." };
        }

        await prisma.plan.delete({
            where: { id, entrenadorId: entrenador.id } // BOLA
        });

        revalidatePath('/entrenador/planes');
        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true };
    } catch (error) {
        console.error("Error al eliminar plan:", error);
        return { exito: false, error: "No se pudo eliminar el plan." };
    }
}
