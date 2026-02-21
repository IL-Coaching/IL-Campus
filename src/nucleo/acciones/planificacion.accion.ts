"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";

/**
 * Acciones de Planificación — ArchSecure AI
 * Interfaces seguras para mutar la planificación de los atletas.
 */

export async function crearNuevoMacrociclo(clienteId: string, formData: FormData) {
    try {
        const entrenador = await getEntrenadorSesion();

        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!cliente) {
            throw new Error("No tienes permisos para planificar a este cliente.");
        }

        const duracion = parseInt(formData.get("duracion") as string);
        const fechaInicio = new Date(formData.get("fechaInicio") as string);

        const macro = await PlanificacionServicio.inicializarPlanificacion(clienteId, {
            duracionSemanas: duracion,
            fechaInicio
        });

        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true, id: macro.id };

    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function guardarCambiosEjercicio(ejercicioPlanificadoId: string, data: {
    series?: number;
    repsMin?: number;
    repsMax?: number;
    RIR?: number;
    descanso?: number;
    notas?: string;
}) {
    try {
        await getEntrenadorSesion();

        await PlanificacionServicio.actualizarEjercicioPlanificado(ejercicioPlanificadoId, {
            series: data.series,
            repsMin: data.repsMin,
            repsMax: data.repsMax,
            RIR: data.RIR,
            descansoSegundos: data.descanso,
            notasTecnicas: data.notas
        });

        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}
