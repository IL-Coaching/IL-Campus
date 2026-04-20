"use client";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { EVENTO_TOAST, ToastPayload, TipoToast } from '@/compartido/hooks/useToast';

interface ToastItem extends ToastPayload {
    id: number;
}

const ICONOS: Record<TipoToast, React.ReactNode> = {
    exito: <CheckCircle2 size={18} className="text-verde shrink-0" />,
    error: <XCircle size={18} className="text-rojo shrink-0" />,
    info: <Info size={18} className="text-azul shrink-0" />,
    alerta: <AlertTriangle size={18} className="text-yellow shrink-0" />,
};

const ESTILOS: Record<TipoToast, string> = {
    exito: 'border-verde/20 bg-verde/5',
    error: 'border-rojo/20 bg-rojo/5',
    info: 'border-azul/20 bg-azul/5',
    alerta: 'border-yellow/20 bg-yellow/5',
};

let nextId = 0;

export default function ToastProvider() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const eliminar = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const payload = (e as CustomEvent<ToastPayload>).detail;
            const id = ++nextId;
            setToasts(prev => [...prev, { ...payload, id }]);
            setTimeout(() => eliminar(id), payload.duracion ?? 3500);
        };

        window.addEventListener(EVENTO_TOAST, handler);
        return () => window.removeEventListener(EVENTO_TOAST, handler);
    }, [eliminar]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border bg-marino-2 shadow-2xl pointer-events-auto
                        animate-in slide-in-from-bottom-4 fade-in duration-300 ${ESTILOS[t.tipo]}`}
                >
                    {ICONOS[t.tipo]}
                    <p className="text-blanco text-[0.8rem] font-medium leading-snug flex-1">{t.mensaje}</p>
                    <button
                        onClick={() => eliminar(t.id)}
                        className="text-gris hover:text-blanco transition-colors shrink-0 mt-0.5"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
