"use server";

import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";

export async function obtenerDatosMembresia() {
    try {
        const cliente = await getAlumnoSesion();

        // Obtener planes asignados
        const planes = await prisma.planAsignado.findMany({
            where: { clienteId: cliente.id },
            include: {
                plan: true
            },
            orderBy: { fechaInicio: 'desc' }
        });

        // Obtener cobros
        const cobros = await prisma.cobro.findMany({
            where: { clienteId: cliente.id },
            orderBy: { fecha: 'desc' },
            take: 10
        });

        // Calcular estado
        const planActivo = planes.find(p => p.estado === 'ACTIVO');
        let diasRestantes = 0;
        let estado = 'sin_plan';
        
        if (planActivo && planActivo.fechaVencimiento) {
            const hoy = new Date();
            const vencimiento = new Date(planActivo.fechaVencimiento);
            const diffTime = vencimiento.getTime() - hoy.getTime();
            diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diasRestantes > 0) {
                estado = 'ACTIVO';
            } else {
                estado = 'VENCIDO';
            }
        }

        return {
            exito: true,
            membresia: {
                planActual: planActivo ? {
                    nombre: planActivo.plan.nombre,
                    precio: planActivo.plan.precio,
                    fechaInicio: planActivo.fechaInicio,
                    fechaVencimiento: planActivo.fechaVencimiento,
                    diasRestantes,
                    estado
                } : null,
                historialPlanes: planes,
                cobrosRecientes: cobros
            }
        };
    } catch (error) {
        console.error("Error al obtener membresía:", error);
        return {
            exito: false,
            membresia: {
                planActual: null,
                historialPlanes: [],
                cobrosRecientes: []
            }
        };
    }
}
