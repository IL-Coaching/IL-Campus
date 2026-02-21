import { Prisma, Cliente, Macrociclo, BloqueMensual, Semana, DiaSesion, EjercicioPlanificado, Ejercicio } from "@prisma/client";

/**
 * Tipos de Planificación — ArchSecure AI
 * Extiende los tipos de Prisma para incluir las relaciones necesarias en el constructor.
 */

export type EjercicioConDetalle = EjercicioPlanificado & {
    ejercicio: Ejercicio;
};

export type DiaConEjercicios = DiaSesion & {
    ejercicios: EjercicioConDetalle[];
};

export type SemanaConDias = Semana & {
    diasSesion: DiaConEjercicios[];
};

// Bloque Mensual (Mesociclo) con sus semanas
export type BloqueConSemanas = Prisma.BloqueMensualGetPayload<{
    include: { semanas: { include: { diasSesion: { include: { ejercicios: { include: { ejercicio: true } } } } } } }
}>;

export type MacrocicloCompleto = Macrociclo & {
    bloquesMensuales: BloqueConSemanas[];
};

export type ClientePlanificacion = Cliente & {
    plan?: string;
    formularioInscripcion?: {
        objetivos?: {
            principal?: string;
            secundarios?: string[];
            motivacionReal?: string;
            plazo?: string;
        };
        disponibilidad?: {
            diasSemana?: number;
            minutosSesion?: number;
            preferenciaHoraria?: string;
            equipamiento?: string[];
        };
        saludMedica?: {
            lesiones?: string;
            patologias?: string;
            medicacion?: string;
        };
        estiloDeVida?: {
            ocupacion?: string;
            estres?: number;
            horasSueno?: number;
        };
    } | null;
};

export interface PlanificacionEstado {
    cliente: ClientePlanificacion;
    macrociclo: MacrocicloCompleto | null;
}
