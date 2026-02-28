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
                cliente: { entrenadorId, esVIP: false },
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
        return await prisma.planAsignado.findMany({
            where: {
                cliente: { entrenadorId: entrenadorId, activo: true, esVIP: false },
                estado: "ACTIVO",
                // Removemos la restricción de fechaInicio <= hoy para poder mostrar Próximos Inicios
            },
            include: {
                cliente: {
                    include: {
                        planesAsignados: {
                            orderBy: { fechaInicio: 'desc' },
                            take: 1,
                            include: { plan: true }
                        },
                        // Incluir TODOS los cobros del cliente (no solo los del planAsignado)
                        // para que el historial no quede vacío cuando planAsignadoId es null
                        cobros: {
                            orderBy: { fecha: 'desc' }
                        }
                    }
                },
                plan: true,
                cobros: {
                    orderBy: { fecha: 'desc' }
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
        comprobanteUrl?: string; // ADDED
    }) {
        return await prisma.cobro.create({
            data: {
                clienteId: data.clienteId,
                planAsignadoId: data.planAsignadoId,
                montoArs: data.monto,
                metodo: data.metodo,
                periodoDesde: data.periodoDesde,
                periodoHasta: data.periodoHasta,
                comprobanteUrl: data.comprobanteUrl
            }
        });
    },

    /**
     * Anula (elimina) un cobro específico si pertenece a un cliente del entrenador.
     */
    async anularCobro(cobroId: string, entrenadorId: string) {
        const cobro = await prisma.cobro.findUnique({
            where: { id: cobroId },
            include: { cliente: true }
        });

        if (!cobro || cobro.cliente.entrenadorId !== entrenadorId) {
            throw new Error("No tienes permiso para anular este cobro o no existe.");
        }

        return await prisma.cobro.delete({
            where: { id: cobroId }
        });
    }
};
