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
     * Agrega un bloque mensual (Mesociclo) a un macrociclo.
     */
    async agregarBloqueMensual(data: {
        macrocicloId: string;
        objetivo: string;
        duracionSemanas: number;
    }) {
        return await prisma.bloqueMensual.create({
            data: {
                macrocicloId: data.macrocicloId,
                objetivo: data.objetivo,
                duracion: data.duracionSemanas
            }
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
        descansoSegundos?: number;
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
