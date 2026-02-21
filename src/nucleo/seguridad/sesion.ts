import { prisma } from "@/baseDatos/conexion";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Obtiene el entrenador actual basado en la sesión de cookies.
 * Si no hay sesión válida, redirige al login.
 */
export async function getEntrenadorSesion() {
    const sessionId = cookies().get("session_id")?.value;
    const role = cookies().get("user_role")?.value;

    if (!sessionId || role !== "entrenador") {
        redirect("/entrenador/login");
    }

    const entrenador = await prisma.entrenador.findUnique({
        where: { id: sessionId }
    });

    if (!entrenador) {
        redirect("/entrenador/login");
    }

    return entrenador;
}

/**
 * Obtiene el cliente actual basado en la sesión de cookies.
 */
export async function getAlumnoSesion() {
    const sessionId = cookies().get("session_id")?.value;
    const role = cookies().get("user_role")?.value;

    if (!sessionId || role !== "alumno") {
        redirect("/alumno/login");
    }

    const cliente = await prisma.cliente.findUnique({
        where: { id: sessionId }
    });

    if (!cliente) {
        redirect("/alumno/login");
    }

    return cliente;
}
