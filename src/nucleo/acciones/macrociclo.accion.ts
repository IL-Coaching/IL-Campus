"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";
import { TipoCarga, ModeloPeriodizacion } from "@prisma/client";
import { EsquemaNuevoMacrociclo, EsquemaActualizarSemana, EsquemaActualizarMesociclo, EsquemaActualizarMacrociclo, EsquemaNuevoMesociclo } from "../validadores/planificacion.validador";

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

export async function actualizarMacrociclo(id: string, data: {
    duracionSemanas?: number;
    fechaInicio?: Date;
    notas?: string;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        const validacion = EsquemaActualizarMacrociclo.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const macroPropio = await prisma.macrociclo.findFirst({
            where: {
                id,
                cliente: { entrenadorId: entrenador.id }
            }
        });
        if (!macroPropio) throw new Error("Acceso denegado.");

        await PlanificacionServicio.actualizarMacrociclo(id, validacion.data);
        revalidatePath(`/entrenador/clientes`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function agregarMesociclo(macrocicloId: string, data: {
    nombre?: string;
    objetivo: string;
    metodo?: string;
    rangoReferencia?: string;
    numeroMes: number;
    numSemanas?: number;
    numSesiones?: number;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        const validacion = EsquemaNuevoMesociclo.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const macroPropio = await prisma.macrociclo.findFirst({
            where: {
                id: macrocicloId,
                cliente: { entrenadorId: entrenador.id }
            }
        });

        if (!macroPropio) throw new Error("Acceso denegado.");

        await PlanificacionServicio.agregarMesociclo(macrocicloId, {
            ...validacion.data,
            numSesionesPorSemana: validacion.data.numSesiones
        });
        revalidatePath(`/entrenador/clientes/${macroPropio.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function actualizarMesociclo(id: string, data: {
    nombre?: string;
    objetivo?: string;
    duracion?: number;
    metodo?: string;
    rangoReferencia?: string;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        const validacion = EsquemaActualizarMesociclo.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const bloquePropio = await prisma.bloqueMensual.findFirst({
            where: {
                id,
                macrociclo: {
                    cliente: { entrenadorId: entrenador.id }
                }
            },
            include: { macrociclo: true }
        });

        if (!bloquePropio) throw new Error("Acceso denegado.");

        await PlanificacionServicio.actualizarBloqueMensual(id, validacion.data);
        revalidatePath(`/entrenador/clientes/${bloquePropio.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function eliminarMesociclo(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const bloquePropio = await prisma.bloqueMensual.findFirst({
            where: {
                id,
                macrociclo: {
                    cliente: { entrenadorId: entrenador.id }
                }
            },
            include: { macrociclo: true }
        });

        if (!bloquePropio) throw new Error("Acceso denegado.");

        await PlanificacionServicio.eliminarBloqueMensual(id);
        revalidatePath(`/entrenador/clientes/${bloquePropio.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}

export async function actualizarSemana(id: string, data: {
    objetivoSemana?: string;
    RIRobjetivo?: number;
    volumenEstimado?: string;
    esFaseDeload?: boolean;
    esSemanaTesteo?: boolean;
    tipoCarga?: TipoCarga;
    modeloPeriodizacion?: ModeloPeriodizacion;
    checkinRequerido?: boolean;
}) {
    try {
        const entrenador = await getEntrenadorSesion();

        const validacion = EsquemaActualizarSemana.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const semanaPropia = await prisma.semana.findFirst({
            where: {
                id,
                bloqueMensual: {
                    macrociclo: {
                        cliente: { entrenadorId: entrenador.id }
                    }
                }
            },
            include: { bloqueMensual: { include: { macrociclo: true } } }
        });

        if (!semanaPropia) throw new Error("Acceso denegado.");

        await PlanificacionServicio.actualizarSemana(id, validacion.data);
        revalidatePath(`/entrenador/clientes/${semanaPropia.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        return { error: mensaje };
    }
}

export async function clonarSemana(semanaOrigenId: string, semanaDestinoId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const [semanaOrigen, semanaDestino] = await Promise.all([
            prisma.semana.findFirst({
                where: {
                    id: semanaOrigenId,
                    bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } }
                },
                include: {
                    diasSesion: {
                        include: { ejercicios: true, bloques: true }
                    }
                }
            }),
            prisma.semana.findFirst({
                where: {
                    id: semanaDestinoId,
                    bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } }
                },
                include: {
                    diasSesion: true,
                    bloqueMensual: { include: { macrociclo: true } }
                }
            })
        ]);

        if (!semanaOrigen) throw new Error("Semana origen no encontrada o acceso denegado.");
        if (!semanaDestino) throw new Error("Semana destino no encontrada o acceso denegado.");

        const clienteId = semanaDestino.bloqueMensual?.macrociclo.clienteId;

        await prisma.$transaction(async (tx) => {
            for (const dia of semanaDestino.diasSesion) {
                await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
                await tx.bloqueSesion.deleteMany({ where: { diaId: dia.id } });
            }
            await tx.diaSesion.deleteMany({ where: { semanaId: semanaDestinoId } });

            for (const diaOrigen of semanaOrigen.diasSesion) {
                const nuevoDia = await tx.diaSesion.create({
                    data: {
                        semanaId: semanaDestinoId,
                        diaSemana: diaOrigen.diaSemana,
                        focoMuscular: diaOrigen.focoMuscular,
                        notas: diaOrigen.notas,
                    }
                });

                const groupMap = new Map<string, string>();

                for (const bloque of diaOrigen.bloques) {
                    const nuevoBloque = await tx.bloqueSesion.create({
                        data: {
                            diaId: nuevoDia.id,
                            nombre: bloque.nombre,
                            orden: bloque.orden,
                            modalidad: bloque.modalidad,
                            tipo: bloque.tipo,
                            rounds: bloque.rounds,
                        }
                    });
                    groupMap.set(bloque.id, nuevoBloque.id);
                }

                for (const ej of diaOrigen.ejercicios) {
                    let nuevoGrupoId: string | null = null;
                    if (ej.grupoId && groupMap.has(ej.grupoId)) {
                        nuevoGrupoId = groupMap.get(ej.grupoId)!;
                    }

                    await tx.ejercicioPlanificado.create({
                        data: {
                            diaId: nuevoDia.id,
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
                            nombreGrupo: ej.nombreGrupo,
                        }
                    });
                }
            }
        });

        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        console.error("Error al clonar semana:", error);
        return { error: error instanceof Error ? error.message : "No se pudo clonar la semana." };
    }
}

export async function obtenerVolumenSemanal(semanaId: string) {
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
            }
        });

        if (!semanaPropia) throw new Error("Acceso denegado.");

        const { VolumenServicio } = await import("../servicios/volumen.servicio");
        const volumen = await VolumenServicio.calcularVolumenSemanal(semanaId);
        return { exito: true, volumen };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}
