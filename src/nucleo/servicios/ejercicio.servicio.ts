import { prisma } from "@/baseDatos/conexion";

/**
 * Servicio de Catálogo de Ejercicios — ArchSecure AI
 */
export const EjercicioServicio = {
    /**
     * Busca ejercicios por nombre o grupo muscular en el catálogo del entrenador.
     */
    async buscar(entrenadorId: string, query: string) {
        return await prisma.ejercicio.findMany({
            where: {
                entrenadorId,
                OR: [
                    { nombre: { contains: query, mode: 'insensitive' } },
                    { grupoMuscular: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: { nombre: 'asc' },
            take: 20
        });
    },

    /**
     * Crea un nuevo ejercicio en el catálogo.
     */
    async crear(data: {
        entrenadorId: string;
        nombre: string;
        grupoMuscular: string;
        videoUrl?: string;
        descripcion?: string;
    }) {
        return await prisma.ejercicio.create({
            data
        });
    }
};
