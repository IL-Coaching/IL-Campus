"use server";

import { prisma } from "@/baseDatos/conexion";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { revalidatePath } from "next/cache";

export async function obtenerConversacionConEntrenador() {
    try {
        const cliente = await getAlumnoSesion();

        const clienteData = await prisma.cliente.findUnique({
            where: { id: cliente.id },
            include: {
                entrenador: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                },
                mensajes: {
                    orderBy: { creadoEn: 'asc' },
                    take: 50
                },
                _count: {
                    select: {
                        mensajes: {
                            where: { emisor: 'entrenador', leido: false }
                        }
                    }
                }
            }
        });

        if (!clienteData) {
            return { error: "Cliente no encontrado" };
        }

        // Marcar mensajes como leídos
        await prisma.mensaje.updateMany({
            where: {
                clienteId: cliente.id,
                emisor: 'entrenador',
                leido: false
            },
            data: { leido: true }
        });

        revalidatePath('/alumno/mensajeria');

        return {
            exito: true,
            conversacion: {
                entrenador: clienteData.entrenador,
                mensajes: clienteData.mensajes,
                noLeidos: clienteData._count.mensajes
            }
        };
    } catch (error) {
        console.error("Error al obtener conversación:", error);
        return { error: "No se pudo cargar la conversación" };
    }
}

export async function enviarMensajeAEntrenador(contenido: string) {
    try {
        const cliente = await getAlumnoSesion();

        if (!contenido.trim()) {
            return { error: "El mensaje no puede estar vacío" };
        }

        const mensaje = await prisma.mensaje.create({
            data: {
                clienteId: cliente.id,
                emisor: 'cliente',
                contenido: contenido.trim(),
                tipo: 'texto',
                leido: false
            }
        });

        revalidatePath('/alumno/mensajeria');
        return { exito: true, mensaje };
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        return { error: "No se pudo enviar el mensaje" };
    }
}

export async function obtenerMensajesNoLeidos() {
    try {
        const cliente = await getAlumnoSesion();

        const count = await prisma.mensaje.count({
            where: {
                clienteId: cliente.id,
                emisor: 'entrenador',
                leido: false
            }
        });

        return { exito: true, noLeidos: count };
    } catch {
        return { exito: false, noLeidos: 0 };
    }
}
