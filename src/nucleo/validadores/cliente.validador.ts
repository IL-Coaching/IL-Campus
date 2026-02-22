import { z } from "zod";

/**
 * Esquema de validación para el alta de un nuevo cliente.
 * Garantiza tipos correctos y sanitización básica.
 * @security OWASP A03:2021
 */
export const EsquemaAltaCliente = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z.string().email("Email inválido"),
    telefono: z.string().optional().or(z.literal("")),
    plan: z.enum(["Start", "GymRat", "Elite"]),
});

export const EsquemaAsignarPlan = z.object({
    clienteId: z.string().uuid(),
    planId: z.string().uuid(),
    fechaInicio: z.string().transform((val) => new Date(val)),
});

export type TAsignarPlan = z.infer<typeof EsquemaAsignarPlan>;
export type TAltaCliente = z.infer<typeof EsquemaAltaCliente>;
