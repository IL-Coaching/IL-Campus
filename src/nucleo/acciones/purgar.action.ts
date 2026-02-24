"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";

export async function purgarTodaLaBiblioteca() {
    try {
        const entrenador = await getEntrenadorSesion();
        const id = entrenador.id;

        // 1. Limpiar todas las referencias a ejercicios en la planificación
        // Debido a que no hay cascade delete en algunas relaciones, lo hacemos manualmente

        // Resultados de testeos y porcentajes
        await prisma.resultadoTesteo.deleteMany({ where: { ejercicio: { entrenadorId: id } } });
        await prisma.porcentajesCliente.deleteMany({ where: { ejercicio: { entrenadorId: id } } });
        await prisma.configTesteoEjercicio.deleteMany({ where: { ejercicio: { entrenadorId: id } } });
        await prisma.alertaEstancamiento.deleteMany({ where: { ejercicio: { entrenadorId: id } } });

        // Ejercicios en rutinas y sesiones
        await prisma.ejercicioPlanificado.deleteMany({ where: { diaSesion: { semana: { bloqueMensual: { macrociclo: { cliente: { entrenadorId: id } } } } } } });
        await prisma.ejercicioRutina.deleteMany({ where: { rutina: { entrenadorId: id } } });

        // 2. Finalmente eliminar los ejercicios del catálogo
        const res = await prisma.ejercicio.deleteMany({
            where: {
                entrenadorId: id
            }
        });

        revalidatePath("/entrenador/biblioteca");
        return { success: true, eliminados: res.count };
    } catch (error) {
        console.error("Error al purgar toda la biblioteca:", error);
        return { error: "No se pudo purgar la biblioteca completamente." };
    }
}
