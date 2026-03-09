import { Cliente, Macrociclo, Semana, DiaSesion, EjercicioPlanificado, Ejercicio, Prisma, TipoCarga } from "@prisma/client";

/**
 * Tipos de Planificación — ArchSecure AI
 * Extiende los tipos de Prisma para incluir las relaciones necesarias en el constructor.
 */

export type EjercicioConDetalle = EjercicioPlanificado & {
    ejercicio: Ejercicio | null;
    grupoId?: string | null;
    nombreGrupo?: string | null;
};

export type DiaConEjercicios = DiaSesion & {
    ejercicios: EjercicioConDetalle[];
    sesionesReales?: (Prisma.SesionRegistradaGetPayload<{ include: { metricas: true } }>)[];
};

export type SemanaConDias = Semana & {
    diasSesion: DiaConEjercicios[];
    tipoCarga?: TipoCarga | null;
    checkinRequerido?: boolean;
};

// Bloque Mensual (Mesociclo) con sus semanas
export type BloqueConSemanas = Prisma.BloqueMensualGetPayload<{
    include: {
        semanas: {
            include: {
                diasSesion: {
                    include: {
                        ejercicios: { include: { ejercicio: true } },
                        sesionesReales: true
                    }
                }
            }
        }
    }
}>;

export type MacrocicloCompleto = Macrociclo & {
    bloquesMensuales: BloqueConSemanas[];
};

export type ClientePlanificacion = Cliente & {
    plan?: string;
    enEstasis: boolean;
    esVIP: boolean;
    planesAsignados?: { plan: { duracionDias: number } }[] | null;
    formularioInscripcion?: {
        datosPersonales?: {
            nombre?: string;
            nacimiento?: string;
            edad?: string | number;
            genero?: string;
            peso?: string;
            altura?: string;
            ubicacion?: string;
        };
        contacto?: {
            whatsapp?: string;
            email?: string;
        };
        saludMedica?: {
            condiciones?: string[];
            otrasCondiciones?: string;
            aptoMedico?: string;
        };
        estiloDeVida?: {
            actividad?: string;
            sueno?: string;
        };
        experiencia?: {
            entrenaActualmente?: string;
            tiempo?: string;
        };
        objetivos?: {
            principales?: string[];
            motivacion?: string;
        };
        disponibilidad?: {
            sesionesSemanales?: string;
            tiempoSesion?: string;
            lugar?: string;
            equipamiento?: string[];
        };
        personalizacion?: {
            noGusta?: string;
            notas?: string;
        };
        consentimiento?: {
            aceptado?: boolean;
            declaracionFinal?: boolean;
        };
    } | null;
    cicloMenstrual?: {
        activo: boolean;
        duracionCiclo: number;
        fechaInicioUltimoCiclo: Date;
    } | null;
    perfilRespuesta?: {
        nivelRespuesta: string;
    } | null;
};

export interface PlanificacionEstado {
    cliente: ClientePlanificacion;
    macrociclo: MacrocicloCompleto | null;
}
