import * as otplib from 'otplib';
import QRCode from 'qrcode';

// Interface para tipado estricto del módulo otplib y evitar 'any'
interface AuthenticatorModule {
    generateSecret: () => string;
    keyuri: (user: string, service: string, secret: string) => string;
    verify: (opts: { token: string, secret: string }) => boolean;
}

const auth = (otplib as unknown as { authenticator: AuthenticatorModule }).authenticator;

/**
 * Servicio de Autenticación de Doble Factor (MFA) para IL-Campus.
 */
export const MFAServicio = {
    /**
     * Genera un nuevo secreto único para el usuario.
     */
    generarSecreto(): string {
        return auth.generateSecret();
    },

    /**
     * Genera un URI de autenticación para ser escaneado por una App (Google Auth, Authy, etc).
     */
    generarURI(email: string, secreto: string): string {
        return auth.keyuri(email, 'IL-Campus Core', secreto);
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
        return auth.verify({ token, secret: secreto });
    }
};
