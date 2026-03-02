"use server";

import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

export async function obtenerDashboardData() {
    try {
        const cliente = await getAlumnoSesion();

        // Obtener último check-in
        const ultimoCheckin = await prisma.checkin.findFirst({
            where: { clienteId: cliente.id },
            orderBy: { fecha: 'desc' }
        });

        // Obtener plan activo
        const planActivo = await prisma.planAsignado.findFirst({
            where: {
                clienteId: cliente.id,
                estado: 'activa'
            },
            include: {
                plan: true
            }
        });

        // Calcular días restantes del plan
        let diasRestantes = 0;
        let planActivoInfo = null;
        if (planActivo && planActivo.fechaVencimiento) {
            const hoy = new Date();
            const vencimiento = new Date(planActivo.fechaVencimiento);
            const diffTime = vencimiento.getTime() - hoy.getTime();
            diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            planActivoInfo = {
                nombre: planActivo.plan.nombre,
                fechaVencimiento: planActivo.fechaVencimiento,
                diasRestantes: diasRestantes
            };
        }

        // Obtener mensajes no leídos del entrenador
        const mensajesNoLeidos = await prisma.mensaje.count({
            where: {
                clienteId: cliente.id,
                emisor: 'entrenador',
                leido: false
            }
        });

        // Obtener estadísticas de la semana
        const haceUnaSemana = new Date();
        haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

        const checkinsUltimaSemana = await prisma.checkin.count({
            where: {
                clienteId: cliente.id,
                fecha: { gte: haceUnaSemana }
            }
        });

        return {
            exito: true,
            datos: {
                ultimoCheckin: ultimoCheckin ? {
                    fecha: ultimoCheckin.fecha,
                    pesoKg: ultimoCheckin.pesoKg,
                    energia: ultimoCheckin.energia,
                    sueno: ultimoCheckin.sueno,
                    adherencia: ultimoCheckin.adherencia
                } : null,
                plan: planActivoInfo,
                mensajesNoLeidos,
                checkinsUltimaSemana,
                tieneCheckinPendiente: checkinsUltimaSemana === 0
            }
        };
    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        return {
            exito: false,
            datos: {
                ultimoCheckin: null,
                plan: null,
                mensajesNoLeidos: 0,
                checkinsUltimaSemana: 0,
                tieneCheckinPendiente: true
            }
        };
    }
}
