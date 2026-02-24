import { prisma } from "@/baseDatos/conexion";

/**
 * Servicio de Finanzas — ArchSecure AI
 * Gestión de cobros, planes y estados de cuenta.
 */
export const FinanzasServicio = {
    /**
     * Obtiene el resumen financiero de un cliente.
     */
    async obtenerResumenCliente(clienteId: string) {
        const cobros = await prisma.cobro.findMany({
            where: { clienteId },
            orderBy: { fecha: 'desc' },
            include: { planAsignado: { include: { plan: true } } }
        });

        const planActivo = await prisma.planAsignado.findFirst({
            where: { clienteId, estado: 'ACTIVO' },
            include: { plan: true },
            orderBy: { fechaInicio: 'desc' }
        });

        // Lógica de Estado
        let estado: 'AL_DIA' | 'VENCIDO' | 'SIN_PLAN' = 'SIN_PLAN';
        let diasParaVencer = 0;

        if (planActivo) {
            const hoy = new Date();
            const vencimiento = new Date(planActivo.fechaVencimiento);

            if (hoy > vencimiento) {
                estado = 'VENCIDO';
            } else {
                estado = 'AL_DIA';
                diasParaVencer = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            }
        }

        return {
            cobros,
            planActivo,
            estado,
            diasParaVencer
        };
    },

    /**
     * Registra un nuevo cobro para un cliente.
     */
    async registrarCobro(data: {
        clienteId: string;
        monto: number;
        metodo: string;
        planAsignadoId?: string;
        notas?: string;
        periodoDesde?: Date;
        periodoHasta?: Date;
    }) {
        const cobro = await prisma.cobro.create({
            data: {
                clienteId: data.clienteId,
                montoArs: data.monto,
                metodo: data.metodo,
                planAsignadoId: data.planAsignadoId,
                notas: data.notas,
                periodoDesde: data.periodoDesde || new Date(),
                periodoHasta: data.periodoHasta || new Date(),
            }
        });

        return cobro;
    }
};
