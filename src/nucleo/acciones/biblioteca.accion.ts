"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";
import { BIBLIOTECA_EXTENSA } from "../constantes/biblioteca_data";

/**
 * Acciones para gestionar la biblioteca oficial de IL-Coaching.
 */

export async function sincronizarPlanesMaestros() {
    revalidatePath("/entrenador/biblioteca");
    return { success: true };
}

export async function cargarBibliotecaOficial() {
    try {
        const entrenador = await getEntrenadorSesion();

        let creados = 0;
        for (const ej of BIBLIOTECA_EXTENSA) {
            const existe = await prisma.ejercicio.findFirst({
                where: {
                    nombre: ej.nombre,
                    entrenadorId: entrenador.id
                }
            });

            if (!existe) {
                // Mapeo básico de strings a Enums
                const musculoMap: Record<string, any> = {
                    "Hombros": "HOMBROS",
                    "Pecho": "PECHO",
                    "Espalda": "ESPALDA",
                    "Bíceps": "BICEPS",
                    "Tríceps": "TRICEPS",
                    "Piernas": "CUADRICEPS",
                    "Glúteos": "GLUTEO",
                    "Cadena Posterior": "ISQUIOTIBIALES",
                    "General / Piernas": "CUADRICEPS"
                };

                const patronMap: Record<string, any> = {
                    "Empuje vertical": "EMPUJE_VERTICAL",
                    "Empuje horizontal": "EMPUJE_HORIZONTAL",
                    "Tracción vertical": "TRACCION_VERTICAL",
                    "Tracción horizontal": "TRACCION_HORIZONTAL",
                    "Dominante de Rodilla": "SENTADILLA",
                    "Dominante de Cadera": "BISAGRA",
                    "Bisagra de Cadera": "BISAGRA"
                };

                await EjercicioServicio.crear({
                    nombre: ej.nombre,
                    musculoPrincipal: (musculoMap[ej.grupoMuscular] || "CORE") as any,
                    articulacion: "MULTIARTICULAR",
                    patron: (patronMap[ej.patronMovimiento] || "AISLAMIENTO") as any,
                    equipamiento: [],
                    lateralidad: "BILATERAL",
                    descripcion: [
                        ej.musculosPrincipales && `Músculos principales: ${ej.musculosPrincipales}`,
                        ej.analisisBiomecanico && `Biomecánica: ${ej.analisisBiomecanico}`,
                        ej.equipoNecesario && `Equipamiento: ${ej.equipoNecesario}`,
                    ].filter(Boolean).join(" | "),
                    entrenadorId: entrenador.id,
                    origen: 'BIBLIOTECA_IL',
                    visibleParaClientes: true
                });
                creados++;
            }
        }

        revalidatePath("/entrenador/biblioteca");
        return { success: true, exito: true, creados };
    } catch (error) {
        console.error("Error al cargar biblioteca:", error);
        return { error: "No se pudo cargar la biblioteca oficial." };
    }
}

export async function purgarBibliotecaOficial() {
    try {
        const entrenador = await getEntrenadorSesion();

        const res = await prisma.ejercicio.deleteMany({
            where: {
                entrenadorId: entrenador.id,
                origen: 'BIBLIOTECA_IL'
            }
        });

        revalidatePath("/entrenador/biblioteca");
        return { success: true, exito: true, eliminados: res.count };
    } catch (error) {
        console.error("Error al purgar biblioteca:", error);
        return { error: "No se pudo purgar la biblioteca oficial." };
    }
}
