"use server"

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";

import { dispararAlertasFinancieras } from "./notificacion.accion";

/**
 * Obtiene todas las métricas del dashboard central del entrenador.
 * Incluye KPIs, contadores operativos y notificaciones no leídas.
 */
export async function obtenerMetricasDashboard() {
    try {
        const entrenador = await getEntrenadorSesion();

        // Disparar alertas automáticas
        await dispararAlertasFinancieras();

        const ahora = new Date();

        // ──── KPI 1: Clientes Activos ────
        const totalActivos = await prisma.cliente.count({
            where: { entrenadorId: entrenador.id, activo: true }
        });

        // ──── KPI 2: Flujo de Caja Mensual ────
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const cobrosMes = await prisma.cobro.aggregate({
            _sum: { montoArs: true },
            where: {
                cliente: { entrenadorId: entrenador.id },
                fecha: { gte: inicioMes }
            }
        });
        const flujoCajaMensual = cobrosMes._sum.montoArs || 0;

        // ──── KPI 3: Check-ins en Espera ────
        const checkinsEnEspera = await prisma.checkin.count({
            where: {
                cliente: { entrenadorId: entrenador.id },
                visto: false
            }
        });

        // ──── KPI 4: Planes por Vencer (≤7 días) ────
        const enSieteDias = new Date(ahora);
        enSieteDias.setDate(enSieteDias.getDate() + 7);
        const planesPorVencer = await prisma.planAsignado.count({
            where: {
                cliente: { entrenadorId: entrenador.id, activo: true },
                fechaVencimiento: { gte: ahora, lte: enSieteDias },
                estado: "activo"
            }
        });

        // ──── KPI 5: Formularios en Espera ────
        // Clientes con formulario pero sin plan asignado todavía
        const formulariosEnEspera = await prisma.cliente.count({
            where: {
                entrenadorId: entrenador.id,
                formularioInscripcion: { isNot: null },
                planesAsignados: { none: {} }
            }
        });

        // ──── KPI 6: Mensajes No Leídos ────
        const mensajesNoLeidos = await prisma.mensaje.count({
            where: {
                cliente: { entrenadorId: entrenador.id },
                emisor: "cliente",
                leido: false
            }
        });

        return {
            totalActivos,
            flujoCajaMensual,
            checkinsEnEspera,
            planesPorVencer,
            formulariosEnEspera,
            mensajesNoLeidos
        };
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        return null;
    }
}
