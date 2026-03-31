"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { PlanificacionServicio } from "../servicios/planificacion.servicio";
import { prisma } from "@/baseDatos/conexion";
import { TipoCarga, ModeloPeriodizacion, ModalidadBloque } from "@prisma/client";
import { EsquemaNuevoMacrociclo, EsquemaActualizarEjercicio, EsquemaActualizarSemana, EsquemaActualizarMesociclo, EsquemaActualizarMacrociclo, EsquemaNuevoMesociclo } from "../validadores/planificacion.validador";

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

        // Mitigación BOLA
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



export async function clonarContenidoSesion(idOrigen: string, idDestino: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA: Validar propiedad de ambas sesiones
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
            // Limpiar destino
            await tx.ejercicioPlanificado.deleteMany({ where: { diaId: idDestino } });
            await tx.bloqueSesion.deleteMany({ where: { diaId: idDestino } });

            const groupMap = new Map<string, string>(); // viejo_grupo_id -> nuevo_grupo_id

            // Clonar bloques primero
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

        // Mitigación BOLA
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

export async function eliminarMesociclo(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA
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

export async function obtenerVolumenSemanal(semanaId: string) {
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

        const { VolumenServicio } = await import("../servicios/volumen.servicio");
        const volumen = await VolumenServicio.calcularVolumenSemanal(semanaId);
        return { exito: true, volumen };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error" };
    }
}
export async function reordenarEjercicios(diaId: string, ejercicioIds: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Mitigación BOLA
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

/**
 * Clona el contenido completo de una semana (microciclo) a otra semana destino.
 * Copia todas las sesiones con sus ejercicios, parámetros y agrupaciones.
 * @security Valida que el entrenador sea propietario de ambas semanas (BOLA).
 */
export async function clonarSemana(semanaOrigenId: string, semanaDestinoId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA: verificar propiedad de ambas semanas
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
            // 1. Eliminar ejercicios de las sesiones destino y luego las sesiones
            for (const dia of semanaDestino.diasSesion) {
                await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
                await tx.bloqueSesion.deleteMany({ where: { diaId: dia.id } });
            }
            await tx.diaSesion.deleteMany({ where: { semanaId: semanaDestinoId } });

            // 2. Recrear las sesiones y ejercicios del origen en el destino
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
                
                // Clonar bloques
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

        await prisma.diaSesion.update({
            where: { id },
            data
        });

        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual?.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar sesión." };
    }
}

// ============================================================
// ACCIONES DE PLANTILLAS (BIBLIOTECA)
// ============================================================

export async function obtenerPlantillasSemana() {
    try {
        await getEntrenadorSesion();
        
        const plantillas = await prisma.semana.findMany({
            where: {
                esPlantilla: true,
                bloqueMensual: null, // Las plantillas no tienen bloque mensual
                OR: [
                    { plantillaNombre: { not: null } },
                    { diasSesion: { some: {} } }
                ]
            },
            include: {
                diasSesion: {
                    include: {
                        ejercicios: {
                            include: { ejercicio: true },
                            orderBy: { orden: 'asc' }
                        }
                    },
                    orderBy: { diaSemana: 'asc' }
                }
            }
        });

        return { exito: true, plantillas };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al obtener plantillas" };
    }
}

export async function crearPlantillaSemana(data: {
    nombre: string;
    objetivoSemana?: string;
    esFaseDeload?: boolean;
}) {
    try {
        await getEntrenadorSesion();
        
        // Crear semana plantilla (sin bloque mensual)
        const plantilla = await prisma.semana.create({
            data: {
                numeroSemana: 1,
                objetivoSemana: data.objetivoSemana || 'Entrenamiento general',
                RIRobjetivo: 2,
                volumenEstimado: 'Medio',
                esPlantilla: true,
                plantillaNombre: data.nombre,
                esFaseDeload: data.esFaseDeload || false,
                bloqueMensualId: null,
                // Guardamos referencia al entrenador para seguridad
            },
            include: {
                diasSesion: true
            }
        });

        // Crear los 7 días de la semana vacíos
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        await prisma.diaSesion.createMany({
            data: diasSemana.map(dia => ({
                semanaId: plantilla.id,
                diaSemana: dia,
                focoMuscular: ''
            }))
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true, plantilla };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al crear plantilla" };
    }
}

export async function actualizarPlantillaSemana(semanaId: string, data: {
    nombre?: string;
    objetivoSemana?: string;
    esFaseDeload?: boolean;
}) {
    try {
        await getEntrenadorSesion();

        // Verificar propiedad
        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaId, esPlantilla: true }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        await prisma.semana.update({
            where: { id: semanaId },
            data: {
                plantillaNombre: data.nombre,
                objetivoSemana: data.objetivoSemana,
                esFaseDeload: data.esFaseDeload
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar plantilla" };
    }
}

export async function actualizarDiaPlantilla(diaId: string, data: {
    focoMuscular?: string;
    notas?: string;
}) {
    try {
        await getEntrenadorSesion();

        // Verificar que el día pertenece a una plantilla
        const dia = await prisma.diaSesion.findFirst({
            where: {
                id: diaId,
                semana: { esPlantilla: true }
            }
        });

        if (!dia) throw new Error("Día no encontrado.");

        await prisma.diaSesion.update({
            where: { id: diaId },
            data: {
                focoMuscular: data.focoMuscular,
                notas: data.notas
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar día" };
    }
}

export async function agregarEjercicioAPlantilla(diaId: string, ejercicioId: string | null, nombreLibre?: string) {
    try {
        await getEntrenadorSesion();

        // Verificar que el día pertenece a una plantilla
        const dia = await prisma.diaSesion.findFirst({
            where: {
                id: diaId,
                semana: { esPlantilla: true }
            },
            include: { ejercicios: true }
        });

        if (!dia) throw new Error("Día no encontrado.");

        const ultimoOrden = dia.ejercicios.length > 0 
            ? Math.max(...dia.ejercicios.map(e => e.orden)) 
            : 0;

        await prisma.ejercicioPlanificado.create({
            data: {
                diaId,
                ejercicioId,
                nombreLibre: nombreLibre || null,
                esBiblioteca: !!ejercicioId,
                series: 3,
                repsMin: 8,
                repsMax: 12,
                descansoSegundos: 90,
                orden: ultimoOrden + 1
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al agregar ejercicio" };
    }
}

export async function guardarCambiosEjercicioPlantilla(ejercicioId: string, data: {
    series?: number;
    repsMin?: number | null;
    repsMax?: number | null;
    descansoSegundos?: number | null;
    RIR?: number | null;
    tempo?: string | null;
    pesoSugerido?: number | null;
    notasTecnicas?: string | null;
}) {
    try {
        await getEntrenadorSesion();

        // Verificar propiedad
        const ejercicio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id: ejercicioId,
                diaSesion: { semana: { esPlantilla: true } }
            }
        });

        if (!ejercicio) throw new Error("Ejercicio no encontrado.");

        await prisma.ejercicioPlanificado.update({
            where: { id: ejercicioId },
            data: {
                series: data.series,
                repsMin: data.repsMin,
                repsMax: data.repsMax,
                descansoSegundos: data.descansoSegundos,
                RIR: data.RIR,
                tempo: data.tempo,
                pesoSugerido: data.pesoSugerido,
                notasTecnicas: data.notasTecnicas
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al guardar ejercicio" };
    }
}

export async function eliminarEjercicioPlantilla(ejercicioId: string) {
    try {
        const ejercicio = await prisma.ejercicioPlanificado.findFirst({
            where: {
                id: ejercicioId,
                diaSesion: { semana: { esPlantilla: true } }
            }
        });

        if (!ejercicio) throw new Error("Ejercicio no encontrado.");

        await prisma.ejercicioPlanificado.delete({ where: { id: ejercicioId } });
        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al eliminar ejercicio" };
    }
}

export async function reordenarEjerciciosPlantilla(diaId: string, ejercicioIds: string[]) {
    try {
        // Verificar que el día pertenece a una plantilla
        const dia = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { esPlantilla: true } }
        });

        if (!dia) throw new Error("Día no encontrado.");

        await prisma.$transaction(
            ejercicioIds.map((id, index) =>
                prisma.ejercicioPlanificado.update({
                    where: { id },
                    data: { orden: index + 1 }
                })
            )
        );

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al reordenar" };
    }
}

export async function eliminarPlantillaSemana(semanaId: string) {
    try {
        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaId, esPlantilla: true }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        // Eliminar ejercicios, días y la semana
        await prisma.$transaction(async (tx) => {
            const dias = await tx.diaSesion.findMany({ where: { semanaId } });
            for (const dia of dias) {
                await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
            }
            await tx.diaSesion.deleteMany({ where: { semanaId } });
            await tx.semana.delete({ where: { id: semanaId } });
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al eliminar plantilla" };
    }
}

export async function importarSemanaAPlantilla(semanaPlantillaId: string, clienteId: string, semanaDestino: number, modo: 'reemplazar' | 'agregar' = 'agregar') {
    try {
        const entrenador = await getEntrenadorSesion();

        // Verificar propiedad de la plantilla
        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaPlantillaId, esPlantilla: true },
            include: {
                diasSesion: {
                    include: {
                        ejercicios: {
                            include: { ejercicio: true },
                            orderBy: { orden: 'asc' }
                        }
                    }
                }
            }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        // Verificar acceso al cliente
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId, entrenadorId: obtenerEntrenadorId(entrenador) }
        });

        if (!cliente) throw new Error("Cliente no encontrado.");

        // Obtener o crear macrociclo del cliente
        let macrociclo = await prisma.macrociclo.findFirst({
            where: { clienteId },
            include: { bloquesMensuales: { include: { semanas: true } } }
        });

        if (!macrociclo) {
            // Crear macrociclo nuevo si no existe
            macrociclo = await prisma.macrociclo.create({
                data: {
                    clienteId,
                    duracionSemanas: 12,
                    fechaInicio: new Date()
                },
                include: { bloquesMensuales: { include: { semanas: true } } }
            });

            // Crear bloque inicial
            await prisma.bloqueMensual.create({
                data: {
                    macrocicloId: macrociclo.id,
                    objetivo: 'Adaptación',
                    duracion: 4
                }
            });
        }

        const bloque = await prisma.bloqueMensual.findFirst({
            where: { macrocicloId: macrociclo.id }
        });

        if (!bloque) throw new Error("Error al acceder al bloque mensual.");

        if (modo === 'reemplazar') {
            // Reemplazar semana específica
            const semanaExistente = await prisma.semana.findFirst({
                where: { bloqueMensualId: bloque.id, numeroSemana: semanaDestino },
                include: { diasSesion: true }
            });

            if (semanaExistente) {
                // Eliminar días existentes
                await prisma.$transaction(async (tx) => {
                    for (const dia of semanaExistente.diasSesion) {
                        await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
                        await tx.diaSesion.deleteMany({ where: { id: dia.id } });
                    }
                    await tx.semana.delete({ where: { id: semanaExistente.id } });
                });
            }

            // Crear semana nueva clonando la plantilla
            const nuevaSemana = await prisma.semana.create({
                data: {
                    bloqueMensualId: bloque.id,
                    numeroSemana: semanaDestino,
                    objetivoSemana: plantilla.objetivoSemana,
                    RIRobjetivo: plantilla.RIRobjetivo,
                    volumenEstimado: plantilla.volumenEstimado,
                    esFaseDeload: plantilla.esFaseDeload
                }
            });

            // Clonar días y ejercicios
            for (const diaPlantilla of plantilla.diasSesion) {
                const nuevoDia = await prisma.diaSesion.create({
                    data: {
                        semanaId: nuevaSemana.id,
                        diaSemana: diaPlantilla.diaSemana,
                        focoMuscular: diaPlantilla.focoMuscular,
                        notas: diaPlantilla.notas
                    }
                });

                for (const ej of diaPlantilla.ejercicios) {
                    await prisma.ejercicioPlanificado.create({
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
                            orden: ej.orden
                        }
                    });
                }
            }
        } else {
            // Agregar al final (encontrar última semana)
            const ultimasSemanas = await prisma.semana.findMany({
                where: { bloqueMensualId: bloque.id },
                orderBy: { numeroSemana: 'desc' },
                take: 1
            });

            const proximoNumero = ultimasSemanas.length > 0 ? ultimasSemanas[0].numeroSemana + 1 : 1;

            // Crear semana nueva clonando la plantilla
            const nuevaSemana = await prisma.semana.create({
                data: {
                    bloqueMensualId: bloque.id,
                    numeroSemana: proximoNumero,
                    objetivoSemana: plantilla.objetivoSemana,
                    RIRobjetivo: plantilla.RIRobjetivo,
                    volumenEstimado: plantilla.volumenEstimado,
                    esFaseDeload: plantilla.esFaseDeload
                }
            });

            // Clonar días y ejercicios
            for (const diaPlantilla of plantilla.diasSesion) {
                const nuevoDia = await prisma.diaSesion.create({
                    data: {
                        semanaId: nuevaSemana.id,
                        diaSemana: diaPlantilla.diaSemana,
                        focoMuscular: diaPlantilla.focoMuscular,
                        notas: diaPlantilla.notas
                    }
                });

                for (const ej of diaPlantilla.ejercicios) {
                    await prisma.ejercicioPlanificado.create({
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
                            orden: ej.orden
                        }
                    });
                }
            }
        }

        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        console.error("Error al importar plantilla:", error);
        return { error: error instanceof Error ? error.message : "Error al importar plantilla" };
    }
}

function obtenerEntrenadorId(entrenador: { id: string }): string {
    return entrenador.id;
}
