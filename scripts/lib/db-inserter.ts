import { PrismaClient, OrigenEjercicio } from '@prisma/client';
import { generarThumbnailUrl } from './youtube-utils';

const prisma = new PrismaClient();

export interface ExerciseData {
    nombre: string;
    musculoPrincipal: any;
    articulacion: any;
    patron: any;
    equipamiento: any[];
    lateralidad: any;
    urlVideo?: string | null;
    descripcion?: string;
    posicionCarga?: any;
    nivelTecnico?: any;
}

export async function insertarEjercicios(ejercicios: ExerciseData[], entrenadorId: string) {
    let creados = 0;
    let omitidos = 0;

    for (const data of ejercicios) {
        try {
            // Verificar si ya existe exactamente esta combinación para este entrenador
            const existe = await prisma.ejercicio.findFirst({
                where: {
                    nombre: {
                        equals: data.nombre,
                        mode: 'insensitive'
                    },
                    urlVideo: data.urlVideo,
                    entrenadorId
                }
            });

            if (existe) {
                omitidos++;
                continue;
            }

            await prisma.ejercicio.create({
                data: {
                    ...data,
                    entrenadorId,
                    origen: OrigenEjercicio.BIBLIOTECA_IL,
                    thumbnailUrl: data.urlVideo ? generarThumbnailUrl(data.urlVideo) : null,
                    visibleParaClientes: true
                }
            });
            creados++;
        } catch (error) {
            console.error(`Error insertando ${data.nombre}:`, error);
            omitidos++;
        }
    }

    return { creados, omitidos };
}
