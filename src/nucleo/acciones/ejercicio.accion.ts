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

// Alias para compatibilidad con componentes existentes
export const buscarEjerciciosCatalogo = buscarEjercicios;

export async function crearEjercicio(formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Aquí iría la validación Zod (pendiente crear validador)

        await EjercicioServicio.crear({
            nombre: formData.nombre as string,
            grupoMuscular: formData.grupoMuscular as string,
            patronMovimiento: formData.patronMovimiento as string,
            musculosPrincipales: formData.musculosPrincipales as string,
            musculosAccesorios: formData.musculosAccesorios as string,
            analisisBiomecanico: formData.analisisBiomecanico as string,
            equipoNecesario: formData.equipoNecesario as string,
            videoUrl: formData.videoUrl as string,
            fotoUrl: formData.fotoUrl as string,
            descripcion: formData.descripcion as string,
            entrenadorId: entrenador.id
        });

        return { exito: true };
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
        return { error: "No se pudo crear el ejercicio." };
    }
}
