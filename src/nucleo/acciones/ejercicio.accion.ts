"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";

/**
 * Acciones de Ejercicios — ArchSecure AI
 */

export async function buscarEjerciciosCatalogo(query: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const resultados = await EjercicioServicio.buscar(entrenador.id, query);

        return { exito: true, resultados };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function crearEjercicioCatalogo(formData: FormData) {
    try {
        const entrenador = await getEntrenadorSesion();

        const nombre = formData.get("nombre") as string;
        const grupoMuscular = formData.get("grupoMuscular") as string;
        const videoUrl = formData.get("videoUrl") as string;

        const nuevo = await EjercicioServicio.crear({
            entrenadorId: entrenador.id,
            nombre,
            grupoMuscular,
            videoUrl
        });

        return { exito: true, ejercicio: nuevo };
    } catch (error: any) {
        return { error: error.message };
    }
}
