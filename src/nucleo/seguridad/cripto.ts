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
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
};
