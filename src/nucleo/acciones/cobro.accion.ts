"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { CobroServicio } from "../servicios/cobro.servicio";
import { EsquemaRegistrarCobro } from "../validadores/cobro.validador";
import { StorageServicio } from "../servicios/storage.servicio";

export async function registrarCobro(formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Validar inputs
        const validacion = EsquemaRegistrarCobro.safeParse(formData);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const data = validacion.data;

        // 2. BOLA: Verificar propiedad del cliente
        const clientePropio = await prisma.cliente.findFirst({
            where: { id: data.clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) {
            return { error: "No tienes permiso para registrar este cobro." };
        }

        let finalComprobanteUrl: string | undefined = undefined;

        // Procesamiento del comprobante
        if (data.comprobanteBase64) {
            const fileName = `comprobantes/${entrenador.id}/${data.clienteId}_${Date.now()}.png`;
            const upload = await StorageServicio.subirImagenBase64(data.comprobanteBase64, fileName);

            if (upload.success) {
                finalComprobanteUrl = upload.url;
            } else {
                console.warn("Fallback a base64 por error en storage:", upload.error);
                finalComprobanteUrl = data.comprobanteBase64;
            }
        }

        // 3. Ejecutar servicio
        await CobroServicio.registrarCobro({
            ...data,
            comprobanteUrl: finalComprobanteUrl
        });

        revalidatePath("/entrenador/finanzas");
        revalidatePath("/entrenador/clientes");

        return { exito: true };

    } catch (error) {
        console.error("Error en registrarCobro action:", error);
        return { error: "No se pudo procesar el cobro." };
    }
}

export async function anularCobro(cobroId: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        await CobroServicio.anularCobro(cobroId, entrenador.id);

        revalidatePath("/entrenador/finanzas");
        revalidatePath("/entrenador/clientes");
        return { exito: true };
    } catch (error: unknown) {
        console.error("Error al anular cobro:", error);
        return { error: error instanceof Error ? error.message : "No se pudo anular el cobro." };
    }
}
