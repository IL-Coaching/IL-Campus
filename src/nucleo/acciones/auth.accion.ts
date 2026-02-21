"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/baseDatos/conexion";
import { cookies } from "next/headers";

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
        const entrenador = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (!entrenador || entrenador.password !== password) {
            // NOTA: En producción deberíamos usar bcrypt.compare
            return { error: "Credenciales no válidas." };
        }

        // Crear sesión (Cookie)
        cookies().set("session_id", entrenador.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        cookies().set("user_role", "entrenador", { path: "/" });

        return { success: true };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error de conexión con la base de datos." };
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

        if (!cliente || cliente.password !== password) {
            return { error: "Email o contraseña incorrectos." };
        }

        if (!cliente.activo) {
            return { error: "Tu cuenta está desactivada. Contacta a tu entrenador." };
        }

        // Crear sesión (Cookie)
        cookies().set("session_id", cliente.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });

        cookies().set("user_role", "alumno", { path: "/" });

        return { success: true };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error de conexión." };
    }
}

export async function logout() {
    cookies().delete("session_id");
    cookies().delete("user_role");
    redirect("/ingresar");
}
