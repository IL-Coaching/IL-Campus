"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { revalidatePath } from "next/cache";
import { TipoNotificacion, GravedadNotificacion } from "@prisma/client";

/**
 * Crea una nueva notificación para un entrenador.
 */
export async function crearNotificacionAction(data: {
    entrenadorId: string;
    tipo: TipoNotificacion;
    gravedad: GravedadNotificacion;
    titulo: string;
    cuerpo: string;
    enlace?: string;
}) {
    try {
        await prisma.notificacion.create({
            data: {
                entrenadorId: data.entrenadorId,
                tipo: data.tipo,
                gravedad: data.gravedad,
                titulo: data.titulo,
                cuerpo: data.cuerpo,
                enlace: data.enlace
            }
        });
        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error al crear notificación:", error);
        return { error: "No se pudo crear la notificación" };
    }
}

/**
 * Obtiene las notificaciones del entrenador en sesión.
 */
export async function obtenerNotificaciones(soloNoLeidas = false) {
    try {
        const entrenador = await getEntrenadorSesion();

        const notificaciones = await prisma.notificacion.findMany({
            where: {
                entrenadorId: entrenador.id,
                purgada: false,
                ...(soloNoLeidas ? { leida: false } : {})
            },
            orderBy: { creadaEn: 'desc' }
        });

        return { exito: true, notificaciones };
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return { exito: false, notificaciones: [] };
    }
}

/**
 * Marca una notificación como leída/no leída.
 */
export async function toggleLeidaNotificacion(id: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const notif = await prisma.notificacion.findUnique({
            where: { id, entrenadorId: entrenador.id }
        });

        if (!notif) return { error: "No encontrada" };

        await prisma.notificacion.update({
            where: { id },
            data: { leida: !notif.leida }
        });

        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error al alternar estado de notificación:", error);
        return { error: "No se pudo actualizar la notificación" };
    }
}

/**
 * Purgar (ocultar) una lista de notificaciones o todas las leídas.
 */
export async function purgarNotificaciones(ids?: string[]) {
    try {
        const entrenador = await getEntrenadorSesion();

        if (ids && ids.length > 0) {
            await prisma.notificacion.updateMany({
                where: { id: { in: ids }, entrenadorId: entrenador.id },
                data: { purgada: true }
            });
        } else {
            await prisma.notificacion.updateMany({
                where: { entrenadorId: entrenador.id, leida: true },
                data: { purgada: true }
            });
        }

        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error al purgar notificaciones:", error);
        return { error: "No se pudieron eliminar las notificaciones" };
    }
}

/**
 * Función auxiliar interna para verificar si ya existe una notificación reciente
 * y así evitar duplicados innecesarios.
 */
async function existeNotificacionReciente(
    entrenadorId: string,
    tipo: TipoNotificacion,
    textoBusqueda: string,
    campo: 'titulo' | 'cuerpo',
    horasMaximas?: number
) {
    const whereClause: Record<string, unknown> = {
        entrenadorId,
        tipo,
        [campo]: { contains: textoBusqueda }
    };
    if (horasMaximas) {
        whereClause.creadaEn = { gte: new Date(Date.now() - horasMaximas * 60 * 60 * 1000) };
    }
    return await prisma.notificacion.findFirst({ where: whereClause });
}

/**
 * Lógica automática: Generar alertas de finanzas para el dashboard.
 * Se puede llamar desde un cron o al cargar el dashboard.
 */
export async function dispararAlertasFinancieras() {
    try {
        const entrenador = await getEntrenadorSesion();
        const ahora = new Date();
        const enTresDias = new Date();
        enTresDias.setDate(ahora.getDate() + 3);

        // 1. Buscar planes activos que vencen pronto y no tienen notificación reciente
        const planesParaVencer = await prisma.planAsignado.findMany({
            where: {
                cliente: { entrenadorId: entrenador.id, activo: true },
                fechaVencimiento: { lte: enTresDias, gte: ahora },
                estado: "ACTIVO"
            },
            include: { cliente: true }
        });

        for (const plan of planesParaVencer) {
            // Evitar duplicados del mismo tipo para el mismo cliente en las últimas 24h
            const existePlan = await existeNotificacionReciente(entrenador.id, TipoNotificacion.FINANZA, plan.cliente.nombre, 'titulo', 24);

            if (!existePlan) {
                await prisma.notificacion.create({
                    data: {
                        entrenadorId: entrenador.id,
                        tipo: TipoNotificacion.FINANZA,
                        gravedad: GravedadNotificacion.ALERTA,
                        titulo: `Vencimiento de Membresía: ${plan.cliente.nombre}`,
                        cuerpo: `El plan asignado a ${plan.cliente.nombre} vence el ${plan.fechaVencimiento.toLocaleDateString()}. Recordá gestionar el próximo cobro.`,
                        enlace: `/entrenador/finanzas?clienteId=${plan.cliente.id}`
                    }
                });
            }
        }

        revalidatePath("/entrenador");
        return { exito: true };
    } catch (error) {
        console.error("Error en dispararAlertasFinancieras:", error);
        return { error: "Error procesando alertas" };
    }
}

/**
 * Genera notificaciones para formularios que aún no han sido procesados.
 */
export async function dispararAlertasFormularios() {
    try {
        const entrenador = await getEntrenadorSesion();

        // Prospectos con formulario pero sin plan
        const prospectosPendientes = await prisma.cliente.findMany({
            where: {
                entrenadorId: entrenador.id,
                formularioInscripcion: { isNot: null },
                planesAsignados: { none: {} }
            }
        });

        for (const p of prospectosPendientes) {
            const existeNotif = await existeNotificacionReciente(entrenador.id, TipoNotificacion.NUEVO_FORMULARIO, p.nombre, 'cuerpo');

            if (!existeNotif) {
                await prisma.notificacion.create({
                    data: {
                        entrenadorId: entrenador.id,
                        tipo: TipoNotificacion.NUEVO_FORMULARIO,
                        gravedad: GravedadNotificacion.INFO,
                        titulo: `Formulario Pendiente: ${p.nombre}`,
                        cuerpo: `El prospecto ${p.nombre} envió su formulario y aún no tiene un plan asignado.`,
                        enlace: `/entrenador/clientes?vista=formulario&clienteId=${p.id}`
                    }
                });
            }
        }
        return { exito: true };
    } catch (error) {
        console.error("Error en dispararAlertasFormularios:", error);
        return { error: "Error procesando alertas de formularios" };
    }
}
