import { z } from "zod";

export const EsquemaRegistrarCobro = z.object({
    clienteId: z.string().uuid(),
    planAsignadoId: z.string().uuid(),
    monto: z.number().min(0, "El monto no puede ser negativo"),
    metodo: z.string().min(1, "El método es obligatorio"),
    periodoDesde: z.string().transform((val) => new Date(val)),
    periodoHasta: z.string().transform((val) => new Date(val)),
    notas: z.string().optional()
});

export type TRegistrarCobro = z.infer<typeof EsquemaRegistrarCobro>;
