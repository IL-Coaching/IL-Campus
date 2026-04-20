"use client";

/**
 * Sistema de notificaciones toast — IL-Campus
 * Implementación liviana sin dependencias externas.
 * Usa un evento global para comunicar desde cualquier componente al ToastProvider.
 */

type TipoToast = 'exito' | 'error' | 'info' | 'alerta';

interface ToastPayload {
    mensaje: string;
    tipo: TipoToast;
    duracion?: number;
}

const EVENTO_TOAST = 'il-campus:toast';

export function toast(mensaje: string, tipo: TipoToast = 'info', duracion = 3500) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENTO_TOAST, {
        detail: { mensaje, tipo, duracion } satisfies ToastPayload
    }));
}

toast.exito = (mensaje: string, duracion?: number) => toast(mensaje, 'exito', duracion);
toast.error = (mensaje: string, duracion?: number) => toast(mensaje, 'error', duracion ?? 5000);
toast.info = (mensaje: string, duracion?: number) => toast(mensaje, 'info', duracion);
toast.alerta = (mensaje: string, duracion?: number) => toast(mensaje, 'alerta', duracion);

export { EVENTO_TOAST };
export type { ToastPayload, TipoToast };