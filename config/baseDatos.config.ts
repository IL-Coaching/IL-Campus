/**
 * Configuración de Base de Datos — ArchSecure AI
 * Centraliza configuración de conexión y pool de Prisma.
 */

export const baseDatosConfig = {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,

    pool: {
        min: 2,
        max: 10,
    },

    opciones: {
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    },

    schema: 'public',
};
