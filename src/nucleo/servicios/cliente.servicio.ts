import { prisma } from "@/baseDatos/conexion";
import { ClientePlanificacion } from "../tipos/planificacion.tipos";

export const ClienteServicio = {
    /**
     * Obtiene todos los clientes vinculados a un entrenador específico.
     */
    async obtenerPorEntrenador(entrenadorId: string) {
        return await prisma.cliente.findMany({
            where: { entrenadorId },
            orderBy: { fechaAlta: "desc" }
        });
    },

    /**
     * Obtiene un cliente específico por su ID con sus relaciones necesarias para planificación.
     */
    async obtenerPorId(id: string): Promise<ClientePlanificacion | null> {
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                planesAsignados: {
                    include: { plan: true },
                    orderBy: { fechaInicio: 'desc' },
                    take: 1
                },
                formularioInscripcion: true
            }
        });

        if (!cliente) return null;

        // Mapeamos para que coincida con el tipo ClientePlanificacion
        return {
            ...cliente,
            plan: cliente.planesAsignados[0]?.plan?.nombre || 'Sin Plan',
            formularioInscripcion: cliente.formularioInscripcion as ClientePlanificacion['formularioInscripcion']
        };
    },

    /**
     * Crea un nuevo cliente después de validar que el email no esté en uso.
     */
    async crear(data: {
        nombre: string;
        email: string;
        telefono?: string;
        entrenadorId: string;
        notas?: string;
    }) {
        const existente = await prisma.cliente.findUnique({
            where: { email: data.email }
        });

        if (existente) {
            throw new Error("Ya existe un cliente registrado con este correo electrónico.");
        }

        return await prisma.cliente.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                password: "temporal-change-me", // Password inicial por defecto
                telefono: data.telefono,
                entrenadorId: data.entrenadorId,
                notas: data.notas,
                activo: true
            }
        });
    },

    /**
     * Cuenta el total de clientes activos.
     */
    async contarTotalActivos() {
        return await prisma.cliente.count({
            where: { activo: true }
        });
    },

    /**
     * Cuenta los clientes registrados en el mes actual.
     */
    async contarNuevosMes() {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        return await prisma.cliente.count({
            where: {
                fechaAlta: {
                    gte: inicioMes
                }
            }
        });
    }
};
