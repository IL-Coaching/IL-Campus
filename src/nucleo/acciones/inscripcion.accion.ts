"use server";

import { prisma } from "@/baseDatos/conexion";
import { ClienteServicio } from "../servicios/cliente.servicio";
import { EsquemaInscripcionCompleto } from "../validadores/inscripcion.validador";

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
        ocupacion?: string;
        actividad?: string;
        sueno?: string;
        alimentacion?: string;
        otraActividadFisica?: string;
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
        lugar?: string[];
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
        const validacion = EsquemaInscripcionCompleto.safeParse(datos);
        
        if (!validacion.success) {
            const mensajesError = validacion.error.issues.map(issue => 
                `${issue.path.join('.')}: ${issue.message}`
            ).join(', ');
            
            return { error: `Por favor, completa todos los campos obligatorios: ${mensajesError}` };
        }

        const { nombre, email, telefono, respuestas } = validacion.data;
        // 1. Buscamos al entrenador principal
        const emailEntrenador = process.env.ENTRENADOR_EMAIL;

        if (!emailEntrenador) {
            console.error("CRÍTICO: ENTRENADOR_EMAIL no configurado en variables de entorno.");
            return { error: "El sistema no está configurado para recibir inscripciones." };
        }

        const entrenador = await prisma.entrenador.findUnique({
            where: { email: emailEntrenador }
        });

        if (!entrenador) {
            return { error: "El sistema no está configurado para recibir inscripciones en este momento." };
        }

        // 2. Procesamos el alta del prospecto
        // Agrupamos las respuestas según el esquema JSON definido en Prisma
        const formularioData = {
            datosPersonales: {
                nombre: nombre,
                nacimiento: respuestas.datosPersonales.nacimiento,
                edad: respuestas.datosPersonales.edad,
                genero: respuestas.datosPersonales.genero,
                peso: respuestas.datosPersonales.peso,
                altura: respuestas.datosPersonales.altura,
                ubicacion: respuestas.datosPersonales.ubicacion,
            },
            contacto: {
                whatsapp: telefono,
                email: email,
            },
            saludMedica: respuestas.saludMedica,
            estiloDeVida: respuestas.estiloDeVida,
            experiencia: respuestas.experiencia,
            objetivos: respuestas.objetivos,
            disponibilidad: respuestas.disponibilidad,
            personalizacion: respuestas.personalizacion,
            consentimiento: respuestas.consentimiento
        };

        const result = await ClienteServicio.crearProspectoConFormulario({
            nombre,
            email,
            telefono,
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
