"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OTP } from 'otplib';

// Instancia global estable de OTP para TOTP (compatible con Vercel/NextJS)
const otp = new OTP({ strategy: 'totp' });

import { prisma } from "@/baseDatos/conexion";
import { CriptoServicio } from "@/nucleo/seguridad/cripto";
import { establecerSesion, cerrarSesion } from "@/nucleo/seguridad/sesion";
import { EsquemaLoginEntrenador, EsquemaLoginAlumno } from "../validadores/auth.validador";

// Función auxiliar para mitigar ataques de tiempo
const delayFallo = () => new Promise(resolve => setTimeout(resolve, 1000));

/**
 * Verifica el límite de peticiones interactuando con la tabla persistente RegistroAutenticacion.
 * @security Prevención contra Brute-Force incluso en edge runtimes.
 */
async function verificarRateLimitPersistente(ip: string): Promise<boolean> {
    try {
        const now = new Date();
        const registro = await prisma.registroAutenticacion.findUnique({ where: { ip } });

        if (!registro) {
            await prisma.registroAutenticacion.create({ data: { ip, intentos: 1 } });
            return true;
        }

        if (registro.bloqueadoHasta && registro.bloqueadoHasta > now) {
            return false;
        }

        const windowMs = 15 * 60 * 1000; // 15 minutos
        if (now.getTime() - registro.ultimoIntento.getTime() > windowMs) {
            // Pasó la ventana de bloqueo, reset
            await prisma.registroAutenticacion.update({
                where: { ip },
                data: { intentos: 1, ultimoIntento: now, bloqueadoHasta: null }
            });
            return true;
        }

        const nuevosIntentos = registro.intentos + 1;
        let bloqueadoHasta = null;
        if (nuevosIntentos >= 10) { // Bloquear por 15min luego de 10 fallos
            bloqueadoHasta = new Date(now.getTime() + windowMs);
        }

        await prisma.registroAutenticacion.update({
            where: { ip },
            data: { intentos: nuevosIntentos, ultimoIntento: now, bloqueadoHasta }
        });

        return nuevosIntentos <= 10;
    } catch (e) {
        console.error("Fallo rate limiter DB, usando bypass de emergencia", e);
        return true;
    }
}

async function resetearRateLimit(ip: string) {
    try {
        await prisma.registroAutenticacion.updateMany({
            where: { ip },
            data: { intentos: 0, bloqueadoHasta: null }
        });
    } catch (e) {
        console.error("Error al resetear rate limiter", e);
    }
}

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
    forcePasswordChange?: boolean;
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

    // 1. Validar esquema
    const validacion = EsquemaLoginEntrenador.safeParse({ email, password });
    if (!validacion.success) {
        return { error: validacion.error.issues[0].message };
    }

    // 2. Rate Limiter Persistente DB
    const head = headers();
    const ip = head.get("x-forwarded-for")?.split(",")[0] || head.get("x-real-ip") || "unknown";
    if (ip !== "unknown") {
        const permitido = await verificarRateLimitPersistente(ip);
        if (!permitido) return { error: "Demasiados intentos fallidos. Intente más tarde." };
    }

    try {
        const entrenadorRaw = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (!entrenadorRaw) {
            await delayFallo();
            return { error: "Credenciales no válidas." };
        }

        const entrenador = entrenadorRaw as unknown as EntrenadorSeguro;

        // Comparar contraseña con el hash almacenado
        const passwordValida = await CriptoServicio.comparePassword(password, entrenador.password);

        if (!passwordValida) {
            await delayFallo();
            return { error: "Credenciales no válidas." };
        }

        // Si el MFA está habilitado
        if (entrenador.mfaEnabled) {
            return { success: true, mfaRequired: true, adminId: entrenador.id };
        }

        await establecerSesion(entrenador.id, "entrenador");
        if (ip !== "unknown") await resetearRateLimit(ip);

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

    // 1. Validar esquema
    const validacion = EsquemaLoginAlumno.safeParse({ email, password });
    if (!validacion.success) {
        return { error: validacion.error.issues[0].message };
    }

    // 2. Rate Limiter Persistente DB
    const head = headers();
    const ip = head.get("x-forwarded-for")?.split(",")[0] || head.get("x-real-ip") || "unknown";
    if (ip !== "unknown") {
        const permitido = await verificarRateLimitPersistente(ip);
        if (!permitido) return { error: "Demasiados intentos fallidos. Intente más tarde." };
    }

    try {
        const clienteRaw = await prisma.cliente.findUnique({
            where: { email }
        });

        if (!clienteRaw || !clienteRaw.password) {
            await delayFallo();
            return { error: "Email o contraseña incorrectos." };
        }

        const cliente = clienteRaw as unknown as ClienteSeguro;

        // Verificar contraseña hasheada
        const passwordValida = await CriptoServicio.comparePassword(password, cliente.password || "");

        if (!passwordValida) {
            await delayFallo();
            return { error: "Email o contraseña incorrectos." };
        }

        if (!cliente.activo) {
            return { error: "Tu cuenta está desactivada." };
        }

        // Si es la primera vez que inicia sesión con el código de activación
        if (cliente.forcePasswordChange) {
            const tempToken = CriptoServicio.generateRandomToken(40);
            const accessor = (prisma.cliente as unknown) as PrismaUpdateRaw;
            await accessor.update({
                where: { id: cliente.id },
                data: {
                    passwordResetToken: tempToken,
                    passwordResetExpires: new Date(Date.now() + 15 * 60000) // Expira en 15 mins
                }
            });

            // Retornamos un estado intermedio en lugar de crear la sesión
            return { success: true, requiereCambioPassword: true, tempToken };
        }

        // Si no requiere cambio, entra normal: Actualizar último login de forma segura
        const accessor = (prisma.cliente as unknown) as PrismaUpdateRaw;
        await accessor.update({
            where: { id: cliente.id },
            data: { lastLogin: new Date() }
        });

        await establecerSesion(cliente.id, "alumno");
        if (ip !== "unknown") await resetearRateLimit(ip);

        return { success: true };
    } catch {
        return { error: "Error de conexión." };
    }
}

