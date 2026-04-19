"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";

export async function crearSesion(semanaId: string, diaSemana: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const semanaPropia = await prisma.semana.findFirst({
            where: {
                id: semanaId,
                bloqueMensual: {
                    macrociclo: {
                        cliente: { entrenadorId: entrenador.id }
                    }
                }
            },
            include: { bloqueMensual: { include: { macrociclo: true } } }
        });

        if (!semanaPropia) throw new Error("Acceso denegado.");

        await PlanificacionServicio.crearNuevaSesion(semanaId, diaSemana);
        revalidatePath(`/entrenador/clientes/${semanaPropia.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}

export async function eliminarSesion(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const sesionPropia = await prisma.diaSesion.findFirst({
            where: {
                id,
                semana: {
                    bloqueMensual: {
                        macrociclo: {
                            cliente: { entrenadorId: entrenador.id }
                        }
                    }
                }
            },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });

        if (!sesionPropia) throw new Error("Acceso denegado.");

        await PlanificacionServicio.eliminarSesion(id);
        revalidatePath(`/entrenador/clientes/${sesionPropia.semana.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}

export async function actualizarDiaSesion(id: string, data: { notas?: string }) {
    try {
        const entrenador = await getEntrenadorSesion();

        const diaPropio = await prisma.diaSesion.findFirst({
            where: {
                id,
                semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } }
            },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });

        if (!diaPropio) throw new Error("Acceso denegado.");

        await prisma.diaSesion.update({ where: { id }, data });
        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar sesión." };
    }
}

export async function clonarContenidoSesion(idOrigen: string, idDestino: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const [origen, destino] = await Promise.all([
            prisma.diaSesion.findFirst({
                where: { id: idOrigen, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
                include: { ejercicios: true, bloques: true }
            }),
            prisma.diaSesion.findFirst({
                where: { id: idDestino, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
                include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
            })
        ]);

        if (!origen) throw new Error("Sesión origen no encontrada o acceso denegado.");
        if (!destino) throw new Error("Sesión destino no encontrada o acceso denegado.");

        const clienteId = destino.semana.bloqueMensual?.macrociclo.clienteId;

        await prisma.$transaction(async (tx) => {
            await tx.ejercicioPlanificado.deleteMany({ where: { diaId: idDestino } });
            await tx.bloqueSesion.deleteMany({ where: { diaId: idDestino } });

            const groupMap = new Map<string, string>();

            for (const bloque of origen.bloques) {
                const nuevoBloque = await tx.bloqueSesion.create({
                    data: {
                        diaId: idDestino,
                        nombre: bloque.nombre,
                        orden: bloque.orden,
                        modalidad: bloque.modalidad,
                        tipo: bloque.tipo,
                        rounds: bloque.rounds,
                    }
                });
                groupMap.set(bloque.id, nuevoBloque.id);
            }

            for (const ej of origen.ejercicios) {
                let nuevoGrupoId = null;
                if (ej.grupoId && groupMap.has(ej.grupoId)) {
                    nuevoGrupoId = groupMap.get(ej.grupoId);
                }

                await tx.ejercicioPlanificado.create({
                    data: {
                        diaId: idDestino,
                        ejercicioId: ej.ejercicioId,
                        nombreLibre: ej.nombreLibre,
                        esBiblioteca: ej.esBiblioteca,
                        series: ej.series,
                        repsMin: ej.repsMin,
                        repsMax: ej.repsMax,
                        RIR: ej.RIR,
                        tempo: ej.tempo,
                        descansoSegundos: ej.descansoSegundos,
                        pesoSugerido: ej.pesoSugerido,
                        notasTecnicas: ej.notasTecnicas,
                        orden: ej.orden,
                        esTesteo: ej.esTesteo,
                        modalidadTesteo: ej.modalidadTesteo,
                        grupoId: nuevoGrupoId,
                        bloqueId: nuevoGrupoId,
                        nombreGrupo: ej.nombreGrupo
                    }
                });
            }
        });

        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        console.error("Error al clonar sesión:", error);
        return { error: error instanceof Error ? error.message : "No se pudo clonar el contenido." };
    }
}
