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

        await PlanificacionServicio.agregarEjercicioASesion(diaId, ejercicioId, orden, nombreLibre);
        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual.macrociclo.clienteId}/planificacion`);
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
        revalidatePath(`/entrenador/clientes/${ejercicioPropio.diaSesion.semana.bloqueMensual.macrociclo.clienteId}/planificacion`);
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
        revalidatePath(`/entrenador/clientes/${semanaPropia.bloqueMensual.macrociclo.clienteId}/planificacion`);
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

        const clienteId = destino.semana.bloqueMensual.macrociclo.clienteId;

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
        revalidatePath(`/entrenador/clientes/${semanaPropia.bloqueMensual.macrociclo.clienteId}/planificacion`);
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
        revalidatePath(`/entrenador/clientes/${sesionPropia.semana.bloqueMensual.macrociclo.clienteId}/planificacion`);
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

        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al reordenar" };
    }
}

export async function agruparEjercicios(diaId: string, ejercicioIds: string[], nombreGrupo: string, modalidad: ModalidadBloque = 'SECUENCIAL') {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual.macrociclo.clienteId;
        await PlanificacionServicio.agruparEjercicios(diaId, ejercicioIds, nombreGrupo, modalidad);
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

        const clienteId = diaPropio.semana.bloqueMensual.macrociclo.clienteId;
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

        const clienteId = diaPropio.semana.bloqueMensual.macrociclo.clienteId;
        await PlanificacionServicio.actualizarNombreGrupo(grupoId, nombre);
        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar nombre del grupo" };
    }
}

export async function actualizarBloqueSesion(diaId: string, bloqueId: string, data: { modalidad?: ModalidadBloque, nombre?: string }) {
    try {
        const entrenador = await getEntrenadorSesion();
        const diaPropio = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: entrenador.id } } } } },
            include: { semana: { include: { bloqueMensual: { include: { macrociclo: true } } } } }
        });
        if (!diaPropio) throw new Error("Acceso denegado.");

        const clienteId = diaPropio.semana.bloqueMensual.macrociclo.clienteId;
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

        const clienteId = diaPropio.semana.bloqueMensual.macrociclo.clienteId;
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

        const clienteId = semanaDestino.bloqueMensual.macrociclo.clienteId;

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

        revalidatePath(`/entrenador/clientes/${diaPropio.semana.bloqueMensual.macrociclo.clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar sesión." };
    }
}
