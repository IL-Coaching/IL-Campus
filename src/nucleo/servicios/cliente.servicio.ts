import { prisma } from "@/baseDatos/conexion";
import { ClientePlanificacion } from "../tipos/planificacion.tipos";

export const ClienteServicio = {
    /**
     * Obtiene todos los clientes vinculados a un entrenador específico.
     */
    async obtenerPorEntrenador(entrenadorId: string) {
        return await prisma.cliente.findMany({
            where: { entrenadorId },
            include: {
                planesAsignados: {
                    include: { plan: true },
                    orderBy: { fechaInicio: 'desc' },
                    take: 1
                },
                formularioInscripcion: {
                    select: { id: true }
                }
            },
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
                formularioInscripcion: true,
                cicloMenstrual: true
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

        // 1. Generar Código Único de Activación Seguro
        const randomStr1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomStr2 = Math.random().toString(36).substring(2, 5).toUpperCase();
        const codigoActivacion = `IL-${randomStr1}-${randomStr2}`;

        // 2. Importar el CriptoServicio para hashearlo
        const { CriptoServicio } = await import('@/nucleo/seguridad/cripto');
        const hash = await CriptoServicio.hashPassword(codigoActivacion);

        const cliente = await prisma.cliente.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                password: hash, // Guardamos SÓLO el hash, nunca en claro
                telefono: data.telefono,
                entrenadorId: data.entrenadorId,
                notas: data.notas,
                activo: true,
                forcePasswordChange: true // Obligamos a elegir una clave definitiva al entrar
            }
        });

        // 3. Devolvemos el código en claro SÓLO esta vez para la UI del creador
        return { ...cliente, codigoActivacion };
    },

    /**
     * Crea un cliente en estado prospecto (sin password) junto con su formulario de inscripción.
     */
    async crearProspectoConFormulario(data: {
        nombre: string;
        email: string;
        telefono: string;
        entrenadorId: string;
        formulario: Record<string, unknown>;
    }) {
        const existente = await prisma.cliente.findUnique({
            where: { email: data.email }
        });

        if (existente) {
            // Si ya existe, actualizamos su formulario en lugar de crear uno nuevo error
            return await prisma.cliente.update({
                where: { email: data.email },
                data: {
                    nombre: data.nombre,
                    telefono: data.telefono,
                    formularioInscripcion: {
                        upsert: {
                            create: data.formulario,
                            update: data.formulario
                        }
                    }
                }
            });
        }

        return await prisma.cliente.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                telefono: data.telefono,
                entrenadorId: data.entrenadorId,
                activo: false, // Es un prospecto hasta que el coach lo active
                formularioInscripcion: {
                    create: data.formulario
                }
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
    },

    /**
     * Asigna un plan a un cliente, calculando el vencimiento y activando su cuenta.
     * Si el cliente no tiene contraseña (prospecto de landing), genera una temporal.
     */
    async asignarPlan(data: { clienteId: string; planId: string; fechaInicio: Date }) {
        const plan = await prisma.plan.findUnique({
            where: { id: data.planId }
        });

        if (!plan) throw new Error("El plan seleccionado no existe.");

        const cliente = await prisma.cliente.findUnique({
            where: { id: data.clienteId },
            select: { id: true, password: true }
        });

        if (!cliente) throw new Error("Cliente no encontrado.");

        const fechaVencimiento = new Date(data.fechaInicio);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + plan.duracionDias);

        let codigoActivacion: string | undefined = undefined;
        const updates: Partial<import("@prisma/client").Cliente> = { activo: true };

        // Si no tiene password, generamos la temporal (Protocolo IL-Campus)
        if (!cliente.password) {
            const randomStr1 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const randomStr2 = Math.random().toString(36).substring(2, 5).toUpperCase();
            codigoActivacion = `IL-${randomStr1}-${randomStr2}`;

            const { CriptoServicio } = await import('@/nucleo/seguridad/cripto');
            updates.password = await CriptoServicio.hashPassword(codigoActivacion);
            updates.forcePasswordChange = true;
        }

        await prisma.$transaction([
            // 1. Crear la asignación del plan
            prisma.planAsignado.create({
                data: {
                    clienteId: data.clienteId,
                    planId: data.planId,
                    fechaInicio: data.fechaInicio,
                    fechaVencimiento: fechaVencimiento,
                    estado: "ACTIVO"
                }
            }),
            // 2. Actualizar estado y credenciales si aplica
            prisma.cliente.update({
                where: { id: data.clienteId },
                data: updates
            })
        ]);

        return { success: true, codigoActivacion };
    }
};
