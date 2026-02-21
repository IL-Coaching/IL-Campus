"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { ClienteServicio } from "../servicios/cliente.servicio";

export async function altaManualCliente(formData: FormData) {
    try {
        const nombre = formData.get("nombre") as string;
        const email = formData.get("email") as string;
        const telefono = formData.get("telefono") as string;
        const plan = formData.get("plan") as string; // 'Start', 'GymRat', 'Elite'

        if (!nombre || !email || !plan) {
            return { error: "Faltan campos obligatorios" };
        }

        // 1. Obtener el Entrenador desde la sesión (Capa de Seguridad)
        const entrenador = await getEntrenadorSesion();

        // 2. Crear el Cliente usando el Servicio
        const nuevoCliente = await ClienteServicio.crear({
            nombre,
            email,
            telefono,
            entrenadorId: entrenador.id,
            notas: `Alta inicial con plan: ${plan}`
        });

        // Revalidar la vista de clientes para que se actualice la tabla
        revalidatePath("/entrenador/clientes");

        return { exito: true, cliente: nuevoCliente };

    } catch (error: unknown) {
        console.error("Error al dar de alta al cliente:", error);
        return { error: "Ocurrió un error al guardar el cliente en la base de datos." };
    }
}
