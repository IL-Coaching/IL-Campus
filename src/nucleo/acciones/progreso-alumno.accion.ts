"use server";

import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

export async function obtenerDatosProgreso() {
    try {
        const cliente = await getAlumnoSesion();

        // Obtener últimos check-ins (últimos 30 días)
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        const checkins = await prisma.checkin.findMany({
            where: {
                clienteId: cliente.id,
                fecha: { gte: hace30Dias }
            },
            orderBy: { fecha: 'desc' }
        });

        // Obtener resultados de testeo
        const resultadosTesteo = await prisma.resultadoTesteo.findMany({
            where: { clienteId: cliente.id },
            orderBy: { fecha: 'desc' },
            take: 10
        });

        // Calcular estadísticas
        const promedioEnergia = checkins.length > 0 
            ? Math.round(checkins.reduce((sum, c) => sum + (c.energia || 0), 0) / checkins.length)
            : 0;

        const promedioSueno = checkins.length > 0
            ? Math.round(checkins.reduce((sum, c) => sum + (c.sueno || 0), 0) / checkins.length)
            : 0;

        const promedioAdherencia = checkins.length > 0
            ? Math.round(checkins.reduce((sum, c) => sum + (c.adherencia || 0), 0) / checkins.length)
            : 0;

        const semanasActivas = Math.ceil((new Date().getTime() - new Date(cliente.fechaAlta).getTime()) / (1000 * 60 * 60 * 24 * 7));

        return {
            exito: true,
            progreso: {
                checkins,
                resultadosTesteo,
                estadisticas: {
                    promedioEnergia,
                    promedioSueno,
                    promedioAdherencia,
                    totalCheckins: checkins.length,
                    semanasActivas,
                    ultimoPeso: checkins[0]?.pesoKg || null
                }
            }
        };
    } catch (error) {
        console.error("Error al obtener datos de progreso:", error);
        return {
            exito: false,
            progreso: {
                checkins: [],
                resultadosTesteo: [],
                estadisticas: {
                    promedioEnergia: 0,
                    promedioSueno: 0,
                    promedioAdherencia: 0,
                    totalCheckins: 0,
                    semanasActivas: 0,
                    ultimoPeso: null
                }
            }
        };
    }
}
