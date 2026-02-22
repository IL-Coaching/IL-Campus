import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export const EmailServicio = {
    /**
     * Envía un email utilizando Resend.
     */
    async enviarEmail({
        para,
        asunto,
        html
    }: {
        para: string,
        asunto: string,
        html: string
    }) {
        if (!process.env.RESEND_API_KEY) {
            console.warn("⚠️ RESEND_API_KEY no encontrada. Simulando envío de email a:", para);
            return { success: true, dummy: true };
        }

        try {
            const data = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', // Fallback al dominio de prueba de Resend
                to: para,
                subject: asunto,
                html: html,
            });

            return { success: true, data };
        } catch (error) {
            console.error("Error al enviar email:", error);
            return { error: "No se pudo enviar el correo electrónico." };
        }
    }
};
