"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";
import { ModalidadBloque } from "@prisma/client";
import { EsquemaActualizarEjercicio } from "../validadores/planificacion.validador";

export async function guardarCambiosEjercicio(ejercicioPlanificadoId: string, data: {
    series?: number;
    modoMedicion?: 'REPS' | 'TIEMPO' | 'DISTANCIA' | 'AMRAP';
    repsMin?: number | null;
    repsMax?: number | null;
    tiempoObjetivoSeg?: number | null;
    RIR?: number | null;
    descanso?: number | null;
    tempo?: string;
    pesoSugerido?: number;
    notas?: string;
    ejercicioId?: string | null;
    nombreLibre?: string | null;
    esBiblioteca?: boolean;
    esTesteo?: boolean;
    modalidadTesteo?: 'DIRECTO' | 'INDIRECTO' | null;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        const validacion = EsquemaActualizarEjercicio.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const ejercicioPropio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id: ejercicioPlanificadoId,
                diaSesion: {
                    semana: {
                        bloqueMensual: {
                            macrociclo: {
                                cliente: { entrenadorId: entrenador.id }
                            }
                        }
                    }
                }
            }
        });

        if (!ejercicioPropio) {
            return { error: "No tienes permiso para modificar este ejercicio." };
        }

        await PlanificacionServicio.actualizarEjercicioPlanificado(ejercicioPlanificadoId, {
            series: validacion.data.series,
            modoMedicion: validacion.data.modoMedicion,
            repsMin: validacion.data.repsMin,
            repsMax: validacion.data.repsMax,
            tiempoObjetivoSeg: validacion.data.tiempoObjetivoSeg,
            RIR: validacion.data.RIR,
            descansoSegundos: validacion.data.descanso,
            tempo: validacion.data.tempo,
            pesoSugerido: validacion.data.pesoSugerido,
            notasTecnicas: validacion.data.notas,
            ejercicioId: validacion.data.ejercicioId,
            nombreLibre: validacion.data.nombreLibre,
            esBiblioteca: validacion.data.esBiblioteca,
            esTesteo: validacion.data.esTesteo,
            modalidadTesteo: validacion.data.modalidadTesteo,
        });

        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function agregarEjercicio(diaId: string, ejercicioId: string | null, orden: number, nombreLibre?: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const diaPropio = await prisma.diaSesion.findFirst({
            where: {
                id: diaId,
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

        if (!diaPropio) throw new Error("Acceso denegado al recurso.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo?.clienteId;
        if (!clienteId) throw new Error("No se puede determinar el cliente.");

        await PlanificacionServicio.agregarEjercicioASesion(diaId, ejercicioId, orden, nombreLibre);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function eliminarEjercicio(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const ejercicioPropio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id,
                diaSesion: {
                    semana: {
                        bloqueMensual: {
                            macrociclo: {
                                cliente: { entrenadorId: entrenador.id }
                            }
                        }
                    }
                }
            },
            include: { diaSesion: { include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } } } }
        });

        if (!ejercicioPropio) throw new Error("No tienes permiso para eliminar este ejercicio.");

        await PlanificacionServicio.eliminarEjercicioPlanificado(id);
        revalidatePath(`/entrenador/clientes/${ejercicioPropio.diaSesion.semana.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function reordenarEjercicios(diaId: string, ejercicioIds: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();

        const diaPropio = await prisma.diaSesion.findFirst({
            where: {
                id: diaId,
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

        if (!diaPropio) throw new Error("Acceso denegado.");

        await prisma.$transaction(
            ejercicioIds.map((id, index) =>
                prisma.ejercicioPlanificado.update({
                    where: { id },
                    data: { orden: index + 1 }
                })
            )
        );

        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al reordenar" };
    }
}

export async function agruparEjercicios(diaId: string, ejercicioIds: string[], nombreGrupo: string, modalidad: ModalidadBloque = 'SECUENCIAL', tipo: 'AGRUPACION' | 'CIRCUITO' = 'AGRUPACION', rounds?: number, bloquePadreId?: string) {
    try {
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: await getEntrenadorSesion().then(e => e.id) } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo.clienteId;
        await PlanificacionServicio.agruparEjercicios(diaId, ejercicioIds, nombreGrupo, modalidad, tipo, rounds, bloquePadreId);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al agrupar" };
    }
}

export async function desagruparEjercicios(diaId: string, grupoId: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo.clienteId;
        await PlanificacionServicio.desagruparEjercicios(grupoId);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al desagrupar" };
    }
}

export async function actualizarNombreGrupo(diaId: string, grupoId: string, nombre: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo.clienteId;
        await PlanificacionServicio.actualizarNombreGrupo(grupoId, nombre);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar nombre del grupo" };
    }
}

export async function actualizarBloqueSesion(diaId: string, bloqueId: string, data: { modalidad?: ModalidadBloque, nombre?: string, tipo?: 'AGRUPACION' | 'CIRCUITO', rounds?: number }) {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo.clienteId;
        await PlanificacionServicio.actualizarBloqueSesion(bloqueId, data);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar bloque" };
    }
}

export async function vincularEjerciciosABloque(diaId: string, bloqueId: string, ejercicioIds: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual?.macrociclo.clienteId;
        await PlanificacionServicio.vincularEjerciciosABloque(bloqueId, ejercicioIds);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al vincular ejercicios" };
    }
}
