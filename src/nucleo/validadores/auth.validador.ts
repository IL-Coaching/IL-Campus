import { z } from "zod";

/**
 * Esquema de validación para login de entrenador.
 * @security OWASP A07:2021 - Fallo de identificación y autenticación
 */
export const EsquemaLoginEntrenador = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Esquema de validación para login de alumno.
 * @security OWASP A07:2021 - Fallo de identificación y autenticación
 */
export const EsquemaLoginAlumno = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Esquema para recuperación de contraseña.
 * @security OWASP A01:2021 - Control de acceso
 */
export const EsquemaRecuperarPassword = z.object({
    email: z.string().email("Email inválido"),
});

/**
 * Esquema para reset de contraseña con token.
 * @security OWASP A01:2021 - Control de acceso
 */
export const EsquemaResetPassword = z.object({
    token: z.string().min(1, "Token requerido"),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

/**
 * Esquema para cambio de contraseña (usuario autenticado).
 * @security OWASP A07:2021 - Fallo de identificación y autenticación
 */
export const EsquemaCambiarPassword = z.object({
    passwordActual: z.string().min(1, "Contraseña actual requerida"),
    passwordNueva: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
}).refine(data => data.passwordNueva === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

/**
 * Esquema para verificar código MFA.
 * @security OWASP A07:2021 - Fallo de identificación y autenticación
 */
export const EsquemaVerificarMFA = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d+$/, "Solo dígitos"),
    trustDevice: z.boolean().optional(),
});

export type TLoginEntrenador = z.infer<typeof EsquemaLoginEntrenador>;
export type TLoginAlumno = z.infer<typeof EsquemaLoginAlumno>;
export type TRecuperarPassword = z.infer<typeof EsquemaRecuperarPassword>;
export type TResetPassword = z.infer<typeof EsquemaResetPassword>;
export type TCambiarPassword = z.infer<typeof EsquemaCambiarPassword>;
export type TVerificarMFA = z.infer<typeof EsquemaVerificarMFA>;
