"use server";

import { revalidatePath } from "next/cache";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { ClienteServicio } from "../servicios/cliente.servicio";
import { EsquemaAltaCliente, EsquemaAsignarPlan } from "../validadores/cliente.validador";
import { prisma } from "@/baseDatos/conexion";

export async function altaManualCliente(formData: FormData) {
    try {
        const rawData = {
            nombre: formData.get("nombre") as string,
            email: formData.get("email") as string,
            telefono: formData.get("telefono") as string,
            plan: formData.get("plan") as string,
        };

        const validacion = EsquemaAltaCliente.safeParse(rawData);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const { nombre, email, telefono, plan } = validacion.data;
        const entrenador = await getEntrenadorSesion();

        const nuevoCliente = await ClienteServicio.crear({
            nombre,
            email,
            telefono,
            entrenadorId: entrenador.id,
            notas: `Alta inicial con plan: ${plan}`
        });

        revalidatePath("/entrenador/clientes");
        return { exito: true, cliente: nuevoCliente, codigoActivacion: nuevoCliente.codigoActivacion };

    } catch (error: unknown) {
        console.error("Error al dar de alta al cliente:", error);
        return { error: "Ocurrió un error al guardar el cliente en la base de datos." };
    }
}

export async function asignarMembresia(data: { clienteId: string; planId: string; fechaInicio: string }) {
    try {
        const entrenador = await getEntrenadorSesion();
        const validacion = EsquemaAsignarPlan.safeParse(data);
        if (!validacion.success) {
            return { error: validacion.error.issues[0].message };
        }

        const clientePropio = await prisma.cliente.findFirst({
            where: { id: data.clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) {
            return { error: "No tienes permiso para gestionar este cliente." };
        }

        await ClienteServicio.asignarPlan(validacion.data);
        revalidatePath("/entrenador/clientes");
        return { exito: true };

    } catch (error) {
        console.error("Error al asignar membresía:", error);
        return { error: "No se pudo asignar la membresía." };
    }
}

export async function eliminarCliente(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const clientePropio = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });

        if (!clientePropio) {
            return { error: "No tienes permiso para gestionar este cliente." };
        }

        await prisma.$transaction(async (tx) => {
            await tx.cobro.deleteMany({ where: { clienteId } });
            await tx.checkin.deleteMany({ where: { clienteId } });
            await tx.cicloMenstrual.deleteMany({ where: { clienteId } });
            await tx.formularioInscripcion.deleteMany({ where: { clienteId } });
            await tx.mensaje.deleteMany({ where: { clienteId } });

            const sesiones = await tx.sesionRegistrada.findMany({ where: { clienteId } });
            for (const sesion of sesiones) {
                await tx.serieRegistrada.deleteMany({ where: { sesionId: sesion.id } });
                await tx.metricasSesion.deleteMany({ where: { sesionId: sesion.id } });
            }
            await tx.sesionRegistrada.deleteMany({ where: { clienteId } });
            await tx.planAsignado.deleteMany({ where: { clienteId } });

            const macros = await tx.macrociclo.findMany({ where: { clienteId } });
            for (const macro of macros) {
                const bloques = await tx.bloqueMensual.findMany({ where: { macrocicloId: macro.id } });
                for (const bloque of bloques) {
                    const semanas = await tx.semana.findMany({ where: { bloqueMensualId: bloque.id } });
                    for (const semana of semanas) {
                        const dias = await tx.diaSesion.findMany({ where: { semanaId: semana.id } });
                        for (const dia of dias) {
                            await tx.ejercicioPlanificado.deleteMany({ where: { diaId: dia.id } });
                        }
                        await tx.diaSesion.deleteMany({ where: { semanaId: semana.id } });
                    }
                    await tx.semana.deleteMany({ where: { bloqueMensualId: bloque.id } });
                }
                await tx.bloqueMensual.deleteMany({ where: { macrocicloId: macro.id } });
            }
            await tx.macrociclo.deleteMany({ where: { clienteId } });
            await tx.cliente.delete({ where: { id: clienteId } });
        });

        revalidatePath("/entrenador/clientes");
        return { exito: true };

    } catch (error) {
        console.error("Error crítico al eliminar cliente:", error);
        return { error: "Ocurrió un error al eliminar el cliente de la base de datos." };
    }
}

export async function obtenerCondicionesClinicas(clienteId: string) {
    try {
        await getEntrenadorSesion();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formulario = await (prisma.formularioInscripcion as any).findUnique({
            where: { clienteId },
            select: {
                condicionesClinicas: true
            }
        });
        return { exito: true, condiciones: formulario?.condicionesClinicas || [] };
    } catch {
        return { error: "Error al obtener condiciones" };
    }
}
