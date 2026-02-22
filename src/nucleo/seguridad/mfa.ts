import { OTP } from 'otplib';
import QRCode from 'qrcode';

// Instancia global estable de OTP para la aplicación
const otp = new OTP({ strategy: 'totp' });

/**
 * Servicio de Autenticación de Doble Factor (MFA) para IL-Campus.
 */
export const MFAServicio = {
    /**
     * Genera un nuevo secreto único para el usuario.
     */
    generarSecreto(): string {
        return otp.generateSecret();
    },

    /**
     * Genera un URI de autenticación para ser escaneado por una App (Google Auth, Authy, etc).
     */
    generarURI(email: string, secreto: string): string {
        return otp.generateURI({
            issuer: 'IL-Campus Core',
            label: email,
            secret: secreto
        });
    },

    /**
     * Convierte el URI en una imagen QR (Base64).
     */
    async generarQR(uri: string): Promise<string> {
        try {
            return await QRCode.toDataURL(uri);
        } catch {
            throw new Error('No se pudo generar el código QR.');
        }
    },

    /**
     * Verifica si un token de 6 dígitos es válido para un secreto dado.
     */
    verificarToken(token: string, secreto: string): boolean {
        const result = otp.verifySync({ token, secret: secreto });
        return result.valid;
    }
};
