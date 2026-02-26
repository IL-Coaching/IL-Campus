import bcrypt from 'bcryptjs';

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
        const salt = await bcrypt.genSalt(12);
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
    generateRandomToken(length = 32): string {
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
        const bytes = new Uint32Array(7);
        crypto.getRandomValues(bytes);
        const parte1 = Array.from(bytes.slice(0, 4)).map(v => chars[v % chars.length]).join('');
        const parte2 = Array.from(bytes.slice(4, 7)).map(v => chars[v % chars.length]).join('');
        return `IL-${parte1}-${parte2}`;
    }
};
