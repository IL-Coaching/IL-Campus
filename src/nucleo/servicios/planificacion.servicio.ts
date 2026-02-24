import { prisma } from "@/baseDatos/conexion";
import { MacrocicloCompleto } from "../tipos/planificacion.tipos";
import { TipoCarga, Prisma, ModeloPeriodizacion } from "@prisma/client";

/**
 * Servicio de Planificación — ArchSecure AI
 * Maneja la lógica de Macrociclos, Mesociclos, Semanas y sesiones.
 */
export const PlanificacionServicio = {
    /**
     * Obtiene el macrociclo activo de un cliente con toda su jerarquía.
     */
    async obtenerMacrocicloActivo(clienteId: string): Promise<MacrocicloCompleto | null> {
        return await prisma.macrociclo.findFirst({
            where: { clienteId },
            include: {
                bloquesMensuales: {
                    include: {
                        semanas: {
                            include: {
                                diasSesion: {
                                    include: {
                                        ejercicios: {
                                            include: {
                                                ejercicio: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { creadoEn: 'desc' }
        }) as MacrocicloCompleto | null;
    },

    /**
     * Crea un nuevo macrociclo base para un cliente.
     */
    async crearMacrociclo(data: {
        clienteId: string;
        duracionSemanas: number;
        fechaInicio: Date;
        notas?: string;
    }) {
        return await prisma.macrociclo.create({
            data: {
                clienteId: data.clienteId,
                duracionSemanas: data.duracionSemanas,
                fechaInicio: data.fechaInicio,
                notas: data.notas
            }
        });
    },

    /**
     * Actualiza un macrociclo.
     */
    async actualizarMacrociclo(id: string, data: {
        duracionSemanas?: number;
        fechaInicio?: Date;
        notas?: string;
    }) {
        return await prisma.macrociclo.update({
            where: { id },
            data
        });
    },

    async actualizarBloqueMensual(id: string, data: {
        objetivo?: string;
        duracion?: number;
        metodo?: string;
        rangoReferencia?: string;
    }) {
        return await prisma.$transaction(async (tx) => {
            const bloqueActual = await tx.bloqueMensual.findUnique({
                where: { id },
                include: { semanas: { orderBy: { numeroSemana: 'asc' } } }
            });

            if (!bloqueActual) throw new Error("Bloque no encontrado");

            // Si hay cambio de duración, ajustamos las semanas
            if (data.duracion && data.duracion !== bloqueActual.duracion) {
                const diff = data.duracion - bloqueActual.duracion;

                if (diff < 0) {
                    // Eliminar semanas sobrantes (las últimas)
                    const semanasAEliminar = bloqueActual.semanas.slice(diff);
                    for (const sem of semanasAEliminar) {
                        const dias = await tx.diaSesion.findMany({ where: { semanaId: sem.id } });
                        const diasIds = dias.map(d => d.id);
                        if (diasIds.length > 0) {
                            await tx.ejercicioPlanificado.deleteMany({ where: { diaId: { in: diasIds } } });
                        }
                        await tx.diaSesion.deleteMany({ where: { semanaId: sem.id } });
                        await tx.volumenSemanal.deleteMany({ where: { semanaId: sem.id } });
                        await tx.configTesteoEjercicio.deleteMany({ where: { semanaId: sem.id } });
                        await tx.semana.delete({ where: { id: sem.id } });
                    }
                } else {
                    // Agregar semanas nuevas
                    const ultimaSemana = bloqueActual.semanas[bloqueActual.semanas.length - 1];
                    const ultimoNumero = ultimaSemana ? ultimaSemana.numeroSemana : 0;
                    const numSesiones = ultimaSemana ? await tx.diaSesion.count({ where: { semanaId: ultimaSemana.id } }) : 3;
                    const diasBase = ['Lunes', 'Miércoles', 'Viernes', 'Martes', 'Jueves', 'Sábado', 'Domingo'].slice(0, numSesiones || 3);

                    for (let i = 1; i <= diff; i++) {
                        const numS = ultimoNumero + i;
                        // Protocolo IL: La semana 4 suele ser descarga, pero si estamos agregando más, 
                        // quizás solo la última del bloque debería serlo. Por ahora, creamos estándar.
                        await tx.semana.create({
                            data: {
                                bloqueMensualId: id,
                                numeroSemana: numS,
                                objetivoSemana: "Fase de carga / Acumulación",
                                RIRobjetivo: 3,
                                volumenEstimado: "Medio",
                                diasSesion: {
                                    create: diasBase.map(dia => ({
                                        diaSemana: dia,
                                        focoMuscular: "General"
                                    }))
                                }
                            }
                        });
                    }
                }
            }

            const bloqueActualizado = await tx.bloqueMensual.update({
                where: { id },
                data: {
                    objetivo: data.objetivo,
                    duracion: data.duracion,
                    metodo: data.metodo,
                    rangoReferencia: data.rangoReferencia
                }
            });

            // Recalcular duración total del macrociclo
            const todosLosBloques = await tx.bloqueMensual.findMany({
                where: { macrocicloId: bloqueActualizado.macrocicloId },
                select: { duracion: true }
            });
            const nuevaDuracionTotal = todosLosBloques.reduce((sum, b) => sum + b.duracion, 0);

            await tx.macrociclo.update({
                where: { id: bloqueActualizado.macrocicloId },
                data: { duracionSemanas: nuevaDuracionTotal }
            });

            return bloqueActualizado;
        });
    },

    /**
     * Actualiza una semana (Microciclo).
     */
    async actualizarSemana(id: string, data: {
        objetivoSemana?: string;
        RIRobjetivo?: number;
        volumenEstimado?: string;
        esFaseDeload?: boolean;
        esSemanaTesteo?: boolean;
        tipoCarga?: TipoCarga;
        modeloPeriodizacion?: ModeloPeriodizacion;
        checkinRequerido?: boolean;
    }) {
        const semanaActualizada = await prisma.semana.update({
            where: { id },
            data,
            include: { diasSesion: true }
        });

        // Automatización Científica: Si es descarga/test, configurar el día de testeo
        if (data.tipoCarga === 'DESCARGA_TEST') {
            const diaTest = semanaActualizada.diasSesion.find(d => d.diaSemana === 'Viernes' || d.diaSemana === 'Sábado')
                || semanaActualizada.diasSesion[semanaActualizada.diasSesion.length - 1];

            if (diaTest) {
                await prisma.diaSesion.update({
                    where: { id: diaTest.id },
                    data: { focoMuscular: "TESTEO 1RM + DELOAD" }
                });
            }
        }

        return semanaActualizada;
    },

    /**
     * Actualiza un día de sesión.
     */
    async actualizarDiaSesion(id: string, data: {
        focoMuscular?: string;
    }) {
        return await prisma.diaSesion.update({
            where: { id },
            data
        });
    },

    /**
     * Agrega un ejercicio a una sesión.
     */
    async agregarEjercicioASesion(diaId: string, ejercicioId: string, orden: number) {
        return await prisma.ejercicioPlanificado.create({
            data: {
                diaId,
                ejercicioId,
                series: 3, // Defaults
                repsMin: 8,
                repsMax: 12,
                RIR: 3,
                descansoSegundos: 90,
                orden
            }
        });
    },

    /**
     * Elimina un ejercicio de la planificación.
     */
    async eliminarEjercicioPlanificado(id: string) {
        return await prisma.ejercicioPlanificado.delete({
            where: { id }
        });
    },

    /**
     * Actualiza un ejercicio planificado.
     */
    async actualizarEjercicioPlanificado(id: string, data: {
        series?: number;
        repsMin?: number;
        repsMax?: number;
        RIR?: number | null;
        tempo?: string;
        descansoSegundos?: number | null;
        pesoSugerido?: number;
        notasTecnicas?: string;
        ejercicioId?: string | null;
        nombreLibre?: string | null;
        esBiblioteca?: boolean;
        esTesteo?: boolean;
        modalidadTesteo?: 'DIRECTO' | 'INDIRECTO' | null;
    }) {
        return await prisma.ejercicioPlanificado.update({
            where: { id },
            data: data as Prisma.EjercicioPlanificadoUpdateInput
        });
    },

    /**
     * Inicializa una planificación completa (Macrociclo + Bloque 1 + 4 Semanas + Días) para un cliente.
     */
    async inicializarPlanificacion(clienteId: string, data: {
        duracionSemanas: number;
        fechaInicio: Date;
    }) {
        const diasBase = ['Lunes', 'Miércoles', 'Viernes'];

        return await prisma.macrociclo.create({
            data: {
                clienteId,
                duracionSemanas: data.duracionSemanas,
                fechaInicio: data.fechaInicio,
                bloquesMensuales: {
                    create: {
                        objetivo: "Adaptación Anatómica / Base",
                        duracion: 4,
                        semanas: {
                            create: [1, 2, 3, 4].map(num => ({
                                numeroSemana: num,
                                objetivoSemana: num === 4 ? "Deload / Resíntesis" : "Acumulación de volumen",
                                RIRobjetivo: num === 4 ? 5 : 3,
                                volumenEstimado: num === 4 ? "Bajo (Deload)" : "Medio",
                                esFaseDeload: num === 4,
                                diasSesion: {
                                    create: diasBase.map(dia => ({
                                        diaSemana: dia,
                                        focoMuscular: "Full Body / Base"
                                    }))
                                }
                            }))
                        }
                    }
                }
            }
        });
    },

    /**
     * Agrega un nuevo mesociclo a un macrociclo existente.
     */
    async agregarMesociclo(macrocicloId: string, data: {
        objetivo: string;
        metodo?: string;
        rangoReferencia?: string;
        numeroMes: number;
        numSemanas?: number;
        numSesionesPorSemana?: number;
    }) {
        const numSemanas = data.numSemanas || 4;
        const numSesiones = data.numSesionesPorSemana || 3;
        const diasDisponibles = ['Lunes', 'Miércoles', 'Viernes', 'Martes', 'Jueves', 'Sábado', 'Domingo'];
        const diasBase = diasDisponibles.slice(0, numSesiones);

        const startWeek = ((data.numeroMes - 1) * 4) + 1;

        return await prisma.bloqueMensual.create({
            data: {
                macrocicloId,
                objetivo: data.objetivo,
                metodo: data.metodo,
                rangoReferencia: data.rangoReferencia,
                duracion: numSemanas,
                semanas: {
                    create: Array.from({ length: numSemanas }).map((_, offset) => {
                        const isDeload = numSemanas >= 4 && (offset + 1) === 4;
                        return {
                            numeroSemana: startWeek + offset,
                            objetivoSemana: isDeload ? "Deload / Resíntesis Científica" : "Fase de carga / Acumulación",
                            RIRobjetivo: isDeload ? 5 : 3,
                            volumenEstimado: isDeload ? "Reducido (50-60%)" : "Medio",
                            esFaseDeload: isDeload,
                            diasSesion: {
                                create: diasBase.map(dia => ({
                                    diaSemana: dia,
                                    focoMuscular: "General"
                                }))
                            }
                        };
                    })
                }
            }
        });
    },

    /**
     * Crea una nueva sesión manualmente dentro de una semana específica.
     */
    async crearNuevaSesion(semanaId: string, diaSemana: string) {
        return await prisma.diaSesion.create({
            data: {
                semanaId,
                diaSemana,
                focoMuscular: "Foco a Definir"
            }
        });
    },

    /**
     * Elimina una sesión.
     */
    async eliminarSesion(id: string) {
        return await prisma.diaSesion.delete({
            where: { id }
        });
    },

    async eliminarBloqueMensual(id: string) {
        return await prisma.$transaction(async (tx) => {
            const semanas = await tx.semana.findMany({ where: { bloqueMensualId: id }, select: { id: true } });
            const semanasIds = semanas.map(s => s.id);
            if (semanasIds.length > 0) {
                const dias = await tx.diaSesion.findMany({ where: { semanaId: { in: semanasIds } }, select: { id: true } });
                const diasIds = dias.map(d => d.id);
                if (diasIds.length > 0) {
                    await tx.ejercicioPlanificado.deleteMany({ where: { diaId: { in: diasIds } } });
                }
                await tx.diaSesion.deleteMany({ where: { semanaId: { in: semanasIds } } });
                await tx.volumenSemanal.deleteMany({ where: { semanaId: { in: semanasIds } } });
                await tx.configTesteoEjercicio.deleteMany({ where: { semanaId: { in: semanasIds } } });
                await tx.semana.deleteMany({ where: { bloqueMensualId: id } });
            }
            const bloqueEliminado = await tx.bloqueMensual.delete({ where: { id } });

            // Recalcular duración total del macrociclo restante
            const bloquesRestantes = await tx.bloqueMensual.findMany({
                where: { macrocicloId: bloqueEliminado.macrocicloId },
                select: { duracion: true }
            });
            const nuevaDuracionTotal = bloquesRestantes.reduce((sum, b) => sum + b.duracion, 0);

            await tx.macrociclo.update({
                where: { id: bloqueEliminado.macrocicloId },
                data: { duracionSemanas: nuevaDuracionTotal }
            });

            return bloqueEliminado;
        });
    }
};
