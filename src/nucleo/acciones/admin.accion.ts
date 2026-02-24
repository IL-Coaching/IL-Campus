"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { MFAServicio } from "@/nucleo/seguridad/mfa";
import { StorageServicio } from "../servicios/storage.servicio";
import { revalidatePath } from "next/cache";

/**
 * Tipo auxiliar para actualizar campos dinámicos del entrenador sin exponer
 * la API completa de Prisma. Permite pasar Record<string, unknown> como data.
 * @security Siempre validar que el entrenador sea el mismo que está en sesión antes de llamar.
 */
type ActualizarEntrenador = {
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
};

/** Shortcut tipado para actualizar el entrenador con datos dinámicos. */
const actualizarEntrenador = (prisma.entrenador as unknown as ActualizarEntrenador).update.bind(prisma.entrenador);

/**
 * Actualiza las credenciales del entrenador (Email o Password).
 * Requiere la contraseña actual como confirmación de identidad.
 */
export async function actualizarCredencialesAdmin(data: { email?: string, password?: string, passwordConfirmacion: string }) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        const passValida = await CriptoServicio.comparePassword(data.passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña de confirmación incorrecta." };

        const updateData: Record<string, unknown> = {};
        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await CriptoServicio.hashPassword(data.password);
        }

        await actualizarEntrenador({ where: { id: entrenadorFull.id }, data: updateData });

        revalidatePath('/entrenador/cuenta');
        return { success: true };
    } catch {
        return { error: "No se pudo actualizar el perfil." };
    }
}

/**
 * Inicia el proceso de activación de MFA.
 * Retorna el QR y el secreto temporal para que el usuario configure su app autenticadora.
 */
export async function iniciarConfiguracionMFA() {
    try {
        const entrenador = await getEntrenadorSesion();
        const secreto = MFAServicio.generarSecreto();
        const uri = MFAServicio.generarURI(entrenador.email, secreto);
        const qr = await MFAServicio.generarQR(uri);

        return { success: true, qr, secreto };
    } catch (error) {
        console.error("MFA Start Error:", error);
        return { error: "Error al iniciar configuración MFA. Verifica la conexión." };
    }
}

/**
 * Confirma y activa definitivamente el MFA si el código TOTP es correcto.
 * Requiere confirmación de identidad con contraseña actual.
 */
export async function activarMFA(token: string, secreto: string, passwordConfirmacion: string) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        const passValida = await CriptoServicio.comparePassword(passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña incorrecta." };

        const esValido = MFAServicio.verificarToken(token, secreto);
        if (!esValido) return { error: "Código MFA incorrecto." };

        await actualizarEntrenador({
            where: { id: entrenadorFull.id },
            data: { mfaSecret: secreto, mfaEnabled: true }
        });

        revalidatePath('/entrenador/cuenta');
        return { success: true };
    } catch {
        return { error: "No se pudo activar el MFA." };
    }
}

/**
 * Desactiva el MFA del entrenador.
 * Requiere confirmación de identidad con contraseña actual.
 */
export async function desactivarMFA(passwordConfirmacion: string) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        const passValida = await CriptoServicio.comparePassword(passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña incorrecta." };

        await actualizarEntrenador({
            where: { id: entrenadorFull.id },
            data: { mfaSecret: null, mfaEnabled: false }
        });

        revalidatePath('/entrenador/cuenta');
        return { success: true };
    } catch {
        return { error: "No se pudo desactivar." };
    }
}

/**
 * Actualiza el avatar del entrenador subiendo la imagen a Supabase Storage.
 */
export async function actualizarAvatarAdmin(base64: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const fileName = `avatares/${entrenador.id}-${Date.now()}.png`;

        const upload = await StorageServicio.subirImagenBase64(base64, fileName);
        if (!upload.success) return { error: upload.error };

        await actualizarEntrenador({
            where: { id: entrenador.id },
            data: { avatarUrl: upload.url }
        });

        revalidatePath('/entrenador/cuenta');
        return { success: true, avatarUrl: upload.url };
    } catch (error) {
        console.error("Error avatar:", error);
        return { error: "No se pudo procesar la imagen." };
    }
}

