"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { MFAServicio } from "@/nucleo/seguridad/mfa";
import { revalidatePath } from "next/cache";

// Tipo auxiliar para evitar el uso de 'any' y satisfacer al linter de producción
type PrismaUpdateAccessor = {
    update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
};

/**
 * Actualiza el perfil del entrenador (Email o Password).
 */
export async function actualizarCredencialesAdmin(data: { email?: string, password?: string }) {
    try {
        const entrenador = await getEntrenadorSesion();
        const updateData: Record<string, unknown> = {};

        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await CriptoServicio.hashPassword(data.password);
        }

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenador.id },
            data: updateData
        });

        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch {
        return { error: "No se pudo actualizar el perfil." };
    }
}

/**
 * Inicia el proceso de activación de MFA.
 * Retorna el QR y el secreto temporal.
 */
export async function iniciarConfiguracionMFA() {
    try {
        const entrenador = await getEntrenadorSesion();
        const secreto = MFAServicio.generarSecreto();
        const uri = MFAServicio.generarURI(entrenador.email, secreto);
        const qr = await MFAServicio.generarQR(uri);

        return { success: true, qr, secreto };
    } catch {
        return { error: "Error al iniciar configuración MFA." };
    }
}

/**
 * Confirma y activa definitivamente el MFA si el código es correcto.
 */
export async function activarMFA(token: string, secreto: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        const esValido = MFAServicio.verificarToken(token, secreto);
        if (!esValido) return { error: "Código incorrecto." };

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenador.id },
            data: {
                mfaSecret: secreto,
                mfaEnabled: true
            }
        });

        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch {
        return { error: "No se pudo activar el MFA." };
    }
}

/**
 * Desactiva el MFA.
 */
export async function desactivarMFA() {
    try {
        const entrenador = await getEntrenadorSesion();
        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenador.id },
            data: {
                mfaSecret: null,
                mfaEnabled: false
            }
        });
        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch {
        return { error: "No se pudo desactivar." };
    }
}
