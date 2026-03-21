import { useState, useEffect, useCallback } from 'react';

const getSesionKey = (diaId: string) => `sesion_inicio_${diaId}`;

export function useSesionTracking(diaId: string | null) {
    const [inicio, setInicio] = useState<number | null>(null);

    useEffect(() => {
        if (!diaId) {
            setInicio(null);
            return;
        }
        const stored = localStorage.getItem(getSesionKey(diaId));
        setInicio(stored ? parseInt(stored) : null);
    }, [diaId]);

    const iniciarSesion = useCallback(() => {
        if (!diaId) return;
        const startTime = Date.now();
        localStorage.setItem(getSesionKey(diaId), startTime.toString());
        setInicio(startTime);
        window.dispatchEvent(new Event('storage'));
    }, [diaId]);

    const tieneSesionActiva = useCallback(() => {
        if (!diaId) return false;
        return localStorage.getItem(getSesionKey(diaId)) !== null;
    }, [diaId]);

    const limpiarSesion = useCallback(() => {
        if (!diaId) return;
        localStorage.removeItem(getSesionKey(diaId));
        setInicio(null);
        window.dispatchEvent(new Event('storage'));
    }, [diaId]);

    return {
        inicio,
        iniciarSesion,
        tieneSesionActiva,
        limpiarSesion,
    };
}
