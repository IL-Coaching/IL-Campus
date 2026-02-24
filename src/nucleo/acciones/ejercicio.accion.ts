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

        const data = {
            nombre: (formData.nombre as string) || "Sin nombre",
            musculoPrincipal: (formData.musculoPrincipal as GrupoMuscular),
            articulacion: (formData.articulacion as TipoArticulacion),
            patron: (formData.patronMovimiento as PatronMovimiento) || (formData.patron as PatronMovimiento) || "AISLAMIENTO",
            equipamiento: (formData.equipamiento as TipoEquipamiento[]) || [],
            lateralidad: (formData.lateralidad as Lateralidad) || "BILATERAL",
            descripcion: (formData.descripcion as string) || undefined,
            urlVideo: (formData.videoUrl as string) || (formData.urlVideo as string) || undefined,
            entrenadorId: entrenador.id
        };

        // Limpiar campos vacíos para que Prisma use null o default
        if (data.urlVideo === "") delete data.urlVideo;
        if (data.descripcion === "") delete (data as any).descripcion;

        await EjercicioServicio.crear(data as any);

        return { exito: true };
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
        return { error: "No se pudo crear el ejercicio. Verifique los campos obligatorios." };
    }
}

export async function actualizarEjercicio(id: string, formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        const ejercicioPropio = await prisma.ejercicio.findFirst({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!ejercicioPropio) throw new Error("Acceso denegado.");

        const updateData: any = {};
        if (formData.nombre) updateData.nombre = formData.nombre;
        if (formData.musculoPrincipal) updateData.musculoPrincipal = formData.musculoPrincipal;
        if (formData.articulacion) updateData.articulacion = formData.articulacion;
        if (formData.patronMovimiento || formData.patron)
            updateData.patron = formData.patronMovimiento || formData.patron;
        if (formData.equipamiento) updateData.equipamiento = formData.equipamiento;
        if (formData.lateralidad) updateData.lateralidad = formData.lateralidad;
        if (formData.descripcion !== undefined) updateData.descripcion = formData.descripcion || null;
        if (formData.videoUrl !== undefined || formData.urlVideo !== undefined)
            updateData.urlVideo = formData.videoUrl || formData.urlVideo || null;

        await EjercicioServicio.actualizar(id, updateData);
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
