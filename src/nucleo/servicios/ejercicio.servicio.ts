import { prisma } from "@/baseDatos/conexion";
import {
    GrupoMuscular,
    TipoArticulacion,
    PatronMovimiento,
    Lateralidad,
    TipoEquipamiento,
    PosicionCarga,
    OrigenEjercicio
} from "@prisma/client";

/**
 * Datos requeridos para crear un nuevo ejercicio en el catálogo del entrenador.
 */
export interface DatosCrearEjercicio {
    nombre: string;
    musculoPrincipal: GrupoMuscular;
    articulacion: TipoArticulacion;
    patron: PatronMovimiento;
    equipamiento: TipoEquipamiento[];
    lateralidad: Lateralidad;
    descripcion?: string;
    urlVideo?: string;
    entrenadorId: string;
    origen?: OrigenEjercicio;
    visibleParaClientes?: boolean;
    posicionCarga?: PosicionCarga;
    nombresAlternativos?: string[];
}

/**
 * Campos actualizables de un ejercicio existente (todos opcionales).
 */
export interface DatosActualizarEjercicio {
    nombre?: string;
    musculoPrincipal?: GrupoMuscular;
    articulacion?: TipoArticulacion;
    patron?: PatronMovimiento;
    equipamiento?: TipoEquipamiento[];
    lateralidad?: Lateralidad;
    descripcion?: string;
    urlVideo?: string;
}

/**
 * Servicio de Catálogo de Ejercicios — IL-Campus
 * Gestiona el CRUD del catálogo de ejercicios personal del entrenador.
 */
export const EjercicioServicio = {
    /**
     * Busca ejercicios por nombre o grupo muscular en el catálogo del entrenador.
     * @param entrenadorId - ID del entrenador propietario del catálogo
     * @param query - Texto de búsqueda (nombre o músculo)
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
            orderBy: { nombre: 'asc' }
        });
    },

    /**
     * Crea un nuevo ejercicio con detalle técnico completo.
     * Genera automáticamente la thumbnail a partir de la URL de YouTube si se provee.
     * @param data - Datos del ejercicio a crear
     */
    async crear(data: DatosCrearEjercicio) {
        let thumbnailUrl: string | null = null;
        if (data.urlVideo) {
            const videoId = this.extraerIdYouTube(data.urlVideo);
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        }

        return await prisma.ejercicio.create({
            data: {
                ...data,
                thumbnailUrl,
            }
        });
    },

    /**
     * Actualiza los datos de un ejercicio existente.
     * Si se provee urlVideo, regenera la thumbnail automáticamente.
     * @param id - ID del ejercicio a actualizar
     * @param data - Campos a actualizar (parcial)
     */
    async actualizar(id: string, data: DatosActualizarEjercicio) {
        let thumbnailUrl: string | null | undefined = undefined;
        if (data.urlVideo !== undefined) {
            if (data.urlVideo) {
                const videoId = this.extraerIdYouTube(data.urlVideo);
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

    /**
     * Archiva un ejercicio (soft delete). No elimina el registro de la DB.
     */
    async archivar(id: string) {
        return await prisma.ejercicio.update({
            where: { id },
            data: { archivado: true }
        });
    },

    /**
     * Duplica un ejercicio con el sufijo "(copia)" en el nombre.
     */
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

    /**
     * Extrae el ID de un video de YouTube desde cualquier formato de URL válido.
     * @returns El ID de 11 caracteres o null si no se reconoce.
     */
    extraerIdYouTube(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
};
