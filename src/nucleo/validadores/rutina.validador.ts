import { z } from "zod";

/**
 * Esquema para un ejercicio dentro de una rutina plantilla.
 */
export const EsquemaEjercicioRutina = z.object({
    ejercicioId: z.string().uuid().nullable().optional(),
    nombreLibre: z.string().max(100).nullable().optional(),
    series: z.number().int().min(1).max(20),
    repsMin: z.number().int().min(0).max(100),
    repsMax: z.number().int().min(0).max(100),
    descansoSeg: z.number().int().min(0).max(600),
    tempo: z.string().max(20).nullable().optional(),
    metodo: z.string().max(100).nullable().optional(),
    notasTecnicas: z.string().max(500).nullable().optional(),
    orden: z.number().int().min(0),
});

/**
 * Esquema para crear/actualizar una rutina plantilla.
 * @security OWASP A03:2021 - Validación de entradas
 */
export const EsquemaRutina = z.object({
    nombre: z.string().min(1, "El nombre de la rutina es obligatorio.").max(200),
    descripcion: z.string().max(1000).optional().nullable(),
    categoria: z.string().max(100).optional().nullable(),
    ejercicios: z.array(EsquemaEjercicioRutina).max(50, "Mucha cantidad de ejercicios. Máximo 50."),
});

export type TEjercicioRutina = z.infer<typeof EsquemaEjercicioRutina>;
export type TRutina = z.infer<typeof EsquemaRutina>;
