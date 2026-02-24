"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";
import { GrupoMuscular, TipoArticulacion, PatronMovimiento, TipoEquipamiento, Lateralidad } from "@prisma/client";
import { prisma } from "@/baseDatos/conexion";

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
            musculoPrincipal: (formData.musculoPrincipal as GrupoMuscular),
            articulacion: (formData.articulacion as TipoArticulacion),
            patron: (formData.patronMovimiento as PatronMovimiento) || (formData.patron as PatronMovimiento) || "AISLAMIENTO",
            equipamiento: (formData.equipamiento as TipoEquipamiento[]) || ["OTRO"],
            lateralidad: (formData.lateralidad as Lateralidad) || "BILATERAL",
            descripcion: formData.descripcion as string,
            urlVideo: (formData.videoUrl as string) || (formData.urlVideo as string),
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
        const entrenador = await getEntrenadorSesion();

        const ejercicioPropio = await prisma.ejercicio.findFirst({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!ejercicioPropio) throw new Error("Acceso denegado.");

        await EjercicioServicio.actualizar(id, {
            nombre: formData.nombre as string,
            musculoPrincipal: formData.musculoPrincipal as GrupoMuscular,
            articulacion: formData.articulacion as TipoArticulacion,
            patron: (formData.patronMovimiento as PatronMovimiento) || (formData.patron as PatronMovimiento),
            equipamiento: formData.equipamiento as TipoEquipamiento[],
            lateralidad: formData.lateralidad as Lateralidad,
            descripcion: formData.descripcion as string,
            urlVideo: (formData.videoUrl as string) || (formData.urlVideo as string),
        });
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar ejercicio:", error);
        return { error: "No se pudo actualizar el ejercicio." };
    }
}

export async function archivarEjercicio(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const ejercicioPropio = await prisma.ejercicio.findFirst({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!ejercicioPropio) throw new Error("Acceso denegado.");

        await EjercicioServicio.archivar(id);
        return { exito: true };
    } catch (error) {
        console.error("Error al archivar ejercicio:", error);
        return { error: "No se pudo archivar el ejercicio." };
    }
}

export async function duplicarEjercicio(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const original = await prisma.ejercicio.findFirst({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!original) throw new Error("Acceso denegado.");

        const nuevo = await EjercicioServicio.duplicar(id);
        return { exito: true, id: nuevo.id };
    } catch (error) {
        console.error("Error al duplicar ejercicio:", error);
        return { error: "No se pudo duplicar el ejercicio." };
    }
}
