"use server";

import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "../seguridad/cripto";
import { EmailServicio } from "../servicios/email.servicio";

export async function solicitarReseteoPassword(formData: FormData) {
    try {
        const email = formData.get("email") as string;

        if (!email) {
            return { error: "Debes proveer un correo válido." };
        }

        const cliente = await prisma.cliente.findUnique({
            where: { email }
        });

        // Seguridad: Si no existe, no lo delatamos por privacidad. Respondemos OK falsamente.
        if (!cliente || !cliente.activo) {
            return { success: true };
        }

        // 1. Crear un Token de reseteo corto que expira en 30 mins
        const token = CriptoServicio.generateRandomToken(48);
        const expires = new Date(Date.now() + 30 * 60000); // 30 mins

        const accessor = (prisma.cliente as unknown) as {
            update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
        };

        await accessor.update({
            where: { id: cliente.id },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expires
            }
        });

        // 2. Construir link y Enviar Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const urlReseteo = `${baseUrl}/recuperar?token=${token}`;

        const plantillaEmail = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1120; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1E293B;">
                <h2 style="color: #FF5A00; text-transform: uppercase;">Campus Virtual IL-Coaching</h2>
                <p style="font-size: 16px; color: #94A3B8;">Hola ${cliente.nombre},</p>
                <p style="font-size: 16px; color: #94A3B8;">Recientemente pediste resetear tu contraseña para acceder a tu plataforma de entrenamiento.</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${urlReseteo}" style="background-color: #FF5A00; color: #0B1120; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">Restablecer mi Contraseña</a>
                </div>
                <p style="font-size: 14px; color: #64748B;">Este enlace es válido solo por 30 minutos.</p>
                <p style="font-size: 14px; color: #64748B;">Si no solicitaste este cambio, simplemente ignorá este mail.</p>
            </div>
        `;

        await EmailServicio.enviarEmail({
            para: email,
            asunto: "🔑 Restablecé tu contraseña - IL-Campus",
            html: plantillaEmail
        });

        return { success: true };

    } catch (error) {
        console.error("Error al solicitar reseteo:", error);
        return { error: "Ocurrió un error inesperado al procesar tu solicitud." };
    }
}

/**
 * Genera un link de reseteo manualmente para que el entrenador se lo pase al cliente
 * por fuera de email (Ej: WhatsApp).
 */
export async function generarLinkRecuperacionManual(clienteId: string) {
    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }
        });

        if (!cliente || !cliente.activo) {
            return { error: "Cliente no encontrado o inactivo." };
        }

        // 1. Crear Token (más duración, ej 24hs por ser envío manual)
        const token = CriptoServicio.generateRandomToken(48);
        const expires = new Date(Date.now() + 24 * 60 * 60000); // 24 horas

        const accessor = (prisma.cliente as unknown) as {
            update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
        };

        await accessor.update({
            where: { id: cliente.id },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expires
            }
        });

        // 2. Construir link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const urlReseteo = `${baseUrl}/recuperar?token=${token}`;

        return { success: true, link: urlReseteo };
    } catch (error) {
        console.error("Error al generar link manual:", error);
        return { error: "No se pudo generar el link de recuperación." };
    }
}
