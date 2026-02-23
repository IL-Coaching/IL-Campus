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
export async function actualizarCredencialesAdmin(data: { email?: string, password?: string, passwordConfirmacion: string }) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        // 1. Validar identidad
        const passValida = await CriptoServicio.comparePassword(data.passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña de confirmación incorrecta." };

        const updateData: Record<string, unknown> = {};

        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await CriptoServicio.hashPassword(data.password);
        }

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenadorFull.id },
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
    } catch (error) {
        console.error("MFA Start Error:", error);
        return { error: "Error al iniciar configuración MFA. Verifica la conexión." };
    }
}

/**
 * Confirma y activa definitivamente el MFA si el código es correcto.
 */
export async function activarMFA(token: string, secreto: string, passwordConfirmacion: string) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        // 1. Validar identidad
        const passValida = await CriptoServicio.comparePassword(passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña incorrecta." };

        const esValido = MFAServicio.verificarToken(token, secreto);
        if (!esValido) return { error: "Código MFA incorrecto." };

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenadorFull.id },
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
export async function desactivarMFA(passwordConfirmacion: string) {
    try {
        const entrenadorFull = await prisma.entrenador.findUnique({ where: { id: (await getEntrenadorSesion()).id } });
        if (!entrenadorFull) return { error: "Sesión inválida." };

        // 1. Validar identidad
        const passValida = await CriptoServicio.comparePassword(passwordConfirmacion, entrenadorFull.password);
        if (!passValida) return { error: "Contraseña incorrecta." };

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenadorFull.id },
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

import { StorageServicio } from "../servicios/storage.servicio";

/**
 * Actualiza el Avatar del entrenador.
 */
export async function actualizarAvatarAdmin(base64: string) {
    try {
        const entrenador = await getEntrenadorSesion();
        const fileName = `avatares/${entrenador.id}-${Date.now()}.png`;

        const upload = await StorageServicio.subirImagenBase64(base64, fileName);
        if (!upload.success) return { error: upload.error };

        const avatarUrl = upload.url;

        // Persistencia en DB
        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        await accessor.update({
            where: { id: entrenador.id },
            data: { avatarUrl }
        });

        revalidatePath('/entrenador/configuracion');
        return { success: true, avatarUrl };
    } catch (error) {
        console.error("Error avatar:", error);
        return { error: "No se pudo procesar la imagen." };
    }
}

export async function actualizarFotoLanding(base64: string, tipo: 'hero' | 'bio') {
    try {
        const entrenador = await getEntrenadorSesion();
        const fileName = `landing/${tipo}-${entrenador.id}-${Date.now()}.png`;

        const upload = await StorageServicio.subirImagenBase64(base64, fileName);
        if (!upload.success) return { error: upload.error };

        const imageUrl = upload.url;

        const accessor = (prisma.entrenador as unknown) as PrismaUpdateAccessor;
        const updateData: Record<string, string> = {};
        if (tipo === 'hero') updateData.landingHeroUrl = imageUrl!;
        if (tipo === 'bio') updateData.landingBioUrl = imageUrl!;

        await accessor.update({
            where: { id: entrenador.id },
            data: updateData
        });

        revalidatePath('/entrenador/configuracion');
        revalidatePath('/'); // También revalidar la landing
        return { success: true, imageUrl };
    } catch (error) {
        console.error(`Error landing ${tipo}:`, error);
        return { error: "No se pudo procesar la imagen." };
    }
}
