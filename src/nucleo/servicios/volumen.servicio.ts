import { prisma } from "@/baseDatos/conexion";

export interface VolumenPorMusculo {
    grupoMuscular: string;
    seriesTotal: number;
    estado: 'BAJO' | 'OPTIMO' | 'ELEVADO';
}

/**
 * Servicio de Volumen Semanal — Capa Científica IUSCA
 * Basado en Schoenfeld et al. (2021)
 */
export const VolumenServicio = {
    /**
     * Calcula el volumen total de series por grupo muscular en una semana.
     * Fundamento: 10+ series para optimizar MPS.
     */
    async calcularVolumenSemanal(semanaId: string): Promise<VolumenPorMusculo[]> {
        // 1. Obtener la semana con sus ejercicios planificados
        const semana = await prisma.semana.findUnique({
            where: { id: semanaId },
            include: {
                diasSesion: {
                    include: {
                        ejercicios: {
                            include: {
                                ejercicio: true
                            }
                        }
                    }
                }
            }
        });

        if (!semana) return [];

        // 2. Mapear y sumar series por grupo muscular
        const mapaVolumen: Record<string, number> = {};

        semana.diasSesion.forEach(dia => {
            dia.ejercicios.forEach(ep => {
                const musculo = ep.ejercicio?.musculoPrincipal?.toString() || "OTROS";
                mapaVolumen[musculo] = (mapaVolumen[musculo] || 0) + ep.series;
            });
        });

        // 3. Convertir a array y clasificar según umbrales IUSCA
        const resultado: VolumenPorMusculo[] = Object.entries(mapaVolumen).map(([musculo, series]) => {
            let estado: 'BAJO' | 'OPTIMO' | 'ELEVADO' = 'OPTIMO';
            if (series < 10) estado = 'BAJO';
            else if (series > 20) estado = 'ELEVADO';

            return {
                grupoMuscular: musculo,
                seriesTotal: series,
                estado
            };
        });

        // 4. Guardar en la tabla de caché (VolumenSemanal)
        // Primero limpiar anteriores
        await prisma.volumenSemanal.deleteMany({ where: { semanaId } });

        // Crear nuevos registros
        if (resultado.length > 0) {
            await prisma.volumenSemanal.createMany({
                data: resultado.map(r => ({
                    semanaId,
                    grupoMuscular: r.grupoMuscular,
                    seriesTotal: r.seriesTotal,
                    bajoDeLaMinima: r.estado === 'BAJO'
                }))
            });
        }

        // 5. Retornar ordenado por estado (BAJO primero para alertas)
        return resultado.sort((a, b) => {
            const peso = { BAJO: 0, ELEVADO: 1, OPTIMO: 2 };
            return peso[a.estado] - peso[b.estado];
        });
    }
};
