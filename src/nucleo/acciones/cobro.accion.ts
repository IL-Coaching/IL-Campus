"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { CobroServicio } from "../servicios/cobro.servicio";
import { EsquemaRegistrarCobro } from "../validadores/cobro.validador";
import { createClient } from "@supabase/supabase-js";

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
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

                if (supabaseUrl && supabaseKey) {
                    const supabase = createClient(supabaseUrl, supabaseKey);
                    const base64Data = data.comprobanteBase64.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, "base64");
                    const fileName = `comprobantes/${entrenador.id}/${data.clienteId}_${Date.now()}.png`;

                    const { error: uploadError } = await supabase
                        .storage
                        .from('archivos')
                        .upload(fileName, buffer, {
                            contentType: 'image/png',
                            upsert: true
                        });

                    if (uploadError) {
                        console.warn("No se pudo subir a Supabase, guardando como Base64 en DB (Fallback)", uploadError);
                        finalComprobanteUrl = data.comprobanteBase64;
                    } else {
                        const { data: publicUrlData } = supabase.storage.from('archivos').getPublicUrl(fileName);
                        finalComprobanteUrl = publicUrlData.publicUrl;
                    }
                } else {
                    finalComprobanteUrl = data.comprobanteBase64;
                }
            } catch (e) {
                console.error("Error procesando imagen:", e);
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
