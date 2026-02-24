"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";
import { GrupoMuscular, TipoArticulacion, PatronMovimiento, TipoEquipamiento, Lateralidad } from "@prisma/client";

export async function buscarEjercicios(query: string = "", musculoFiltro?: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        return await EjercicioServicio.buscar(entrenador.id, query, musculoFiltro);
    } catch (error) {
        console.error("Error al buscar ejercicios:", error);
        return [];
    }
}


export async function crearEjercicio(formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        await EjercicioServicio.crear({
            nombre: (formData.nombre as string) || "Sin nombre",
            musculoPrincipal: (formData.musculoPrincipal as GrupoMuscular) || "CUADRICEPS",
            articulacion: (formData.articulacion as TipoArticulacion) || "MONOARTICULAR",
            patron: (formData.patronMovimiento as PatronMovimiento) || "AISLAMIENTO",
            equipamiento: formData.equipamiento ? [formData.equipamiento as TipoEquipamiento] : ["MAQUINA"],
            lateralidad: (formData.lateralidad as Lateralidad) || "BILATERAL",
            descripcion: formData.descripcion as string,
            urlVideo: formData.videoUrl as string,
            entrenadorId: entrenador.id
        });

        return { exito: true };
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
        return { error: "No se pudo crear el ejercicio." };
    }
}

export async function actualizarEjercicio(id: string, formData: Record<string, unknown>) {
    try {
        await EjercicioServicio.actualizar(id, {
            nombre: formData.nombre as string,
            musculoPrincipal: formData.musculoPrincipal as GrupoMuscular,
            articulacion: formData.articulacion as TipoArticulacion,
            patron: formData.patron as PatronMovimiento,
            equipamiento: formData.equipamiento as TipoEquipamiento[],
            lateralidad: formData.lateralidad as Lateralidad,
            descripcion: formData.descripcion as string,
            urlVideo: formData.urlVideo as string,
        });
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar ejercicio:", error);
        return { error: "No se pudo actualizar el ejercicio." };
    }
}

export async function archivarEjercicio(id: string) {
    try {
        await EjercicioServicio.archivar(id);
        return { exito: true };
    } catch (error) {
        console.error("Error al archivar ejercicio:", error);
        return { error: "No se pudo archivar el ejercicio." };
    }
}

export async function duplicarEjercicio(id: string) {
    try {
        const nuevo = await EjercicioServicio.duplicar(id);
        return { exito: true, id: nuevo.id };
    } catch (error) {
        console.error("Error al duplicar ejercicio:", error);
        return { error: "No se pudo duplicar el ejercicio." };
    }
}
