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
     * Compara una contraseña en texto plano con un hash.
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
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
     * Usa CSPRNG + rejection sampling para garantizar distribución uniforme.
     */
    generarCodigoActivacion(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 36 caracteres
        const charsLen = chars.length; // 36
        const byteMax = 256;
        const rejectLimit = Math.floor(byteMax / charsLen) * charsLen; // 252
        
        let result = '';
        while (result.length < CODIGO_ACTIVACION_LONGITUD) {
            const byte = crypto.getRandomValues(new Uint8Array(1))[0];
            if (byte < rejectLimit) {
                result += chars[byte % charsLen];
            }
        }
        return `IL-${result.slice(0, 4)}-${result.slice(4, 7)}`;
    }
};
