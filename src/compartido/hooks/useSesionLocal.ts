import { useState, useEffect } from 'react';

interface SesionLocalState {
    inicio: number | null;
    final: number | null;
    duracionMinutos: number | null;
}

const DEFAULT_STATE: SesionLocalState = {
    inicio: null,
    final: null,
    duracionMinutos: null,
};

export function useSesionLocal(diaId: string) {
    const [state, setState] = useState<SesionLocalState>(DEFAULT_STATE);

    useEffect(() => {
        const stored = localStorage.getItem(`sesion_${diaId}`);
        if (stored) {
            try {
                setState(JSON.parse(stored));
            } catch {
                setState(DEFAULT_STATE);
            }
        }
    }, [diaId]);

    const iniciarSesion = () => {
        const newState: SesionLocalState = {
            inicio: Date.now(),
            final: null,
            duracionMinutos: null,
        };
        setState(newState);
        localStorage.setItem(`sesion_${diaId}`, JSON.stringify(newState));
        localStorage.setItem(`sesion_inicio_${diaId}`, String(newState.inicio));
    };

    const finalizarSesion = () => {
        const final = Date.now();
        const duracionMinutos = state.inicio 
            ? Math.round((final - state.inicio) / 60000) 
            : null;
        
        const newState: SesionLocalState = {
            inicio: state.inicio,
            final,
            duracionMinutos,
        };
        setState(newState);
        localStorage.setItem(`sesion_${diaId}`, JSON.stringify(newState));
        localStorage.removeItem(`sesion_inicio_${diaId}`);
    };

    const limpiarSesion = () => {
        setState(DEFAULT_STATE);
        localStorage.removeItem(`sesion_${diaId}`);
        localStorage.removeItem(`sesion_inicio_${diaId}`);
    };

    return {
        ...state,
        iniciarSesion,
        finalizarSesion,
        limpiarSesion,
    };
}
