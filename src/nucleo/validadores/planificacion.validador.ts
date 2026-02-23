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
    RIR: z.number().min(0).max(10).optional(),
    descanso: z.number().min(0).max(600).optional(),
    tempo: z.string().max(10).optional(),
    pesoSugerido: z.number().min(0).optional(),
    notas: z.string().max(500).optional(),
    ejercicioId: z.string().uuid().nullable().optional(),
    nombreLibre: z.string().max(100).nullable().optional(),
    esBiblioteca: z.boolean().optional(),
});
