"use server";

import { headers } from "next/headers";
import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "../seguridad/cripto";
import { EmailServicio } from "../servicios/email.servicio";

/**
 * Construye la URL base de la app de forma confiable en el contexto de Next.js.
 * Prioriza el header 'origin', cae a variables de entorno y termina en localhost.
 * @returns URL base sin barra al final (ej: https://il-campus.vercel.app)
 */
async function obtenerUrlBase(): Promise<string> {
    const headersList = headers();
    const origin = headersList.get('origin');
    const host = headersList.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';

    return (
        origin ||
        (host ? `${protocol}://${host}` : null) ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        'http://localhost:3000'
    );
}

/**
 * Tipo auxiliar para actualizar campos dinámicos del cliente sin exponer la API
 * completa de Prisma. Requerido por limitaciones de inferencia de tipos de Prisma + Next.js.
 */
type ActualizarCliente = {
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
};

const actualizarCliente = (prisma.cliente as unknown as ActualizarCliente).update.bind(prisma.cliente);

/**
 * Envía un email de reseteo de contraseña al cliente.
 * Por seguridad, si el email no existe o la cuenta está inactiva, retorna éxito igual (no delatar).
 */
export async function solicitarReseteoPassword(formData: FormData) {
    try {
        const email = formData.get("email") as string;

        if (!email) {
            return { error: "Debes proveer un correo válido." };
        }

        const cliente = await prisma.cliente.findUnique({ where: { email } });

        // Seguridad: no revelar si el email existe o no
        if (!cliente || !cliente.activo) {
            return { success: true };
        }

        const token = CriptoServicio.generateRandomToken(48);
        const expires = new Date(Date.now() + 30 * 60000); // 30 minutos

        await actualizarCliente({
            where: { id: cliente.id },
            data: { passwordResetToken: token, passwordResetExpires: expires }
        });

        const baseUrl = await obtenerUrlBase();
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
 * Genera un link de reseteo manualmente para que el entrenador se lo comparta
 * al cliente por fuera del email (ej: WhatsApp). Expira en 24 horas.
 */
export async function generarLinkRecuperacionManual(clienteId: string) {
    try {
        const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });

        if (!cliente || !cliente.activo) {
            return { error: "Cliente no encontrado o inactivo." };
        }

        const token = CriptoServicio.generateRandomToken(48);
        const expires = new Date(Date.now() + 24 * 60 * 60000); // 24 horas

        await actualizarCliente({
            where: { id: cliente.id },
            data: { passwordResetToken: token, passwordResetExpires: expires }
        });

        const baseUrl = await obtenerUrlBase();
        const urlReseteo = `${baseUrl}/recuperar?token=${token}`;

        return { success: true, link: urlReseteo };
    } catch (error) {
        console.error("Error al generar link manual:", error);
        return { error: "No se pudo generar el link de recuperación." };
    }
}
