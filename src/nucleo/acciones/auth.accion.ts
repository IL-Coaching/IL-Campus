"use server";

import { redirect } from "next/navigation";

/**
 * Procesa el inicio de sesión del entrenador.
 * Actualmente es una implementación simplificada para la fase de desarrollo,
 * pero estructurada para integrar Supabase Auth fácilmente.
 */
export async function loginEntrenador(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validación básica de campos
    if (!email || !password) {
        return { error: "Por favor, completa todos los campos." };
    }

    // Aquí iría la lógica de: await supabase.auth.signInWithPassword(...)

    // Por ahora, simulamos éxito para tu email de admin
    if (email === "legarretatraining@gmail.com") {
        // En una app final, aquí estableceríamos cookies de sesión
        return { success: true };
    }

    return { error: "Credenciales no válidas para el panel de administración." };
}

export async function logout() {
    // Lógica para limpiar cookies/sesión
    redirect("/entrenador/login");
}
