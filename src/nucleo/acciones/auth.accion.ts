"use server";

import { redirect } from "next/navigation";
import { OTP } from 'otplib';

// Instancia global estable de OTP para TOTP (compatible con Vercel/NextJS)
const otp = new OTP({ strategy: 'totp' });

import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { establecerSesion, cerrarSesion } from "@/nucleo/seguridad/sesion";

// Tipado para Prisma dinámico sin 'any'
type PrismaUpdateRaw = {
    update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
};

interface EntrenadorSeguro {
    id: string;
    password: string;
    mfaEnabled: boolean;
    mfaSecret: string | null;
}

interface ClienteSeguro {
    id: string;
    password?: string | null;
    activo: boolean;
    lastLogin?: Date | null;
}

/**
 * Procesa el inicio de sesión del entrenador.
 */
export async function loginEntrenador(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Por favor, completa todos los campos." };
    }

    try {
        const entrenadorRaw = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (!entrenadorRaw) {
            return { error: "Credenciales no válidas." };
        }

        const entrenador = entrenadorRaw as unknown as EntrenadorSeguro;

        // Comparar contraseña con el hash almacenado
        const passwordValida = await CriptoServicio.comparePassword(password, entrenador.password);

        if (!passwordValida) {
            return { error: "Credenciales no válidas." };
        }

        // Si el MFA está habilitado
        if (entrenador.mfaEnabled) {
            return { success: true, mfaRequired: true, adminId: entrenador.id };
        }

        await establecerSesion(entrenador.id, "entrenador");
        return { success: true };
    } catch {
        return { error: "Error de conexión con la base de datos." };
    }
}

/**
 * Verifica el código MFA para completar el login del admin.
 */
export async function verificarMFALogin(adminId: string, token: string) {
    try {
        const entrenadorRaw = await prisma.entrenador.findUnique({
            where: { id: adminId }
        });

        if (!entrenadorRaw) return { error: "Usuario no encontrado." };

        const entrenador = entrenadorRaw as unknown as EntrenadorSeguro;

        if (!entrenador.mfaSecret) {
            return { error: "MFA no configurado." };
        }

        const result = otp.verifySync({ token, secret: entrenador.mfaSecret });

        if (!result.valid) {
            return { error: "Código incorrecto." };
        }

        await establecerSesion(entrenador.id, "entrenador");
        return { success: true };
    } catch {
        return { error: "Error en la verificación." };
    }
}

/**
 * Procesa el inicio de sesión del alumno.
 */
export async function loginAlumno(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Por favor, completa todos los campos." };
    }

    try {
        const clienteRaw = await prisma.cliente.findUnique({
            where: { email }
        });

        if (!clienteRaw || !clienteRaw.password) {
            return { error: "Email o contraseña incorrectos." };
        }

        const cliente = clienteRaw as unknown as ClienteSeguro;

        // Verificar contraseña hasheada
        const passwordValida = await CriptoServicio.comparePassword(password, cliente.password || "");

        if (!passwordValida) {
            return { error: "Email o contraseña incorrectos." };
        }

        if (!cliente.activo) {
            return { error: "Tu cuenta está desactivada." };
        }

        // Actualizar último login de forma segura
        const accessor = (prisma.cliente as unknown) as PrismaUpdateRaw;
        await accessor.update({
            where: { id: cliente.id },
            data: { lastLogin: new Date() }
        });

        await establecerSesion(cliente.id, "alumno");
        return { success: true };
    } catch {
        return { error: "Error de conexión." };
    }
}

export async function logout() {
    cerrarSesion();
    redirect("/ingresar");
}
