import { prisma } from "@/baseDatos/conexion";

/**
 * Servicio para gestionar los planes de entrenamiento (membresías).
 */
export const PlanServicio = {
    /**
     * Obtiene todos los planes creados por un entrenador.
     */
    async obtenerPorEntrenador(entrenadorId: string) {
        return await prisma.plan.findMany({
            where: { entrenadorId, visible: true },
            orderBy: { precio: 'asc' }
        });
    }
};
