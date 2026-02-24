"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { StorageServicio } from "../servicios/storage.servicio";
import { revalidatePath } from "next/cache";

// ── Tipos MIME permitidos para archivos de chat ──
const TIPOS_PERMITIDOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TIPOS_PERMITIDOS_VIDEO = ['video/mp4', 'video/quicktime'];
const TODOS_LOS_PERMITIDOS = [...TIPOS_PERMITIDOS_IMAGEN, ...TIPOS_PERMITIDOS_VIDEO];
const MAX_SIZE_IMG = 10 * 1024 * 1024;  // 10MB
const MAX_SIZE_VIDEO = 100 * 1024 * 1024; // 100MB

/**
 * Obtiene la lista de clientes activos con su último mensaje para el sidebar del chat.
 * @security Filtra por entrenadorId en sesión (BOLA).
 */
export async function obtenerConversaciones() {
    try {
        const entrenador = await getEntrenadorSesion();

        const clientes = await prisma.cliente.findMany({
            where: { entrenadorId: entrenador.id, activo: true },
            select: {
                id: true,
                nombre: true,
                email: true,
                mensajes: {
                    orderBy: { creadoEn: 'desc' },
                    take: 1,
                    select: {
                        contenido: true,
                        emisor: true,
                        creadoEn: true,
                        leido: true,
                        tipo: true
                    }
                },
                _count: {
                    select: {
                        mensajes: {
                            where: { leido: false, emisor: 'cliente' }
                        }
                    }
                }
            },
            orderBy: { fechaAlta: 'desc' }
        });

        // Ordenar: conversaciones con mensajes no leídos primero, luego por último mensaje
        const ordenados = clientes.sort((a, b) => {
            const noLeidosA = a._count.mensajes;
            const noLeidosB = b._count.mensajes;
            if (noLeidosA !== noLeidosB) return noLeidosB - noLeidosA;

            const fechaA = a.mensajes[0]?.creadoEn ?? new Date(0);
            const fechaB = b.mensajes[0]?.creadoEn ?? new Date(0);
            return new Date(fechaB).getTime() - new Date(fechaA).getTime();
        });

        return {
            exito: true,
            conversaciones: ordenados.map(c => ({
                clienteId: c.id,
                nombre: c.nombre,
                email: c.email,
                ultimoMensaje: c.mensajes[0] || null,
                noLeidos: c._count.mensajes
            }))
        };
    } catch (error) {
        console.error("Error al obtener conversaciones:", error);
        return { exito: false, conversaciones: [] };
    }
}

/**
 * Obtiene el historial de mensajes de una conversación con un cliente.
 * Marca automáticamente como leídos los mensajes del cliente al abrirlos.
 * @security Valida que el cliente pertenece al entrenador en sesión (BOLA).
 */
export async function obtenerMensajesCliente(clienteId: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA: verificar que el cliente pertenece al entrenador
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id },
            select: { id: true, nombre: true }
        });

        if (!cliente) return { error: "Cliente no encontrado." };

        // Marcar como leídos los mensajes del cliente
        await prisma.mensaje.updateMany({
            where: { clienteId, emisor: 'cliente', leido: false },
            data: { leido: true }
        });

        const mensajes = await prisma.mensaje.findMany({
            where: { clienteId },
            orderBy: { creadoEn: 'asc' }
        });

        return { exito: true, mensajes, cliente };
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        return { error: "No se pudieron cargar los mensajes." };
    }
}

/**
 * Envía un mensaje de texto del entrenador al cliente.
 * @security Valida que el cliente pertenece al entrenador en sesión (BOLA).
 */
export async function enviarMensaje(clienteId: string, contenido: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });
        if (!cliente) return { error: "Cliente no encontrado." };

        if (!contenido.trim()) return { error: "El mensaje no puede estar vacío." };

        const mensaje = await prisma.mensaje.create({
            data: {
                clienteId,
                emisor: 'entrenador',
                contenido: contenido.trim(),
                tipo: 'texto',
                leido: true
            }
        });

        revalidatePath('/entrenador/mensajeria');
        return { exito: true, mensaje };
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        return { error: "No se pudo enviar el mensaje." };
    }
}

/**
 * Envía un mensaje con archivo adjunto (imagen o video).
 * Sube el archivo a Supabase Storage y guarda la URL en mediaUrl.
 * @security Valida tipo MIME, tamaño, y propiedad del cliente (BOLA).
 */
export async function enviarMensajeConMedia(clienteId: string, base64: string, mimeType: string, texto?: string) {
    try {
        const entrenador = await getEntrenadorSesion();

        // BOLA
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId: entrenador.id }
        });
        if (!cliente) return { error: "Cliente no encontrado." };

        // Validar tipo MIME
        if (!TODOS_LOS_PERMITIDOS.includes(mimeType)) {
            return { error: `Tipo de archivo no permitido: ${mimeType}` };
        }

        // Validar tamaño
        const base64Data = base64.replace(/^data:[^;]+;base64,/, '');
        const bufferSize = Buffer.from(base64Data, 'base64').length;
        const esVideo = TIPOS_PERMITIDOS_VIDEO.includes(mimeType);
        const maxSize = esVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMG;

        if (bufferSize > maxSize) {
            return { error: `Archivo demasiado grande. Máximo: ${esVideo ? '100MB' : '10MB'}` };
        }

        // Subir a Storage
        const extension = mimeType.split('/')[1].replace('quicktime', 'mov');
        const fileName = `chat/${clienteId}/${Date.now()}.${extension}`;
        const upload = await StorageServicio.subirImagenBase64(base64, fileName);

        if (!upload.success) return { error: upload.error };

        // Crear mensaje con media
        const tipoMensaje = esVideo ? 'video' : 'imagen';
        const mensaje = await prisma.mensaje.create({
            data: {
                clienteId,
                emisor: 'entrenador',
                contenido: texto?.trim() || '',
                tipo: tipoMensaje,
                mediaUrl: upload.url,
                leido: true
            }
        });

        revalidatePath('/entrenador/mensajeria');
        return { exito: true, mensaje };
    } catch (error) {
        console.error("Error al enviar media:", error);
        return { error: "No se pudo enviar el archivo." };
    }
}

/**
 * Obtiene el conteo total de mensajes no leídos + check-ins no vistos.
 * Se usa para el badge del sidebar.
 */
export async function obtenerContadorMensajeria() {
    try {
        const entrenador = await getEntrenadorSesion();

        const [mensajesNoLeidos, checkinsNoVistos] = await Promise.all([
            prisma.mensaje.count({
                where: {
                    cliente: { entrenadorId: entrenador.id },
                    emisor: 'cliente',
                    leido: false
                }
            }),
            prisma.checkin.count({
                where: {
                    cliente: { entrenadorId: entrenador.id },
                    visto: false
                }
            })
        ]);

        return { exito: true, total: mensajesNoLeidos + checkinsNoVistos, mensajesNoLeidos, checkinsNoVistos };
    } catch {
        return { exito: false, total: 0, mensajesNoLeidos: 0, checkinsNoVistos: 0 };
    }
}
