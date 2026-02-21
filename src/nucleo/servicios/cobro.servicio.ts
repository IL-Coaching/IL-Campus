import { prisma } from "@/baseDatos/conexion";

/**
 * Servicio de Cobros — ArchSecure AI
 * Centraliza la lógica financiera y de facturación.
 */
export const CobroServicio = {
    /**
     * Obtiene estadísticas financieras del mes actual.
     */
    async obtenerEstadisticasMensuales() {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const cobros = await prisma.cobro.findMany({
            where: {
                fecha: {
                    gte: inicioMes
                }
            }
        });

        const totalMes = cobros.reduce((acc, c) => acc + c.montoArs, 0);
        const ticketPromedio = cobros.length > 0 ? totalMes / cobros.length : 0;

        return {
            totalMes,
            ticketPromedio,
            cantidadCobros: cobros.length
        };
    },

    /**
     * Identifica clientes con planes próximos a vencer o vencidos sin cobro registrado.
     * Para este MVP, simplificamos: clientes activos cuyo PlanAsignado vence en los próximos 7 días o ya venció.
     */
    async obtenerPendientes() {
        const hoy = new Date();
        const proximaSemana = new Date();
        proximaSemana.setDate(hoy.getDate() + 7);

        const pendientes = await prisma.planAsignado.findMany({
            where: {
                fechaVencimiento: {
                    lte: proximaSemana
                },
                estado: 'activo'
            },
            include: {
                cliente: true
            },
            take: 5
        });

        return pendientes.map(p => ({
            id: p.id,
            clienteNombre: p.cliente.nombre,
            fechaVencimiento: p.fechaVencimiento
        }));
    },

    /**
     * Obtiene los últimos cobros registrados.
     */
    async obtenerUltimosCobros(limit = 10) {
        return await prisma.cobro.findMany({
            include: {
                cliente: true
            },
            orderBy: {
                fecha: 'desc'
            },
            take: limit
        });
    }
};
