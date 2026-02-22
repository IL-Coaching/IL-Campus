import * as otplib from 'otplib';
import QRCode from 'qrcode';

// Interface para tipado estricto
interface AuthenticatorModule {
    generateSecret: () => string;
    keyuri: (user: string, service: string, secret: string) => string;
    verify: (opts: { token: string, secret: string }) => boolean;
}

/**
 * Obtiene la instancia de authenticator de forma resiliente para producción (Vercel/ESM).
 */
const getAuthInstance = (): AuthenticatorModule => {
    const otp = otplib as unknown as { authenticator?: AuthenticatorModule, default?: { authenticator?: AuthenticatorModule }, generateSecret?: unknown };
    const instance = otp.authenticator || otp.default?.authenticator || (typeof otp.generateSecret === 'function' ? (otp as unknown as AuthenticatorModule) : null);

    if (!instance) {
        console.error("MFA Error: No se pudo encontrar la instancia de authenticator en otplib", Object.keys(otp));
        throw new Error("Sistema de seguridad no inicializado correctamente.");
    }
    return instance;
};

const auth = getAuthInstance();

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
