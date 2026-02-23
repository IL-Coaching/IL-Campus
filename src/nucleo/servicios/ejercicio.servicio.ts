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
                    { nombresAlternativos: { has: query } }
                ]
            },
            orderBy: { nombre: 'asc' },
            take: 20
        });
    },

    /**
     * Crea un nuevo ejercicio con detalle técnico completo.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async crear(data: any) {
        let thumbnailUrl = null;
        if (data.urlVideo) {
            const videoId = this.extractYouTubeId(data.urlVideo);
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        }

        return await prisma.ejercicio.create({
            data: {
                ...data,
                thumbnailUrl,
                musculoPrincipal: data.musculoPrincipal || "CUADRICEPS",
                articulacion: data.articulacion || "MONOARTICULAR",
                patron: data.patron || "AISLAMIENTO",
                lateralidad: data.lateralidad || "BILATERAL",
            }
        });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async actualizar(id: string, data: any) {
        let thumbnailUrl = undefined;
        if (data.urlVideo !== undefined) {
            if (data.urlVideo) {
                const videoId = this.extractYouTubeId(data.urlVideo);
                thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
            } else {
                thumbnailUrl = null;
            }
        }

        return await prisma.ejercicio.update({
            where: { id },
            data: {
                ...data,
                ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {})
            }
        });
    },

    async archivar(id: string) {
        return await prisma.ejercicio.update({
            where: { id },
            data: { archivado: true }
        });
    },

    async duplicar(id: string) {
        const original = await prisma.ejercicio.findUnique({ where: { id } });
        if (!original) throw new Error("Ejercicio no encontrado");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, creadoEn: _c, actualizadoEn: _a, ...data } = original;
        return await prisma.ejercicio.create({
            data: {
                ...data,
                nombre: `${original.nombre} (copia)`
            }
        });
    },

    extractYouTubeId(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
};
