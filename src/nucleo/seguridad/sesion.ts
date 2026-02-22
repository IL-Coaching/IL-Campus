import { prisma } from "@/baseDatos/conexion";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JWT } from "./jwt";

/**
 * Obtiene el entrenador actual basado en la sesión de JWT.
 * Mitiga ataques de sesión mediante firma criptográfica.
 */
export async function getEntrenadorSesion() {
    const token = cookies().get("session_token")?.value;

    if (!token) {
        redirect("/entrenador/login");
    }

    const payload = await JWT.verify(token);

    if (!payload || payload.role !== "entrenador") {
        redirect("/entrenador/login");
    }

    const entrenador = await prisma.entrenador.findUnique({
        where: { id: payload.id }
    });

    if (!entrenador) {
        redirect("/entrenador/login");
    }

    return entrenador;
}

/**
 * Obtiene el cliente actual basado en la sesión de JWT.
 */
export async function getAlumnoSesion() {
    const token = cookies().get("session_token")?.value;

    if (!token) {
        redirect("/alumno/login");
    }

    const payload = await JWT.verify(token);

    if (!payload || payload.role !== "alumno") {
        redirect("/alumno/login");
    }

    const cliente = await prisma.cliente.findUnique({
        where: { id: payload.id }
    });

    if (!cliente) {
        redirect("/alumno/login");
    }

    return cliente;
}

/**
 * Establece una sesión segura mediante cookies blindadas.
 */
export async function establecerSesion(id: string, role: 'entrenador' | 'alumno') {
    const token = await JWT.sign({ id, role });

    cookies().set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: "/",
    });
}

/**
 * Elimina la sesión actual.
 */
export function cerrarSesion() {
    cookies().delete("session_token");
}
