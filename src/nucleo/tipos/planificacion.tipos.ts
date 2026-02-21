import { Cliente, Macrociclo, BloqueMensual, Semana, DiaSesion, EjercicioPlanificado, Ejercicio } from "@prisma/client";

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

export type BloqueConSemanas = BloqueMensual & {
    semanas: SemanaConDias[];
};

export type MacrocicloCompleto = Macrociclo & {
    bloquesMensuales: BloqueConSemanas[];
};

export interface PlanificacionEstado {
    cliente: Cliente;
    macrociclo: MacrocicloCompleto | null;
}
