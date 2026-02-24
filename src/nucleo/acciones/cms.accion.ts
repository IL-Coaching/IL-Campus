"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { StorageServicio } from "../servicios/storage.servicio";
import { revalidatePath } from "next/cache";

/**
 * Obtiene la configuración de landing del entrenador actual y sus planes.
 * Si no existe ConfigLanding, la crea automáticamente.
 */
export async function obtenerCMSDatos() {
    try {
        const entrenador = await getEntrenadorSesion();

        let config = await prisma.configLanding.findUnique({
            where: { entrenadorId: entrenador.id }
        });

        if (!config) {
            config = await prisma.configLanding.create({
                data: { entrenadorId: entrenador.id }
            });
        }

        const planes = await prisma.plan.findMany({
            where: { entrenadorId: entrenador.id },
            orderBy: { creadoEn: 'desc' },
            select: { id: true, nombre: true, visible: true, precio: true }
        });

        return { exito: true, config, planes };
    } catch (error) {
        console.error("Error al obtener datos CMS:", error);
        return { exito: false };
    }
}

/**
 * Actualiza campos de texto o JSON (testimonios/faqs) en ConfigLanding.
 */
export async function actualizarSeccionCMS(datos: Record<string, any>) {
    try {
        const entrenador = await getEntrenadorSesion();

        await prisma.configLanding.update({
            where: { entrenadorId: entrenador.id },
            data: datos
        });

        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar sección CMS:", error);
        return { exito: false, error: "No se pudo actualizar la sección." };
    }
}

/**
 * Cambia la visibilidad pública de un plan en la landing.
 */
export async function togglePlanVisibilidad(planId: string, visible: boolean) {
    try {
        const entrenador = await getEntrenadorSesion();

        await prisma.plan.update({
            where: { id: planId, entrenadorId: entrenador.id },
            data: { visible }
        });

        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true };
    } catch (error) {
        console.error("Error al actualizar visibilidad de plan:", error);
        return { exito: false, error: "No se pudo actualizar el plan." };
    }
}

/**
 * Sube una imagen en base64 para el CMS (Hero o Bio) a Supabase Storage.
 */
export async function actualizarImagenCMS(base64: string, tipo: 'hero' | 'bio') {
    try {
        const entrenador = await getEntrenadorSesion();
        const fileName = `landing/${tipo}-${entrenador.id}-${Date.now()}.png`;

        const upload = await StorageServicio.subirImagenBase64(base64, fileName);
        if (!upload.success) return { error: upload.error };

        const updateData: Record<string, string> = {};
        if (tipo === 'hero') updateData.heroImagenUrl = upload.url!;
        if (tipo === 'bio') updateData.bioImagenUrl = upload.url!;

        await prisma.configLanding.update({
            where: { entrenadorId: entrenador.id },
            data: updateData
        });

        revalidatePath('/entrenador/cms');
        revalidatePath('/');
        return { exito: true, imageUrl: upload.url };
    } catch (error) {
        console.error(`Error CMS imagen ${tipo}:`, error);
        return { error: "No se pudo procesar la imagen." };
    }
}
