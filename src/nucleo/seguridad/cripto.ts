import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS, TOKEN_LONGITUD, CODIGO_ACTIVACION_LONGITUD } from '@/nucleo/constantes/valores';

/**
 * Servicio de Criptografía para IL-Campus.
 * Encargado de hashing de contraseñas y verificaciones seguras.
 */
export const CriptoServicio = {
    /**
     * Genera un hash seguro para una contraseña.
     * Protocolo: Bcrypt con factor de costo 12.
     */
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    },

    /**
     * Genera un token aleatorio para invitaciones o resets.
     */
    generateRandomToken(length = TOKEN_LONGITUD): string {
        // SEGURIDAD: crypto.getRandomValues() es criptográficamente seguro (CSPRNG)
        // Math.random() NO es seguro para tokens de acceso — reemplazado globalmente
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        return Array.from(randomValues)
            .map(val => chars[val % chars.length])
            .join('');
    },

    /**
     * Genera un código de activación seguro con formato IL-XXXX-XXX.
     * Usa CSPRNG para garantizar imprevisibilidad del código temporal de acceso.
     */
    generarCodigoActivacion(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const bytes = new Uint32Array(CODIGO_ACTIVACION_LONGITUD);
        crypto.getRandomValues(bytes);
        const parte1 = Array.from(bytes.slice(0, 4)).map(v => chars[v % chars.length]).join('');
        const parte2 = Array.from(bytes.slice(4, 7)).map(v => chars[v % chars.length]).join('');
        return `IL-${parte1}-${parte2}`;
    }
};
