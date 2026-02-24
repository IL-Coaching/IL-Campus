import { prisma } from "@/baseDatos/conexion";

export interface MetricasAdherencia {
    sesionesPlanificadas: number;
    sesionesCompletadas: number;
    porcentajeSeriesCompletadas: number;
    patronesIncumplimiento: {
        ejercicioId: string;
        nombre: string;
        frecuenciaSalto: number; // Porcentaje de veces que se saltó este ejercicio
    }[];
}

export interface MetricasTonelaje {
    totalMovidoKg: number;
    porSemana: {
        numeroSemana: number;
        tonelaje: number;
    }[];
    estancamientoDetectado: boolean;
}

export const MetricasServicio = {
    /**
     * Calcula la adherencia de un cliente en un rango de fechas o bloque.
     * Detecta patrones de ejercicios saltados sistemáticamente.
     */
    async obtenerAdherenciaCliente(clienteId: string, macrocicloId: string): Promise<MetricasAdherencia> {
        const macrociclo = await prisma.macrociclo.findUnique({
            where: { id: macrocicloId },
            include: {
                bloquesMensuales: {
                    include: {
                        semanas: {
                            include: {
                                diasSesion: {
                                    include: {
                                        ejercicios: {
                                            include: {
                                                seriesRegistradas: true,
                                                ejercicio: true
                                            }
                                        },
                                        sesionesReales: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!macrociclo) return { sesionesPlanificadas: 0, sesionesCompletadas: 0, porcentajeSeriesCompletadas: 0, patronesIncumplimiento: [] };

        let sesionesPlanificadas = 0;
        let sesionesCompletadas = 0;
        let seriesTotalesPlanificadas = 0;
        let seriesCompletadasReales = 0;

        const conteoSaltos: Record<string, { nombre: string, saltos: number, total: number }> = {};

        macrociclo.bloquesMensuales.forEach(bloque => {
            bloque.semanas.forEach(semana => {
                semana.diasSesion.forEach(dia => {
                    sesionesPlanificadas++;
                    if (dia.sesionesReales.some(s => s.completada)) {
                        sesionesCompletadas++;
                    }

                    dia.ejercicios.forEach(ej => {
                        seriesTotalesPlanificadas += ej.series;
                        const seriesOK = ej.seriesRegistradas.filter(s => s.completada).length;
                        seriesCompletadasReales += seriesOK;

                        // Detección de patrones
                        if (ej.ejercicioId) {
                            const key = ej.ejercicioId;
                            if (!conteoSaltos[key]) {
                                conteoSaltos[key] = { nombre: ej.ejercicio?.nombre || ej.nombreLibre || "Desconocido", saltos: 0, total: 0 };
                            }
                            conteoSaltos[key].total += ej.series;
                            conteoSaltos[key].saltos += (ej.series - seriesOK);
                        }
                    });
                });
            });
        });

        const patrones = Object.entries(conteoSaltos)
            .map(([id, stats]) => ({
                ejercicioId: id,
                nombre: stats.nombre,
                frecuenciaSalto: stats.total > 0 ? (stats.saltos / stats.total) * 100 : 0
            }))
            .filter(p => p.frecuenciaSalto > 30) // Solo reportar si salta más del 30%
            .sort((a, b) => b.frecuenciaSalto - a.frecuenciaSalto);

        return {
            sesionesPlanificadas,
            sesionesCompletadas,
            porcentajeSeriesCompletadas: seriesTotalesPlanificadas > 0 ? (seriesCompletadasReales / seriesTotalesPlanificadas) * 100 : 0,
            patronesIncumplimiento: patrones
        };
    },

    /**
     * Calcula el tonelaje total y por semana.
     * Detecta estancamientos (3 semanas sin mejora significativa).
     */
    async obtenerProgresoTonelaje(clienteId: string, macrocicloId: string): Promise<MetricasTonelaje> {
        const macrociclo = await prisma.macrociclo.findUnique({
            where: { id: macrocicloId },
            include: {
                bloquesMensuales: {
                    include: {
                        semanas: {
                            include: {
                                diasSesion: {
                                    include: {
                                        sesionesReales: {
                                            include: {
                                                series: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!macrociclo) return { totalMovidoKg: 0, porSemana: [], estancamientoDetectado: false };

        let totalMovidoKg = 0;
        const porSemana: { numeroSemana: number, tonelaje: number }[] = [];

        macrociclo.bloquesMensuales.forEach(bloque => {
            bloque.semanas.forEach(semana => {
                let tonelajeSemanal = 0;
                semana.diasSesion.forEach(dia => {
                    dia.sesionesReales.forEach(sesion => {
                        sesion.series.forEach(serie => {
                            if (serie.completada && serie.pesoKg && serie.repsReales) {
                                const subtotal = serie.pesoKg * serie.repsReales;
                                tonelajeSemanal += subtotal;
                                totalMovidoKg += subtotal;
                            }
                        });
                    });
                });
                porSemana.push({ numeroSemana: semana.numeroSemana, tonelaje: tonelajeSemanal });
            });
        });

        // Detección de estancamiento (últimas 3 semanas con variaciones < 2%)
        let estancamientoDetectado = false;
        if (porSemana.length >= 3) {
            const ultimas = porSemana.slice(-3);
            const v1 = Math.abs(ultimas[1].tonelaje - ultimas[0].tonelaje) / (ultimas[0].tonelaje || 1);
            const v2 = Math.abs(ultimas[2].tonelaje - ultimas[1].tonelaje) / (ultimas[1].tonelaje || 1);
            if (v1 < 0.02 && v2 < 0.02) {
                estancamientoDetectado = true;
            }
        }

        return {
            totalMovidoKg,
            porSemana,
            estancamientoDetectado
        };
    }
};
