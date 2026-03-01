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
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: para,
                subject: asunto,
                html: html,
            });

            return { success: true, data };
        } catch (error) {
            console.error("Error al enviar email:", error);
            return { error: "No se pudo enviar el correo electrónico." };
        }
    },

    /**
     * Envía recordatorio de sesión de entrenamiento
     */
    async enviarRecordatorioSesion({ email, nombre, hora }: { email: string; nombre: string; hora: string }) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #0f172a; color: white; padding: 40px; }
                    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
                    .title { color: #f97316; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
                    .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">🏋️ ¡Hoy tienes entrenamiento!</div>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu sesión de entrenamiento está programada para hoy a las <strong>${hora}</strong>.</p>
                    <p>Recuerda:</p>
                    <ul>
                        <li>Haber descansado adecuadamente</li>
                        <li>Haber comido 1-2 horas antes</li>
                        <li>Tener tu botella de agua ready</li>
                    </ul>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/alumno/rutina" class="button">Ver Mi Rutina</a>
                    <div class="footer">
                        <p>IL-Campus · Tu herramienta de entrenamiento</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.enviarEmail({
            para: email,
            asunto: '🏋️ ¡Hoy tienes entrenamiento! - IL-Campus',
            html
        });
    },

    /**
     * Envía recordatorio de check-in
     */
    async enviarRecordatorioCheckin({ email, nombre }: { email: string; nombre: string }) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #0f172a; color: white; padding: 40px; }
                    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
                    .title { color: #f97316; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
                    .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">📸 ¿Cómo va tu progreso?</div>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Hace tiempo que no recibes un check-in tuyo. ¿Cómo va tu entrenamiento?</p>
                    <p>Es importante que envíes tus check-ins semanales para que tu entrenador pueda:</p>
                    <ul>
                        <li>hacer seguimiento de tu progreso</li>
                        <li>ajustar las cargas si es necesario</li>
                        <li>mantenerte motivado</li>
                    </ul>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/alumno/checkin" class="button">Enviar Check-in</a>
                    <div class="footer">
                        <p>IL-Campus · Tu herramienta de entrenamiento</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.enviarEmail({
            para: email,
            asunto: '📸 Tu entrenador te espera - IL-Campus',
            html
        });
    },

    /**
     * Envía recordatorio de renovación de membresía
     */
    async enviarRecordatorioRenovacion({ email, nombre, fechaVencimiento }: { email: string; nombre: string; fechaVencimiento: Date }) {
        const fechaFormateada = new Date(fechaVencimiento).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #0f172a; color: white; padding: 40px; }
                    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
                    .title { color: #f97316; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
                    .highlight { background: #f97316; color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; margin: 16px 0; }
                    .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">⏰ Tu membresía está por vencer</div>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu período de entrenamiento vence el:</p>
                    <div class="highlight">${fechaFormateada}</div>
                    <p>Contacta a tu entrenador para renovar y seguir disfrutando de tu plan de entrenamiento sin interrupciones.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/alumno/perfil" class="button">Ver Mi Plan</a>
                    <div class="footer">
                        <p>IL-Campus · Tu herramienta de entrenamiento</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.enviarEmail({
            para: email,
            asunto: `⏰ Tu membresía vence el ${fechaFormateada} - IL-Campus`,
            html
        });
    }
};
