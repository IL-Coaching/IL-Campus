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
    salud?: {
        condiciones?: string[];
        consentimiento?: boolean;
        aptoMedico?: string | boolean;
    };
    estiloVida?: {
        actividad?: string;
        sueno?: string;
    };
    experiencia?: {
        entrenaActualmente?: string;
        tiempoEntrenando?: string;
    };
    objetivos?: {
        principal?: string[];
        motivacion?: string;
    };
    logistica?: {
        sesionesSemana?: string;
        tiempoSesion?: string;
        dondeEntrena?: string;
        equipamiento?: string[];
    };
    personalizacion?: {
        noGusta?: string;
        notasImportantes?: string;
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
            formulario: formularioData
        });

        return { exito: true, clienteId: result.id };

    } catch (error) {
        console.error("Error al procesar inscripción:", error);
        const mensaje = error instanceof Error ? error.message : "Ocurrió un error al enviar tu formulario. Por favor, intenta de nuevo.";
        return { error: mensaje };
    }
}
