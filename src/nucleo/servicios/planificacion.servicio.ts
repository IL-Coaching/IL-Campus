import { prisma } from "@/baseDatos/conexion";
import { MacrocicloCompleto } from "../tipos/planificacion.tipos";

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
    }) {
        return await prisma.semana.update({
            where: { id },
            data
        });
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
        // Estructura de días base
        const diasBase = ['Lunes', 'Miércoles', 'Viernes'];

        // Creamos todo en UNA sola operación anidada. 
        // Esto reduce drásticamente la latencia en bases de datos cloud (Supabase).
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
                                objetivoSemana: "Acumulación de volumen",
                                RIRobjetivo: 3,
                                volumenEstimado: "Medio",
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
    }
};
