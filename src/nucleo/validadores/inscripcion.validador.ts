import { z } from "zod";

export const EsquemaDatosPersonales = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    telefono: z.string().min(1, "El teléfono es requerido"),
    nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
    edad: z.string().min(1, "La edad es requerida").refine(val => parseInt(val) > 0, "La edad debe ser un número positivo"),
    genero: z.string().min(1, "El género es requerido"),
    peso: z.string().min(1, "El peso es requerido").refine(val => parseFloat(val) > 0, "El peso debe ser un número positivo"),
    altura: z.string().min(1, "La altura es requerida").refine(val => parseFloat(val) > 0, "La altura debe ser un número positivo"),
    ubicacion: z.string().min(1, "La ubicación es requerida"),
});

export const EsquemaEstiloDeVida = z.object({
    actividad: z.string().min(1, "El nivel de actividad es requerido"),
    sueno: z.string().min(1, "Las horas de sueño son requeridas"),
    otraActividadFisica: z.string().optional(),
    ocupacion: z.string().optional(),
    alimentacion: z.string().optional(),
});

export const EsquemaSaludMedica = z.object({
    condiciones: z.array(z.string()).optional(),
    otrasCondiciones: z.string().optional(),
    aptoMedico: z.string().min(1, "Debes indicar si tienes apto médico"),
});

export const EsquemaExperiencia = z.object({
    entrenaActualmente: z.string().min(1, "Indica si entrenas actualmente"),
    tiempo: z.string().optional(),
});

export const EsquemaObjetivos = z.object({
    principales: z.array(z.string()).min(1, "Selecciona al menos un objetivo"),
    motivacion: z.string().optional(),
});

export const EsquemaDisponibilidad = z.object({
    sesionesSemanales: z.string().min(1, "Selecciona días de entrenamiento"),
    tiempoSesion: z.string().min(1, "Selecciona duración de sesión"),
    lugar: z.array(z.string()).min(1, "Selecciona al menos un lugar"),
    equipamiento: z.array(z.string()).optional(),
});

export const EsquemaPersonalizacion = z.object({
    noGusta: z.string().optional(),
    notas: z.string().optional(),
});

export const EsquemaConsentimiento = z.object({
    aceptado: z.boolean(),
    declaracionFinal: z.boolean().refine(val => val === true, {
        message: "Debes aceptar la declaración para continuar",
    }),
});

export const EsquemaRespuestas = z.object({
    datosPersonales: EsquemaDatosPersonales,
    saludMedica: EsquemaSaludMedica,
    estiloDeVida: EsquemaEstiloDeVida,
    experiencia: EsquemaExperiencia,
    objetivos: EsquemaObjetivos,
    disponibilidad: EsquemaDisponibilidad,
    personalizacion: EsquemaPersonalizacion.optional(),
    consentimiento: EsquemaConsentimiento,
});

export const EsquemaInscripcionCompleto = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    telefono: z.string().min(1, "El teléfono es requerido"),
    respuestas: EsquemaRespuestas,
});

export type TDatosPersonales = z.infer<typeof EsquemaDatosPersonales>;
export type TEstiloDeVida = z.infer<typeof EsquemaEstiloDeVida>;
export type TSaludMedica = z.infer<typeof EsquemaSaludMedica>;
export type TExperiencia = z.infer<typeof EsquemaExperiencia>;
export type TObjetivos = z.infer<typeof EsquemaObjetivos>;
export type TDisponibilidad = z.infer<typeof EsquemaDisponibilidad>;
export type TConsentimiento = z.infer<typeof EsquemaConsentimiento>;
export type TRespuestas = z.infer<typeof EsquemaRespuestas>;
export type TInscripcion = z.infer<typeof EsquemaInscripcionCompleto>;
