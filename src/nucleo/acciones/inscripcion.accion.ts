"use server";

import { prisma } from "@/baseDatos/conexion";
import { ClienteServicio } from "../servicios/cliente.servicio";

interface RespuestasInscripcion {
    datosPersonales?: {
        nacimiento?: string;
        edad?: string;
        genero?: string;
        peso?: string;
        altura?: string;
        ubicacion?: string;
    };
    saludMedica?: {
        condiciones?: string[];
        otrasCondiciones?: string;
        aptoMedico?: string;
    };
    estiloDeVida?: {
        actividad?: string;
        sueno?: string;
    };
    experiencia?: {
        entrenaActualmente?: string;
        tiempo?: string;
    };
    objetivos?: {
        principales?: string[];
        motivacion?: string;
    };
    disponibilidad?: {
        sesionesSemanales?: string;
        tiempoSesion?: string;
        lugar?: string;
        equipamiento?: string[];
    };
    personalizacion?: {
        noGusta?: string;
        notas?: string;
    };
    consentimiento?: {
        aceptado?: boolean;
        declaracionFinal?: boolean;
    };
}

export async function enviarFormularioInscripcion(datos: {
    nombre: string;
    email: string;
    telefono: string;
    respuestas: RespuestasInscripcion;
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
            saludMedica: datos.respuestas.saludMedica,
            estiloDeVida: datos.respuestas.estiloDeVida,
            experiencia: datos.respuestas.experiencia,
            objetivos: datos.respuestas.objetivos,
            disponibilidad: datos.respuestas.disponibilidad,
            personalizacion: datos.respuestas.personalizacion,
            consentimiento: datos.respuestas.consentimiento
        };

        const result = await ClienteServicio.crearProspectoConFormulario({
            nombre: datos.nombre,
            email: datos.email,
            telefono: datos.telefono,
            entrenadorId: entrenador.id,
            formulario: formularioData
        });

        return { exito: true, clienteId: result.id };

    } catch (error) {
        console.error("Error al procesar inscripción:", error);
        const mensaje = error instanceof Error ? error.message : "Ocurrió un error al enviar tu formulario. Por favor, intenta de nuevo.";
        return { error: mensaje };
    }
}
