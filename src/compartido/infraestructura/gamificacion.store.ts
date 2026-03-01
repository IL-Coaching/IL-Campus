"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Logro {
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
    category: 'sesiones' | 'checkins' | 'fuerza' | 'consistencia' | 'especial';
    requerido: number;
    xpRecompensa: number;
    unlockedAt?: Date;
}

export interface LogroDesbloqueado {
    logroId: string;
    unlockedAt: Date;
}

interface GamificacionState {
    xp: number;
    nivel: number;
    rachas: number;
    maxRacha: number;
    ultimoCheckin: string | null;
    logrosDesbloqueados: LogroDesbloqueado[];
    agregarXP: (cantidad: number, motivo: string) => void;
    actualizarRacha: (diasConsecutivos: number) => void;
    registrarCheckin: () => void;
    desbloquearLogro: (logroId: string) => void;
    getNivelActual: () => number;
    getXPSiguienteNivel: () => number;
    getProgresoNivel: () => number;
}

const LOGROS: Logro[] = [
    { id: 'primera_sesion', titulo: 'Primera Sesión', descripcion: 'Completa tu primera rutina', icono: '🎯', category: 'sesiones', requerido: 1, xpRecompensa: 50 },
    { id: 'cinco_sesiones', titulo: 'En Marcha', descripcion: 'Completa 5 rutinas', icono: '💪', category: 'sesiones', requerido: 5, xpRecompensa: 100 },
    { id: 'diez_sesiones', titulo: 'Consistente', descripcion: 'Completa 10 rutinas', icono: '🔥', category: 'sesiones', requerido: 10, xpRecompensa: 200 },
    { id: 'cincuentas_sesiones', titulo: 'Veterano', descripcion: 'Completa 50 rutinas', icono: '🏆', category: 'sesiones', requerido: 50, xpRecompensa: 500 },
    { id: 'cien_sesiones', titulo: 'Leyenda', descripcion: 'Completa 100 rutinas', icono: '👑', category: 'sesiones', requerido: 100, xpRecompensa: 1000 },
    { id: 'primer_checkin', titulo: 'Auto-evaluación', descripcion: 'Envía tu primer check-in', icono: '📸', category: 'checkins', requerido: 1, xpRecompensa: 30 },
    { id: 'cinco_checkins', titulo: 'Seguimiento', descripcion: 'Envía 5 check-ins', icono: '📊', category: 'checkins', requerido: 5, xpRecompensa: 75 },
    { id: 'diez_checkins', titulo: 'Disciplinado', descripcion: 'Envía 10 check-ins', icono: '📈', category: 'checkins', requerido: 10, xpRecompensa: 150 },
    { id: 'racha_7', titulo: 'En Llamas', descripcion: '7 días de entrenamiento consecutivo', icono: '🔥', category: 'consistencia', requerido: 7, xpRecompensa: 150 },
    { id: 'racha_30', titulo: 'Inquebrantable', descripcion: '30 días de entrenamiento consecutivo', icono: '⚡', category: 'consistencia', requerido: 30, xpRecompensa: 500 },
    { id: 'primer_pr', titulo: 'Nuevo Récord', descripcion: 'Alcanza tu primer peso máximo', icono: '💎', category: 'fuerza', requerido: 1, xpRecompensa: 100 },
    { id: 'cinco_prs', titulo: 'Progresando', descripcion: 'Alcanza 5 pesos máximos', icono: '📈', category: 'fuerza', requerido: 5, xpRecompensa: 250 },
];

export const useGamificacionStore = create<GamificacionState>()(
    persist(
        (set, get) => ({
            xp: 0,
            nivel: 1,
            rachas: 0,
            maxRacha: 0,
            ultimoCheckin: null,
            logrosDesbloqueados: [],

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            agregarXP: (cantidad: number, _motivo?: string): void => {
                const state = get();
                const nuevoXP = state.xp + cantidad;
                const nuevoNivel = Math.floor(nuevoXP / 500) + 1;
                set({ xp: nuevoXP, nivel: nuevoNivel });
            },

            actualizarRacha: (diasConsecutivos: number) => {
                const state = get();
                const nuevaRacha = Math.max(state.rachas, diasConsecutivos);
                const nuevaMaxRacha = Math.max(state.maxRacha, nuevaRacha);
                set({ rachas: nuevaRacha, maxRacha: nuevaMaxRacha });
            },

            registrarCheckin: () => {
                const ahora = new Date().toISOString();
                set({ ultimoCheckin: ahora });
                get().agregarXP(20, 'Check-in enviado');
            },

            desbloquearLogro: (logroId: string) => {
                const state = get();
                const yaDesbloqueado = state.logrosDesbloqueados.some((l: LogroDesbloqueado) => l.logroId === logroId);
                if (yaDesbloqueado) return;
                
                const logro = LOGROS.find((l: Logro) => l.id === logroId);
                if (!logro) return;
                
                set({
                    logrosDesbloqueados: [
                        ...state.logrosDesbloqueados,
                        { logroId, unlockedAt: new Date() }
                    ]
                });
                get().agregarXP(logro.xpRecompensa, `Logro: ${logro.titulo}`);
            },

            getNivelActual: () => get().nivel,
            getXPSiguienteNivel: () => (get().nivel + 1) * 500,
            getProgresoNivel: () => {
                const state = get();
                const xpInicioNivel = (state.nivel - 1) * 500;
                const xpProgreso = state.xp - xpInicioNivel;
                return Math.min(100, (xpProgreso / 500) * 100);
            }
        }),
        {
            name: 'il-campus-gamificacion',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export { LOGROS };
