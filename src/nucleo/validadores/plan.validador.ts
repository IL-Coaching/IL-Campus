import { z } from "zod";

/**
 * Esquema de validación para crear/actualizar un plan.
 * @security OWASP A03:2021 - Validación de entradas
 */
export const EsquemaPlan = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    precio: z.number().positive("El precio debe ser positivo").max(100000000),
    duracionDias: z.number().int().positive("La duración debe ser un número entero positivo").max(3650),
    precioPromocional: z.number().positive().max(100000000).nullable().optional(),
    mesesPromocion: z.number().int().positive().max(12).nullable().optional(),
    descripcion: z.string().optional().or(z.literal("")),
    beneficios: z.array(z.string()).optional().default([]),
    visible: z.boolean().default(true),
    esPopular: z.boolean().default(false),
});

export const EsquemaActualizarPlan = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(2).max(100).optional(),
    precio: z.number().positive().max(100000000).optional(),
    precioPromocional: z.number().positive().max(100000000).nullable().optional(),
    mesesPromocion: z.number().int().positive().max(12).nullable().optional(),
    duracionDias: z.number().int().positive().max(3650).optional(),
    descripcion: z.string().optional(),
    beneficios: z.array(z.string()).optional(),
    visible: z.boolean().optional(),
    esPopular: z.boolean().optional(),
});

export type TPlan = z.infer<typeof EsquemaPlan>;
export type TActualizarPlan = z.infer<typeof EsquemaActualizarPlan>;
