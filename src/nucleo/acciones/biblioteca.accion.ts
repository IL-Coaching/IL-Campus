"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";
import { BIBLIOTECA_EXTENSA } from "../constantes/biblioteca_data";

/**
 * Acciones para gestionar la biblioteca oficial de IL-Coaching.
 * Los datos de ejercicios base provienen de src/nucleo/constantes/biblioteca_data.ts
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
                await EjercicioServicio.crear({
                    nombre: ej.nombre,
                    musculoPrincipal: "CUADRICEPS", // valor por defecto — la biblioteca_data usa texto libre
                    articulacion: "MULTIARTICULAR",
                    patron: "AISLAMIENTO",
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