/**
 * Recibe el token temporal de activación y la nueva contraseña, la asigna y establece la sesión.
 * USADO SOLO PARA EL FLUJO DE ACTIVACION INICIAL (FORCE PASSWORD CHANGE).
 */
export async function completarForzarPassword(tempToken: string, newPasswordPlana: string) {
    try {
        const accessor = (prisma.cliente as unknown) as {
            findFirst: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown> | null>,
            update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
        };

        const clienteRaw = await accessor.findFirst({
            where: { passwordResetToken: tempToken }
        });

        if (!clienteRaw || !clienteRaw.passwordResetExpires || (clienteRaw.passwordResetExpires as Date) < new Date()) {
            return { error: "La sesión ha expirado. Volvé a ingresar tu código de activación." };
        }

        if (!clienteRaw.forcePasswordChange) {
            return { error: "Esta cuenta no requiere cambio de contraseña." };
        }

        const passwordHash = await CriptoServicio.hashPassword(newPasswordPlana);

        await accessor.update({
            where: { id: clienteRaw.id as string },
            data: {
                password: passwordHash,
                forcePasswordChange: false,
                passwordResetToken: null,
                passwordResetExpires: null,
                lastLogin: new Date()
            }
        });

        await establecerSesion(clienteRaw.id as string, "alumno");
        return { success: true };
    } catch {
        return { error: "Error al cambiar la contraseña." };
    }
}

/**
 * Restablece la contraseña usando un token de recuperación (Olvido su clave).
 */
export async function restablecerPasswordConToken(token: string, newPasswordPlana: string) {
    try {
        const accessor = (prisma.cliente as unknown) as {
            findFirst: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown> | null>,
            update: (args: { where: { id: string }, data: Record<string, unknown> }) => Promise<unknown>
        };

        const clienteRaw = await accessor.findFirst({
            where: { passwordResetToken: token }
        });

        if (!clienteRaw || !clienteRaw.passwordResetExpires || (clienteRaw.passwordResetExpires as Date) < new Date()) {
            return { error: "El link ha expirado o ya fue utilizado." };
        }

        const passwordHash = await CriptoServicio.hashPassword(newPasswordPlana);

        await accessor.update({
            where: { id: clienteRaw.id as string },
            data: {
                password: passwordHash,
                forcePasswordChange: false, // Por las dudas, lo desactivamos si estaba activo
                passwordResetToken: null,
                passwordResetExpires: null,
                lastLogin: new Date()
            }
        });

        await establecerSesion(clienteRaw.id as string, "alumno");
        return { success: true };
    } catch (error) {
        console.error("Error en restablecerPasswordConToken:", error);
        return { error: "No se pudo restablecer la contraseña." };
    }
}

export async function logout() {
    cerrarSesion();
    redirect("/ingresar");
}
