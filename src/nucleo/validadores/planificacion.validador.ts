import { z } from "zod";

/**
 * Esquema para la creación de un nuevo macrociclo.
 */
export const EsquemaNuevoMacrociclo = z.object({
    duracion: z.preprocess((val) => Number(val), z.number().min(1).max(52)),
    fechaInicio: z.preprocess((val) => new Date(val as string), z.date()),
});

/**
 * Esquema para actualizar un ejercicio planificado.
 * Sanitiza valores numéricos y rangos.
 */
export const EsquemaActualizarEjercicio = z.object({
    series: z.number().min(1).max(20).optional(),
    repsMin: z.number().min(0).max(100).optional(),
    repsMax: z.number().min(0).max(100).optional(),
    RIR: z.number().min(0).max(10).nullable().optional(),
    descanso: z.number().min(0).max(600).nullable().optional(),
    tempo: z.string().max(10).optional(),
    pesoSugerido: z.number().min(0).optional(),
    notas: z.string().max(500).optional(),
    ejercicioId: z.string().uuid().nullable().optional(),
    nombreLibre: z.string().max(100).nullable().optional(),
    esBiblioteca: z.boolean().optional(),
    esTesteo: z.boolean().optional(),
    modalidadTesteo: z.enum(['DIRECTO', 'INDIRECTO']).nullable().optional(),
});

/**
 * Esquema para actualizar una semana (Microciclo).
 */
export const EsquemaActualizarSemana = z.object({
    objetivoSemana: z.string().max(200).optional(),
    RIRobjetivo: z.number().min(0).max(10).optional(),
    volumenEstimado: z.string().max(100).optional(),
    esFaseDeload: z.boolean().optional(),
    esSemanaTesteo: z.boolean().optional(),
    tipoCarga: z.enum(['INTRODUCTORIA', 'BASE', 'CHOQUE', 'DESCARGA_TEST']).optional(),
    modeloPeriodizacion: z.enum(['LINEAL', 'ONDULANTE', 'CONJUGADA', 'PERSONALIZADO']).optional(),
    checkinRequerido: z.boolean().optional(),
});

/**
 * Esquema para actualizar un mesociclo (Bloque Mensual).
 */
export const EsquemaActualizarMesociclo = z.object({
    objetivo: z.string().max(200).optional(),
    duracion: z.number().min(1).max(12).optional(),
    metodo: z.string().max(200).optional(),
    rangoReferencia: z.string().max(100).optional(),
});

/**
 * Esquema para actualizar un macrociclo.
 */
export const EsquemaActualizarMacrociclo = z.object({
    duracionSemanas: z.number().min(1).max(52).optional(),
    fechaInicio: z.date().optional(),
    notas: z.string().max(1000).optional(),
});

/**
 * Esquema para agregar un nuevo mesociclo.
 */
export const EsquemaNuevoMesociclo = z.object({
    objetivo: z.string().min(1).max(200),
    metodo: z.string().max(200).optional(),
    rangoReferencia: z.string().max(100).optional(),
    numeroMes: z.number().min(1).max(12),
    numSemanas: z.number().min(1).max(12).optional(),
    numSesiones: z.number().min(1).max(7).optional(),
});
