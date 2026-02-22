import { Cliente, Macrociclo, Semana, DiaSesion, EjercicioPlanificado, Ejercicio, Prisma } from "@prisma/client";

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
}> & {
    metodo?: string;
    rangoReferencia?: string;
};

export type MacrocicloCompleto = Macrociclo & {
    bloquesMensuales: BloqueConSemanas[];
};

export type ClientePlanificacion = Cliente & {
    plan?: string;
    formularioInscripcion?: {
        datosPersonales?: {
            nombre?: string;
            nacimiento?: string;
            edad?: string | number;
            genero?: string;
            peso?: string | number;
            altura?: string | number;
            ubicacion?: string;
        };
        contacto?: {
            whatsapp?: string;
            email?: string;
        };
        saludMedica?: {
            condiciones?: string[];
            aptoMedico?: string | boolean;
            lesiones?: string;
            patologias?: string;
            medicacion?: string;
        };
        estiloDeVida?: {
            actividad?: string;
            sueno?: string;
            ocupacion?: string;
            estres?: number;
            horasSueno?: number;
        };
        experiencia?: {
            entrenaActualmente?: string;
            tiempo?: string;
        };
        objetivos?: {
            principales?: string[];
            motivacion?: string;
            principal?: string;
            secundarios?: string[];
            motivacionReal?: string;
            plazo?: string;
        };
        disponibilidad?: {
            sesionesSemana?: string | number;
            tiempoSesion?: string;
            lugar?: string;
            equipamiento?: string[];
            diasSemana?: number;
            minutosSesion?: number;
            preferenciaHoraria?: string;
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
};

export interface PlanificacionEstado {
    cliente: ClientePlanificacion;
    macrociclo: MacrocicloCompleto | null;
}

