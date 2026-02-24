"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";

export async function purgarTodaLaBiblioteca() {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Eliminar referencias en sesiones (DiaEjercicio)
        await prisma.diaEjercicio.deleteMany({
            where: {
                dia: {
                    semana: {
                        macrociclo: {
                            cliente: {
                                entrenadorId: entrenador.id
                            }
                        }
                    }
                }
            }
        });

        // 2. Eliminar todos los ejercicios del catálogo del entrenador
        const res = await prisma.ejercicio.deleteMany({
            where: {
                entrenadorId: entrenador.id
            }
        });

        revalidatePath("/entrenador/biblioteca");
        return { success: true, eliminados: res.count };
    } catch (error) {
        console.error("Error al purgar toda la biblioteca:", error);
        return { error: "No se pudo purgar la biblioteca completamente." };
    }
}
