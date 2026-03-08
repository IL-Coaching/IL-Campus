import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET no configurado en variables de entorno"); })()
);

/**
 * Gestión de JSON Web Tokens para IL-Campus.
 */
export const JWT = {
    /**
     * Firma un nuevo token de sesión.
     */
    async sign(payload: { id: string; role: 'entrenador' | 'alumno' }): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d') // Sesión válida por 7 días
            .sign(secret);
    },

    /**
     * Verifica la validez de un token.
     */
    async verify(token: string) {
        try {
            const { payload } = await jwtVerify(token, secret);
            return payload as { id: string; role: 'entrenador' | 'alumno' };
        } catch {
            return null;
        }
    }
};
