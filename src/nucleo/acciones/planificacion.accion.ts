"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";
import { EsquemaNuevoMacrociclo, EsquemaActualizarEjercicio } from "../validadores/planificacion.validador";

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

        const rawData = {
            duracion: formData.get("duracion"),
            fechaInicio: formData.get("fechaInicio"),
        };

        const validacion = EsquemaNuevoMacrociclo.safeParse(rawData);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const { duracion, fechaInicio } = validacion.data;

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
    tempo?: string;
    pesoSugerido?: number;
    notas?: string;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Validar inputs
        const validacion = EsquemaActualizarEjercicio.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        // 2. Mitigación BOLA: Verificar propiedad del ejercicio
        const ejercicioPropio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id: ejercicioPlanificadoId,
                diaSesion: {
                    semana: {
                        bloqueMensual: {
                            macrociclo: {
                                cliente: {
                                    entrenadorId: entrenador.id
                                }
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
            repsMin: validacion.data.repsMin,
            repsMax: validacion.data.repsMax,
            RIR: validacion.data.RIR,
            descansoSegundos: validacion.data.descanso,
            tempo: validacion.data.tempo,
            pesoSugerido: validacion.data.pesoSugerido,
            notasTecnicas: validacion.data.notas
        });

        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function agregarEjercicio(diaId: string, ejercicioId: string, orden: number) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Mitigación BOLA: Verificar que el día pertenece a un cliente del entrenador
        const diaPropio = await prisma.diaSesion.findFirst({
            where: {
                id: diaId,
                semana: {
                    bloqueMensual: {
                        macrociclo: {
                            cliente: {
                                entrenadorId: entrenador.id
                            }
                        }
                    }
                }
            }
        });

        if (!diaPropio) throw new Error("Acceso denegado al recurso.");

        await PlanificacionServicio.agregarEjercicioASesion(diaId, ejercicioId, orden);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function eliminarEjercicio(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Mitigación BOLA
        const ejercicioPropio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id,
                diaSesion: {
                    semana: {
                        bloqueMensual: {
                            macrociclo: {
                                cliente: {
                                    entrenadorId: entrenador.id
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!ejercicioPropio) throw new Error("No tienes permiso para eliminar este ejercicio.");

        await PlanificacionServicio.eliminarEjercicioPlanificado(id);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function actualizarSemana(id: string, data: any) {
    try {
        await getEntrenadorSesion();
        await PlanificacionServicio.actualizarSemana(id, data);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function actualizarMesociclo(id: string, data: {
    objetivo?: string;
    metodo?: string;
    rangoReferencia?: string;
}) {
    try {
        await getEntrenadorSesion();
        await PlanificacionServicio.actualizarBloqueMensual(id, data);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function actualizarMacrociclo(id: string, data: {
    duracionSemanas?: number;
    fechaInicio?: Date;
    notas?: string;
}) {
    try {
        await getEntrenadorSesion();
        await PlanificacionServicio.actualizarMacrociclo(id, data);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function agregarMesociclo(macrocicloId: string, data: {
    objetivo: string;
    metodo?: string;
    rangoReferencia?: string;
    numeroMes: number;
    numSemanas?: number;
    numSesiones?: number;
}) {
    try {
        await getEntrenadorSesion();
        await PlanificacionServicio.agregarMesociclo(macrocicloId, {
            ...data,
            numSesionesPorSemana: data.numSesiones
        });
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function crearSesion(semanaId: string, diaSemana: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA
        const semanaPropia = await prisma.semana.findFirst({
            where: {
                id: semanaId,
                bloqueMensual: {
                    macrociclo: {
                        cliente: { entrenadorId: entrenador.id }
                    }
                }
            }
        });

        if (!semanaPropia) throw new Error("Acceso denegado.");

        await PlanificacionServicio.crearNuevaSesion(semanaId, diaSemana);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}

export async function eliminarSesion(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA
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
            }
        });

        if (!sesionPropia) throw new Error("Acceso denegado.");

        await PlanificacionServicio.eliminarSesion(id);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}
