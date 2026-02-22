"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { MFAServicio } from "@/nucleo/seguridad/mfa";
import { revalidatePath } from "next/cache";

/**
 * Actualiza el perfil del entrenador (Email o Password).
 */
export async function actualizarCredencialesAdmin(data: { email?: string, password?: string }) {
    try {
        const entrenador = await getEntrenadorSesion();
        const updateData: any = {};

        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await CriptoServicio.hashPassword(data.password);
        }

        await prisma.entrenador.update({
            where: { id: entrenador.id },
            data: updateData
        });

        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch (error) {
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
    } catch (error) {
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

        await prisma.entrenador.update({
            where: { id: entrenador.id },
            data: {
                mfaSecret: secreto, // Ahora guardamos el secreto real
                mfaEnabled: true
            }
        });

        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch (error) {
        return { error: "No se pudo activar el MFA." };
    }
}

/**
 * Desactiva el MFA.
 */
export async function desactivarMFA() {
    try {
        const entrenador = await getEntrenadorSesion();
        await prisma.entrenador.update({
            where: { id: entrenador.id },
            data: {
                mfaSecret: null,
                mfaEnabled: false
            }
        });
        revalidatePath('/entrenador/configuracion');
        return { success: true };
    } catch (error) {
        return { error: "No se pudo desactivar." };
    }
}
