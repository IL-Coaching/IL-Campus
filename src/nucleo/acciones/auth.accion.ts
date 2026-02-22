"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { establecerSesion, cerrarSesion } from "@/nucleo/seguridad/sesion";

/**
 * Procesa el inicio de sesión del entrenador.
 * Soporta autenticación de primer paso y verificación MFA de segundo paso.
 */
export async function loginEntrenador(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Por favor, completa todos los campos." };
    }

    try {
        const entrenador = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (!entrenador) {
            return { error: "Credenciales no válidas." };
        }

        // Comparar contraseña con el hash almacenado
        const passwordValida = await CriptoServicio.comparePassword(password, entrenador.password);

        if (!passwordValida) {
            return { error: "Credenciales no válidas." };
        }

        // Si el MFA está habilitado, no iniciamos sesión aún.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((entrenador as any).mfaEnabled) {
            return { success: true, mfaRequired: true, adminId: entrenador.id };
        }

        // Establecer sesión segura con JWT y HttpOnly Cookies
        await establecerSesion(entrenador.id, "entrenador");

        return { success: true };
    } catch {
        console.error("Login Error");
        return { error: "Error de conexión con la base de datos." };
    }
}

/**
 * Verifica el código MFA para completar el login del admin.
 */
export async function verificarMFALogin(adminId: string, token: string) {
    try {
        const entrenador = await prisma.entrenador.findUnique({
            where: { id: adminId }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!entrenador || !(entrenador as any).mfaSecret) {
            return { error: "Acceso denegado o MFA no configurado." };
        }

        const { MFAServicio } = await import("@/nucleo/seguridad/mfa");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const esValido = MFAServicio.verificarToken(token, (entrenador as any).mfaSecret);

        if (!esValido) {
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
        const cliente = await prisma.cliente.findUnique({
            where: { email }
        });

        if (!cliente || !cliente.password) {
            return { error: "Email o contraseña incorrectos." };
        }

        // Verificar contraseña hasheada
        const passwordValida = await CriptoServicio.comparePassword(password, cliente.password);

        if (!passwordValida) {
            return { error: "Email o contraseña incorrectos." };
        }

        if (!cliente.activo) {
            return { error: "Tu cuenta está desactivada. Contacta a tu entrenador." };
        }

        // Actualizar último login
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.cliente as any).update({
            where: { id: cliente.id },
            data: { lastLogin: new Date() }
        });

        // Establecer sesión segura
        await establecerSesion(cliente.id, "alumno");

        return { success: true };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error de conexión." };
    }
}

export async function logout() {
    cerrarSesion();
    redirect("/ingresar");
}
