import { prisma } from "@/baseDatos/conexion";

/**
 * Servicio de Cobros — ArchSecure AI
 * Centraliza la lógica financiera y de facturación.
 */
export const CobroServicio = {
    /**
     * Obtiene estadísticas financieras del mes actual para un entrenador específico.
     */
    async obtenerEstadisticasMensuales(entrenadorId: string) {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const cobros = await prisma.cobro.findMany({
            where: {
                cliente: { entrenadorId },
                fecha: { gte: inicioMes }
            }
        });

        const totalMes = cobros.reduce((acc, c) => acc + c.montoArs, 0);
        return {
            totalMes,
            cantidadCobros: cobros.length
        };
    },

    /**
     * Identifica clientes con planes próximos a vencer o vencidos.
     */
    async obtenerVencimientos(entrenadorId: string) {
        const hoy = new Date();
        const limiteVencimiento = new Date();
        limiteVencimiento.setDate(hoy.getDate() + 10); // Miramos 10 días al futuro

        return await prisma.planAsignado.findMany({
            where: {
                cliente: { entrenadorId },
                fechaVencimiento: { lte: limiteVencimiento },
                estado: 'ACTIVO'
            },
            include: {
                cliente: true,
                plan: true,
                cobros: {
                    orderBy: { fecha: 'desc' },
                    take: 1
                }
            },
            orderBy: { fechaVencimiento: 'asc' }
        });
    },

    /**
     * Registra un nuevo cobro vinculado a un plan y cliente.
     */
    async registrarCobro(data: {
        clienteId: string;
        planAsignadoId: string;
        monto: number;
        metodo: string;
        periodoDesde: Date;
        periodoHasta: Date;
    }) {
        return await prisma.cobro.create({
            data: {
                clienteId: data.clienteId,
                planAsignadoId: data.planAsignadoId,
                montoArs: data.monto,
                metodo: data.metodo,
                periodoDesde: data.periodoDesde,
                periodoHasta: data.periodoHasta
            }
        });
    }
};
