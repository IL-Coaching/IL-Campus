import { z } from "zod";

/**
 * Esquema de validación para crear un check-in.
 * @security OWASP A03:2021 - Inyección
 */
export const EsquemaCrearCheckin = z.object({
    pesoKg: z.number().positive("El peso debe ser positivo").max(300, "Peso inválido").optional(),
    nota: z.string().max(1000, "La nota no puede exceder 1000 caracteres").optional(),
    energia: z.number().int().min(1, "Mínimo 1").max(10, "Máximo 10").optional(),
    sueno: z.number().int().min(1, "Mínimo 1").max(10, "Máximo 10").optional(),
    adherencia: z.number().int().min(0, "Mínimo 0").max(100, "Máximo 100").optional(),
    faseCiclo: z.enum(["menstruacion", "folicular", "ovulacion", "lutea"]).optional(),
    fotosUrls: z.array(z.string().url("URL de imagen inválida")).max(5, "Máximo 5 fotos").optional(),
});

/**
 * Esquema para actualizar un check-in.
 * @security OWASP A03:2021 - Inyección
 */
export const EsquemaActualizarCheckin = z.object({
    id: z.string().uuid("ID de check-in inválido"),
    pesoKg: z.number().positive().max(300).optional(),
    nota: z.string().max(1000).optional(),
    energia: z.number().int().min(1).max(10).optional(),
    sueno: z.number().int().min(1).max(10).optional(),
    adherencia: z.number().int().min(0).max(100).optional(),
    faseCiclo: z.enum(["menstruacion", "folicular", "ovulacion", "lutea"]).optional(),
});

/**
 * Esquema para registrar ciclo menstrual.
 * @security OWASP A03:2021 - Inyección
 */
export const EsquemaCicloMenstrual = z.object({
    duracionCiclo: z.number().int().positive("Duración inválida").max(60),
    fechaInicioUltimoCiclo: z.string().transform(val => new Date(val)),
});

export type TCrearCheckin = z.infer<typeof EsquemaCrearCheckin>;
export type TActualizarCheckin = z.infer<typeof EsquemaActualizarCheckin>;
export type TCicloMenstrual = z.infer<typeof EsquemaCicloMenstrual>;
