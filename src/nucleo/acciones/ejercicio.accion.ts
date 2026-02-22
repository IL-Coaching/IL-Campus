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

// Compatibilidad total con el buscador del Constructor de Clientes
export async function buscarEjerciciosCatalogo(query: string = "") {
    try {
        const entrenador = await getEntrenadorSesion();
        const resultados = await EjercicioServicio.buscar(entrenador.id, query);
        return { exito: true, resultados };
    } catch (error) {
        console.error("Error en buscarEjerciciosCatalogo:", error);
        return { exito: false, resultados: [] };
    }
}

export async function crearEjercicio(formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        await EjercicioServicio.crear({
            nombre: (formData.nombre as string) || "Sin nombre",
            grupoMuscular: (formData.grupoMuscular as string) || "Varios",
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
