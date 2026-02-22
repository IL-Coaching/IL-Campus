import { prisma } from "@/baseDatos/conexion";
import { MacrocicloCompleto } from "../tipos/planificacion.tipos";
import { TipoCarga } from "@prisma/client";

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

    /**
     * Actualiza un bloque mensual.
     */
    async actualizarBloqueMensual(id: string, data: {
        objetivo?: string;
        duracion?: number;
        metodo?: string;
        rangoReferencia?: string;
    }) {
        return await prisma.bloqueMensual.update({
            where: { id },
            data
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
        RIR?: number;
        tempo?: string;
        descansoSegundos?: number;
        pesoSugerido?: number;
        notasTecnicas?: string;
    }) {
        return await prisma.ejercicioPlanificado.update({
            where: { id },
            data
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

    /**
     * Elimina un bloque mensual (Mesociclo) y toda su jerarquía.
     */
    async eliminarBloqueMensual(id: string) {
        return await prisma.bloqueMensual.delete({
            where: { id }
        });
    }
};
