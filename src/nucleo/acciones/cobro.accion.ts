"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { CobroServicio } from "../servicios/cobro.servicio";
import { EsquemaRegistrarCobro } from "../validadores/cobro.validador";

export async function registrarCobro(formData: Record<string, unknown>) {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Validar inputs
        const validacion = EsquemaRegistrarCobro.safeParse(formData);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const { clienteId } = validacion.data;

        // 2. BOLA: Verificar propiedad del cliente
        const clientePropio = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) {
            return { error: "No tienes permiso para registrar este cobro." };
        }

        // 3. Ejecutar servicio
        await CobroServicio.registrarCobro(validacion.data);

        revalidatePath("/entrenador/finanzas");
        revalidatePath("/entrenador/clientes");

        return { exito: true };

    } catch (error) {
        console.error("Error en registrarCobro action:", error);
        return { error: "No se pudo procesar el cobro." };
    }
}
