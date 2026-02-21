"use server";

import { prisma } from "@/baseDatos/conexion";
import { ClienteServicio } from "../servicios/cliente.servicio";

export async function enviarFormularioInscripcion(datos: {
    nombre: string;
    email: string;
    telefono: string;
    respuestas: any;
}) {
    try {
        // 1. Buscamos al entrenador principal (Iñaki)
        const entrenador = await prisma.entrenador.findUnique({
            where: { email: 'legarretatraining@gmail.com' }
        });

        if (!entrenador) {
            return { error: "El sistema no está configurado para recibir inscripciones en este momento." };
        }

        // 2. Procesamos el alta del prospecto
        // Agrupamos las respuestas según el esquema JSON definido en Prisma
        const formularioData = {
            datosPersonales: {
                nombre: datos.nombre,
                nacimiento: datos.respuestas.datosPersonales?.nacimiento,
                edad: datos.respuestas.datosPersonales?.edad,
                genero: datos.respuestas.datosPersonales?.genero,
                peso: datos.respuestas.datosPersonales?.peso,
                altura: datos.respuestas.datosPersonales?.altura,
                ubicacion: datos.respuestas.datosPersonales?.ubicacion,
            },
            contacto: {
                whatsapp: datos.telefono,
                email: datos.email,
            },
            saludMedica: {
                condiciones: datos.respuestas.salud?.condiciones,
                aptoMedico: datos.respuestas.salud?.aptoMedico,
            },
            estiloDeVida: {
                actividad: datos.respuestas.estiloVida?.actividad,
                sueno: datos.respuestas.estiloVida?.sueno,
            },
            experiencia: {
                entrenaActualmente: datos.respuestas.experiencia?.entrenaActualmente,
                tiempo: datos.respuestas.experiencia?.tiempoEntrenando,
            },
            objetivos: {
                principales: datos.respuestas.objetivos?.principal,
                motivacion: datos.respuestas.objetivos?.motivacion,
            },
            disponibilidad: {
                sesionesSemana: datos.respuestas.logistica?.sesionesSemana,
                tiempoSesion: datos.respuestas.logistica?.tiempoSesion,
                lugar: datos.respuestas.logistica?.dondeEntrena,
                equipamiento: datos.respuestas.logistica?.equipamiento,
            },
            personalizacion: {
                noGusta: datos.respuestas.personalizacion?.noGusta,
                notas: datos.respuestas.personalizacion?.notasImportantes,
            },
            consentimiento: {
                aceptado: datos.respuestas.salud?.consentimiento,
                declaracionFinal: datos.respuestas.personalizacion?.declaracionFinal
            }
        };

        const result = await ClienteServicio.crearProspectoConFormulario({
            nombre: datos.nombre,
            email: datos.email,
            telefono: datos.telefono,
            entrenadorId: entrenador.id,
            formulario: formularioData as any
        });

        return { exito: true, clienteId: result.id };

    } catch (error: any) {
        console.error("Error al procesar inscripción:", error);
        return { error: "Ocurrió un error al enviar tu formulario. Por favor, intenta de nuevo." };
    }
}
