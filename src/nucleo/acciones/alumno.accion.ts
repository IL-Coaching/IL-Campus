"use server";

import { prisma } from "@/baseDatos/conexion";
import { getAlumnoSesion } from "../seguridad/sesion";
import { CriptoServicio } from "../seguridad/cripto";
import { revalidatePath } from "next/cache";

/**
 * Actualiza los datos básicos del perfil del alumno
 */
export async function actualizarPerfilAlumno(formData: FormData) {
    try {
        const alumno = await getAlumnoSesion();

        const nombre = formData.get("nombre") as string;
        const telefono = formData.get("telefono") as string;

        if (!nombre) {
            return { error: "El nombre es obligatorio." };
        }

        await prisma.cliente.update({
            where: { id: alumno.id },
            data: {
                nombre,
                telefono
            }
        });

        revalidatePath("/alumno/perfil");
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return { error: "No se pudo actualizar el perfil." };
    }
}

/**
 * Cambia la contraseña del alumno desde su panel
 */
export async function cambiarPasswordAlumno(formData: FormData) {
    try {
        const alumno = await getAlumnoSesion();

        const actual = formData.get("password_actual") as string;
        const nueva = formData.get("password_nueva") as string;
        const confirma = formData.get("password_confirma") as string;

        if (nueva !== confirma) {
            return { error: "La nueva contraseña no coincide." };
        }

        if (nueva.length < 6) {
            return { error: "La contraseña debe tener al menos 6 caracteres." };
        }

        // Verificar contraseña actual
        // Necesitamos traer el password del alumno (getAlumnoSesion no lo trae por seguridad usualmente, pero aquí prisma lo trae si no select)
        const dbAlumno = await prisma.cliente.findUnique({
            where: { id: alumno.id },
            select: { password: true }
        });

        if (!dbAlumno?.password) {
            return { error: "Error de seguridad." };
        }

        const valida = await CriptoServicio.comparePassword(actual, dbAlumno.password);
        if (!valida) {
            return { error: "La contraseña actual es incorrecta." };
        }

        // Hashear y guardar
        const nuevoHash = await CriptoServicio.hashPassword(nueva);
        await prisma.cliente.update({
            where: { id: alumno.id },
            data: { password: nuevoHash }
        });

        return { success: true };
    } catch (error) {
        console.error("Error al cambiar password:", error);
        return { error: "No se pudo cambiar la contraseña." };
    }
}

/**
 * Activa o actualiza el ciclo menstrual del alumno
 */
export async function guardarConfiguracionCiclo(formData: FormData) {
    try {
        const alumno = await getAlumnoSesion();

        const fechaInicio = formData.get("fechaInicio") as string;
        const duracion = parseInt(formData.get("duracion") as string);

        if (!fechaInicio || isNaN(duracion)) {
            return { error: "Datos del ciclo incompletos." };
        }

        await prisma.cicloMenstrual.upsert({
            where: { clienteId: alumno.id },
            create: {
                clienteId: alumno.id,
                fechaInicioUltimoCiclo: new Date(fechaInicio),
                duracionCiclo: duracion,
                activo: true
            },
            update: {
                fechaInicioUltimoCiclo: new Date(fechaInicio),
                duracionCiclo: duracion,
                activo: true
            }
        });

        revalidatePath("/alumno/perfil");
        revalidatePath("/alumno/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error al guardar ciclo:", error);
        return { error: "No se pudo guardar la configuración del ciclo." };
    }
}
