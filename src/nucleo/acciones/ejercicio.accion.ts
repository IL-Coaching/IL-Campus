"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";

export async function buscarEjercicios(query: string = "") {
    try {
        const entrenador = await getEntrenadorSesion();
        return await EjercicioServicio.buscar(entrenador.id, query);
    } catch (error) {
        console.error("Error al buscar ejercicios:", error);
        return [];
    }
}

export async function crearEjercicio(formData: any) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Aquí iría la validación Zod (pendiente crear validador)

        await EjercicioServicio.crear({
            ...formData,
            entrenadorId: entrenador.id
        });

        return { exito: true };
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
        return { error: "No se pudo crear el ejercicio." };
    }
}
