import { prisma } from "@/baseDatos/conexion";

/**
 * Obtiene el ID del entrenador actual.
 * En el futuro, esto consultará a Supabase Auth.
 * Por ahora, devuelve tu cuenta principal de administrador.
 */
export async function getEntrenadorSesion() {
    // Simulamos la recuperación del usuario desde la sesión de Auth
    const emailAdmin = "legarretatraining@gmail.com";

    const entrenador = await prisma.entrenador.findUnique({
        where: { email: emailAdmin }
    });

    if (!entrenador) {
        throw new Error("No hay una sesión activa de entrenador válida.");
    }

    return entrenador;
}
