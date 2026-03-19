import { prisma } from "@/baseDatos/conexion";
import { MacrocicloCompleto } from "../tipos/planificacion.tipos";
import { TipoCarga, Prisma, ModeloPeriodizacion, ModalidadBloque } from "@prisma/client";

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
                                        },
                                        sesionesReales: {
                                            where: { completada: true },
                                            include: {
                                                metricas: true
                                            },
                                            orderBy: { fecha: 'desc' },
                                            take: 1
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
        nombre?: string;
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
                    nombre: data.nombre,
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

            // Re-numeración secuencial de todas las semanas del macrociclo para evitar solapamientos
            const bloquesParaOrdenar = await tx.bloqueMensual.findMany({
                where: { macrocicloId: bloqueActualizado.macrocicloId },
                include: { semanas: { orderBy: { numeroSemana: 'asc' } } }
            });

            // Ordenamos los bloques por la semana más baja que tengan actualmente
            const bloquesOrdenados = bloquesParaOrdenar.sort((a, b) => {
                const minA = a.semanas[0]?.numeroSemana || 0;
                const minB = b.semanas[0]?.numeroSemana || 0;
                return minA - minB;
            });

            let contadorSemana = 1;
            for (const b of bloquesOrdenados) {
                // Importante: Volvemos a obtener las semanas del bloque para asegurar que tenemos las recién creadas/actualizadas
                const semanasBloque = await tx.semana.findMany({
                    where: { bloqueMensualId: b.id },
                    orderBy: { numeroSemana: 'asc' }
                });

                for (const s of semanasBloque) {
                    await tx.semana.update({
                        where: { id: s.id },
                        data: { numeroSemana: contadorSemana }
                    });
                    contadorSemana++;
                }
            }

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
    async agregarEjercicioASesion(diaId: string, ejercicioId: string | null, orden: number, nombreLibre?: string) {
        return await prisma.ejercicioPlanificado.create({
            data: {
                diaId,
                ejercicioId,
                nombreLibre,
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
                        nombre: "Fase de Iniciación",
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
        nombre?: string;
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
                nombre: data.nombre,
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

        });
    },

    /**
     * Agrupa varios ejercicios creando un BloqueSesion (Cluster).
     */
    async agruparEjercicios(diaId: string, ejercicioIds: string[], nombreGrupo: string, modalidad: ModalidadBloque = 'SECUENCIAL') {
        const nuevoBloque = await prisma.bloqueSesion.create({
            data: {
                diaId,
                nombre: nombreGrupo,
                modalidad
            }
        });

        return await prisma.ejercicioPlanificado.updateMany({
            where: { id: { in: ejercicioIds } },
            data: { bloqueId: nuevoBloque.id, grupoId: nuevoBloque.id, nombreGrupo }
        });
    },

    async desagruparEjercicios(bloqueId: string) {
        // Al desagrupar, vaciamos la referencia a bloqueId en los ejercicios
        await prisma.ejercicioPlanificado.updateMany({
            where: { bloqueId },
            data: { bloqueId: null, grupoId: null, nombreGrupo: null }
        });
        
        // Y eliminamos el bloque de la DB
        return await prisma.bloqueSesion.delete({
            where: { id: bloqueId }
        });
    },

    async actualizarNombreGrupo(grupoId: string, nuevoNombre: string) {
        return await prisma.ejercicioPlanificado.updateMany({
            where: { grupoId },
            data: { nombreGrupo: nuevoNombre }
        });
    }
};
