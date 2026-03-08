"use server";

import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";
import { Prisma } from "@prisma/client";
import { prisma } from "@/baseDatos/conexion";
import { revalidatePath } from "next/cache";
import { EsquemaEjercicio } from "../validadores/ejercicio.validador";

export async function buscarEjercicios(query: string = "", musculoFiltro?: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        return await EjercicioServicio.buscar(entrenador.id, query, musculoFiltro);
    } catch (error) {
        console.error("Error al buscar ejercicios:", error);
        return [];
    }
}


export async function crearEjercicio(formData: unknown) {
    try {
        const entrenador = await getEntrenadorSesion();

        // Si formData viene como un objeto plano en lugar de FormData, parseamos:
        const payload = formData as Record<string, unknown>;
        const dataParaValidar = {
            nombre: payload.nombre || "Sin nombre",
            musculoPrincipal: payload.musculoPrincipal,
            articulacion: payload.articulacion,
            patron: payload.patronMovimiento || payload.patron || "AISLAMIENTO",
            equipamiento: payload.equipamiento || [],
            lateralidad: payload.lateralidad || "BILATERAL",
            descripcion: payload.descripcion || undefined,
            urlVideo: payload.videoUrl || payload.urlVideo || undefined,
            visibleParaClientes: payload.visibleParaClientes ?? true
        };

        const validados = EsquemaEjercicio.parse(dataParaValidar);

        if (validados.urlVideo === "") validados.urlVideo = undefined;
        if (validados.descripcion === "") validados.descripcion = undefined;

        await EjercicioServicio.crear({
            ...validados,
            entrenadorId: entrenador.id
        });
        revalidatePath("/entrenador/biblioteca");

        return { exito: true };
    } catch (error) {
        console.error("Error al crear ejercicio:", error);
        return { error: "No se pudo crear el ejercicio. Verifique los campos obligatorios." };
    }
}

export async function actualizarEjercicio(id: string, formData: unknown) {
    try {
        const entrenador = await getEntrenadorSesion();

        const ejercicioPropio = await prisma.ejercicio.findFirst({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!ejercicioPropio) throw new Error("Acceso denegado.");

        const payload = formData as Record<string, unknown>;
        const dataParaValidar: Record<string, unknown> = {};

        if (payload.nombre !== undefined) dataParaValidar.nombre = payload.nombre;
        if (payload.musculoPrincipal !== undefined) dataParaValidar.musculoPrincipal = payload.musculoPrincipal;
        if (payload.articulacion !== undefined) dataParaValidar.articulacion = payload.articulacion;
        if (payload.patronMovimiento || payload.patron) dataParaValidar.patron = payload.patronMovimiento || payload.patron;
        if (payload.equipamiento !== undefined) dataParaValidar.equipamiento = payload.equipamiento;
        if (payload.lateralidad !== undefined) dataParaValidar.lateralidad = payload.lateralidad;
        if (payload.descripcion !== undefined) dataParaValidar.descripcion = payload.descripcion;
        if (payload.videoUrl !== undefined || payload.urlVideo !== undefined) dataParaValidar.urlVideo = payload.videoUrl || payload.urlVideo;
        if (payload.visibleParaClientes !== undefined) dataParaValidar.visibleParaClientes = payload.visibleParaClientes;

        // Validamos usando schema.partial() ya que son updates
        const validados = EsquemaEjercicio.partial().parse(dataParaValidar);

        const updateData: Partial<Prisma.EjercicioUpdateInput> = { ...validados };
        if (updateData.urlVideo === "") updateData.urlVideo = null;
        if (updateData.descripcion === "") updateData.descripcion = null;

        await EjercicioServicio.actualizar(id, updateData);
        revalidatePath("/entrenador/biblioteca");
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar ejercicio:", error);
        return { error: `Error: ${error instanceof Error ? error.message : "Desconocido"}` };
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
        revalidatePath("/entrenador/biblioteca");
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
        revalidatePath("/entrenador/biblioteca");
        return { exito: true, id: nuevo.id };
    } catch (error) {
        console.error("Error al duplicar ejercicio:", error);
        return { error: "No se pudo duplicar el ejercicio." };
    }
}
