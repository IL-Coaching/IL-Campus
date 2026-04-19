"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

export async function obtenerPlantillasSemana() {
    try {
        await getEntrenadorSesion();

        const plantillas = await prisma.semana.findMany({
            where: {
                esPlantilla: true,
                bloqueMensual: null,
                OR: [
                    { plantillaNombre: { not: null } },
                    { diasSesion: { some: {} } }
                ]
            },
            include: {
                diasSesion: {
                    include: {
                        ejercicios: {
                            include: { ejercicio: true },
                            orderBy: { orden: 'asc' }
                        }
                    },
                    orderBy: { diaSemana: 'asc' }
                }
            }
        });

        return { exito: true, plantillas };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al obtener plantillas" };
    }
}

export async function crearPlantillaSemana(data: {
    nombre: string;
    objetivoSemana?: string;
    esFaseDeload?: boolean;
}) {
    try {
        await getEntrenadorSesion();

        const plantilla = await prisma.semana.create({
            data: {
                numeroSemana: 1,
                objetivoSemana: data.objetivoSemana || 'Entrenamiento general',
                RIRobjetivo: 2,
                volumenEstimado: 'Medio',
                esPlantilla: true,
                plantillaNombre: data.nombre,
                esFaseDeload: data.esFaseDeload || false,
                bloqueMensualId: null,
            },
            include: { diasSesion: true }
        });

        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        await prisma.diaSesion.createMany({
            data: diasSemana.map(dia => ({
                semanaId: plantilla.id,
                diaSemana: dia,
                focoMuscular: ''
            }))
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true, plantilla };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al crear plantilla" };
    }
}

export async function actualizarPlantillaSemana(semanaId: string, data: {
    nombre?: string;
    objetivoSemana?: string;
    esFaseDeload?: boolean;
}) {
    try {
        await getEntrenadorSesion();

        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaId, esPlantilla: true }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        await prisma.semana.update({
            where: { id: semanaId },
            data: {
                plantillaNombre: data.nombre,
                objetivoSemana: data.objetivoSemana,
                esFaseDeload: data.esFaseDeload
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar plantilla" };
    }
}

export async function actualizarDiaPlantilla(diaId: string, data: {
    focoMuscular?: string;
    notas?: string;
}) {
    try {
        await getEntrenadorSesion();

        const dia = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { esPlantilla: true } }
        });

        if (!dia) throw new Error("Día no encontrado.");

        await prisma.diaSesion.update({
            where: { id: diaId },
            data: { focoMuscular: data.focoMuscular, notas: data.notas }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al actualizar día" };
    }
}

export async function agregarEjercicioAPlantilla(diaId: string, ejercicioId: string | null, nombreLibre?: string) {
    try {
        await getEntrenadorSesion();

        const dia = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { esPlantilla: true } },
            include: { ejercicios: true }
        });

        if (!dia) throw new Error("Día no encontrado.");

        const ultimoOrden = dia.ejercicios.length > 0
            ? Math.max(...dia.ejercicios.map(e => e.orden))
            : 0;

        await prisma.ejercicioPlanificado.create({
            data: {
                diaId,
                ejercicioId,
                nombreLibre: nombreLibre || null,
                esBiblioteca: !!ejercicioId,
                series: 3,
                repsMin: 8,
                repsMax: 12,
                descansoSegundos: 90,
                orden: ultimoOrden + 1
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al agregar ejercicio" };
    }
}

export async function guardarCambiosEjercicioPlantilla(ejercicioId: string, data: {
    series?: number;
    repsMin?: number | null;
    repsMax?: number | null;
    descansoSegundos?: number | null;
    RIR?: number | null;
    tempo?: string | null;
    pesoSugerido?: number | null;
    notasTecnicas?: string | null;
}) {
    try {
        await getEntrenadorSesion();

        const ejercicio = await prisma.ejercicioPlanificado.findFirst({
            where: { id: ejercicioId, diaSesion: { semana: { esPlantilla: true } } }
        });

        if (!ejercicio) throw new Error("Ejercicio no encontrado.");

        await prisma.ejercicioPlanificado.update({
            where: { id: ejercicioId },
            data: {
                series: data.series,
                repsMin: data.repsMin,
                repsMax: data.repsMax,
                descansoSegundos: data.descansoSegundos,
                RIR: data.RIR,
                tempo: data.tempo,
                pesoSugerido: data.pesoSugerido,
                notasTecnicas: data.notasTecnicas
            }
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al guardar ejercicio" };
    }
}

export async function eliminarEjercicioPlantilla(ejercicioId: string) {
    try {
        const ejercicio = await prisma.ejercicioPlanificado.findFirst({
            where: { id: ejercicioId, diaSesion: { semana: { esPlantilla: true } } }
        });

        if (!ejercicio) throw new Error("Ejercicio no encontrado.");

        await prisma.ejercicioPlanificado.delete({ where: { id: ejercicioId } });
        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al eliminar ejercicio" };
    }
}

export async function reordenarEjerciciosPlantilla(diaId: string, ejercicioIds: string[]) {
    try {
        const dia = await prisma.diaSesion.findFirst({
            where: { id: diaId, semana: { esPlantilla: true } }
        });

        if (!dia) throw new Error("Día no encontrado.");

        await prisma.$transaction(
            ejercicioIds.map((id, index) =>
                prisma.ejercicioPlanificado.update({
                    where: { id },
                    data: { orden: index + 1 }
                })
            )
        );

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al reordenar" };
    }
}

export async function eliminarPlantillaSemana(semanaId: string) {
    try {
        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaId, esPlantilla: true }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        await prisma.$transaction(async (tx) => {
            const dias = await tx.diaSesion.findMany({ where: { semanaId } });
            for (const dia of dias) {
                await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
            }
            await tx.diaSesion.deleteMany({ where: { semanaId } });
            await tx.semana.delete({ where: { id: semanaId } });
        });

        revalidatePath('/entrenador/biblioteca');
        return { exito: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Error al eliminar plantilla" };
    }
}

export async function importarSemanaAPlantilla(semanaPlantillaId: string, clienteId: string, semanaDestino: number, modo: 'reemplazar' | 'agregar' = 'agregar') {
    try {
        const entrenador = await getEntrenadorSesion();

        const plantilla = await prisma.semana.findFirst({
            where: { id: semanaPlantillaId, esPlantilla: true },
            include: {
                diasSesion: {
                    include: {
                        ejercicios: {
                            include: { ejercicio: true },
                            orderBy: { orden: 'asc' }
                        }
                    }
                }
            }
        });

        if (!plantilla) throw new Error("Plantilla no encontrada.");

        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!cliente) throw new Error("Cliente no encontrado.");

        let macrociclo = await prisma.macrociclo.findFirst({
            where: { clienteId },
            include: { bloquesMensuales: { include: { semanas: true } } }
        });

        if (!macrociclo) {
            macrociclo = await prisma.macrociclo.create({
                data: { clienteId, duracionSemanas: 12, fechaInicio: new Date() },
                include: { bloquesMensuales: { include: { semanas: true } } }
            });
            await prisma.bloqueMensual.create({
                data: { macrocicloId: macrociclo.id, objetivo: 'Adaptación', duracion: 4 }
            });
        }

        const bloque = await prisma.bloqueMensual.findFirst({
            where: { macrocicloId: macrociclo.id }
        });

        if (!bloque) throw new Error("Error al acceder al bloque mensual.");

        if (modo === 'reemplazar') {
            const semanaExistente = await prisma.semana.findFirst({
                where: { bloqueMensualId: bloque.id, numeroSemana: semanaDestino },
                include: { diasSesion: true }
            });

            if (semanaExistente) {
                await prisma.$transaction(async (tx) => {
                    for (const dia of semanaExistente.diasSesion) {
                        await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
                        await tx.diaSesion.deleteMany({ where: { id: dia.id } });
                    }
                    await tx.semana.delete({ where: { id: semanaExistente.id } });
                });
            }

            const nuevaSemana = await prisma.semana.create({
                data: {
                    bloqueMensualId: bloque.id,
                    numeroSemana: semanaDestino,
                    objetivoSemana: plantilla.objetivoSemana,
                    RIRobjetivo: plantilla.RIRobjetivo,
                    volumenEstimado: plantilla.volumenEstimado,
                    esFaseDeload: plantilla.esFaseDeload
                }
            });

            for (const diaPlantilla of plantilla.diasSesion) {
                const nuevoDia = await prisma.diaSesion.create({
                    data: {
                        semanaId: nuevaSemana.id,
                        diaSemana: diaPlantilla.diaSemana,
                        focoMuscular: diaPlantilla.focoMuscular,
                        notas: diaPlantilla.notas
                    }
                });

                for (const ej of diaPlantilla.ejercicios) {
                    await prisma.ejercicioPlanificado.create({
                        data: {
                            diaId: nuevoDia.id,
                            ejercicioId: ej.ejercicioId,
                            nombreLibre: ej.nombreLibre,
                            esBiblioteca: ej.esBiblioteca,
                            series: ej.series,
                            repsMin: ej.repsMin,
                            repsMax: ej.repsMax,
                            RIR: ej.RIR,
                            tempo: ej.tempo,
                            descansoSegundos: ej.descansoSegundos,
                            pesoSugerido: ej.pesoSugerido,
                            notasTecnicas: ej.notasTecnicas,
                            orden: ej.orden
                        }
                    });
                }
            }
        } else {
            const ultimasSemanas = await prisma.semana.findMany({
                where: { bloqueMensualId: bloque.id },
                orderBy: { numeroSemana: 'desc' },
                take: 1
            });

            const proximoNumero = ultimasSemanas.length > 0 ? ultimasSemanas[0].numeroSemana + 1 : 1;

            const nuevaSemana = await prisma.semana.create({
                data: {
                    bloqueMensualId: bloque.id,
                    numeroSemana: proximoNumero,
                    objetivoSemana: plantilla.objetivoSemana,
                    RIRobjetivo: plantilla.RIRobjetivo,
                    volumenEstimado: plantilla.volumenEstimado,
                    esFaseDeload: plantilla.esFaseDeload
                }
            });

            for (const diaPlantilla of plantilla.diasSesion) {
                const nuevoDia = await prisma.diaSesion.create({
                    data: {
                        semanaId: nuevaSemana.id,
                        diaSemana: diaPlantilla.diaSemana,
                        focoMuscular: diaPlantilla.focoMuscular,
                        notas: diaPlantilla.notas
                    }
                });

                for (const ej of diaPlantilla.ejercicios) {
                    await prisma.ejercicioPlanificado.create({
                        data: {
                            diaId: nuevoDia.id,
                            ejercicioId: ej.ejercicioId,
                            nombreLibre: ej.nombreLibre,
                            esBiblioteca: ej.esBiblioteca,
                            series: ej.series,
                            repsMin: ej.repsMin,
                            repsMax: ej.repsMax,
                            RIR: ej.RIR,
                            tempo: ej.tempo,
                            descansoSegundos: ej.descansoSegundos,
                            pesoSugerido: ej.pesoSugerido,
                            notasTecnicas: ej.notasTecnicas,
                            orden: ej.orden
                        }
                    });
                }
            }
        }

        revalidatePath(`/entrenador/clientes/${clienteId}/planificacion`);
        return { exito: true };
    } catch (error) {
        console.error("Error al importar plantilla:", error);
        return { error: error instanceof Error ? error.message : "Error al importar plantilla" };
    }
}
