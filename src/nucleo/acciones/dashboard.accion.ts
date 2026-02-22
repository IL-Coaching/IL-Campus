"use server"

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";

export async function obtenerMetricasDashboard() {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Clientes Activos (que tienen un plan activo y la cuenta activa)
        const totalActivos = await prisma.cliente.count({
            where: {
                entrenadorId: entrenador.id,
                activo: true
            }
        });

        // Simulación: Nuevos clientes este mes (como en ClienteServicio, podríamos filtrarlo)
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const nuevosMes = await prisma.cliente.count({
            where: {
                entrenadorId: entrenador.id,
                fechaAlta: { gte: inicioMes }
            }
        });

        // 2. Ingresos Estimados (Suma total de cobros del mes actual, o estimado)
        const cobrosMes = await prisma.cobro.aggregate({
            _sum: {
                montoArs: true
            },
            where: {
                cliente: {
                    entrenadorId: entrenador.id
                },
                fecha: { gte: inicioMes }
            }
        });
        const ingresosEstimados = cobrosMes._sum.montoArs || 0;

        // 3. Check-ins Pendientes (Check-ins recientes no "revisados", asumiendo últimos 7 días como pendientes de revisión si tuvieran flag, o simplemente el conteo de esta semana)
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - 7);
        const checkinsRecientes = await prisma.checkin.findMany({
            where: {
                cliente: {
                    entrenadorId: entrenador.id
                },
                fecha: { gte: inicioSemana }
            },
            include: {
                cliente: { select: { nombre: true, id: true } }
            },
            orderBy: { fecha: 'desc' },
            take: 5
        });

        // 4. Alertas (Por ejemplo, planes vencidos no renovados, o formularios no completados)
        const planesVencidos = await prisma.planAsignado.findMany({
            where: {
                cliente: { entrenadorId: entrenador.id, activo: true },
                fechaVencimiento: { lt: new Date() }
            },
            include: {
                cliente: { select: { nombre: true, id: true } },
                plan: { select: { nombre: true } }
            },
            orderBy: { fechaVencimiento: 'desc' }
        });

        const clientesSinPlan = await prisma.cliente.findMany({
            where: {
                entrenadorId: entrenador.id,
                activo: true,
                planesAsignados: { none: {} },
                formularioInscripcion: { isNot: null } // Si llenaron el form
            },
            select: { id: true, nombre: true }
        });

        // Combinamos actividad reciente (Check-ins + Alta de Clientes recientes + Cobros)
        const ultimosCobros = await prisma.cobro.findMany({
            where: { cliente: { entrenadorId: entrenador.id } },
            include: { cliente: { select: { nombre: true } } },
            orderBy: { fecha: 'desc' },
            take: 3
        });

        const actividad = [
            ...checkinsRecientes.map(c => ({ tipo: 'checkin', fecha: c.fecha, texto: `${c.cliente.nombre} subió su Check-in semanal.` })),
            ...planesVencidos.slice(0, 3).map(p => ({ tipo: 'alerta', fecha: p.fechaVencimiento, texto: `El plan de ${p.cliente.nombre} se ha vencido.` })),
            ...ultimosCobros.map(c => ({ tipo: 'cobro', fecha: c.fecha, texto: `Pago registrado de ${c.cliente.nombre} ($${c.montoArs}).` }))
        ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 10);

        return {
            totalActivos: totalActivos, // Reutilizando la métrica ya mostrada
            nuevosMes,
            ingresosMes: ingresosEstimados,
            checkinsPendientes: checkinsRecientes.length,
            alertasOperativas: planesVencidos.length + clientesSinPlan.length,
            detallesAlertas: {
                vencidos: planesVencidos,
                sinPlan: clientesSinPlan
            },
            actividadReciente: actividad
        };
    } catch (error) {
        console.error("Error cargando dashboard", error);
        return null;
    }
}
