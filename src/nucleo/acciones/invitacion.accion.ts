"use server";

import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { getEntrenadorSesion, establecerSesion } from "@/nucleo/seguridad/sesion";

/**
 * Genera un token de invitación profesional para un nuevo cliente.
 */
export async function generarInvitacion(clienteId: string) {
    try {
        await getEntrenadorSesion();

        const token = CriptoServicio.generateRandomToken(48);
        const expiracion = new Date();
        expiracion.setHours(expiracion.getHours() + 48); // Expira en 48 horas

        await prisma.cliente.update({
            where: { id: clienteId },
            data: {
                invitationToken: token,
                invitationExpires: expiracion
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return {
            success: true,
            link: `${baseUrl}/registro?token=${token}`
        };
    } catch (error) {
        console.error(error);
        return { error: "No se pudo generar la invitación." };
    }
}

/**
 * Valida si un token de invitación es legítimo y vigente.
 */
export async function validarInvitacion(token: string) {
    const cliente = await prisma.cliente.findFirst({
        where: {
            invitationToken: token,
            invitationExpires: { gt: new Date() }
        }
    });

    if (!cliente) return { error: "El link de invitación es inválido o ha expirado." };

    return {
        success: true,
        email: cliente.email,
        nombre: cliente.nombre
    };
}

/**
 * Completa el alta del cliente, hasheando su clave y activando la cuenta.
 */
export async function completarAlta(token: string, passwordPlana: string) {
    try {
        const cliente = await prisma.cliente.findFirst({
            where: {
                invitationToken: token,
                invitationExpires: { gt: new Date() }
            }
        });

        if (!cliente) throw new Error("Invitación no válida.");

        const passwordHash = await CriptoServicio.hashPassword(passwordPlana);

        await prisma.cliente.update({
            where: { id: cliente.id },
            data: {
                password: passwordHash,
                invitationToken: null,
                invitationExpires: null,
                activo: true,
                lastLogin: new Date()
            }
        });

        await establecerSesion(cliente.id, "alumno");

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Error al completar el alta." };
    }
}
