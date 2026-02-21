/**
 * Configuración de Seguridad — ArchSecure AI
 * Centraliza headers, limites de peticiones y políticas de acceso.
 */

export const seguridadConfig = {
    // Tiempos de expiración para sesiones y tokens
    sesion: {
        expiracionCorta: 15 * 60, // 15 minutos (para tokens de acceso sensibles)
        expiracionLarga: 7 * 24 * 60 * 60, // 7 días (para sesiones persistentes)
    },

    // Configuración de Rate Limiting (referencia para middleware futuro)
    peticiones: {
        ventanaMs: 15 * 60 * 1000, // 15 minutos
        limitePorIp: 100, // Máximo 100 peticiones por IP por ventana
    },

    // Dominios permitidos (CORS)
    dominiosPermitidos: [
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002',
    ],

    // Roles permitidos en el sistema
    roles: {
        ADMIN: 'ENTRENADOR',
        CLIENTE: 'ALUMNO',
    }
};
