"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { obtenerGamificacion, sincronizarGamificacion } from '@/nucleo/acciones/gamificacion.accion';

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
    dbSynced: boolean;
    agregarXP: (cantidad: number, motivo: string) => void;
    actualizarRacha: (diasConsecutivos: number) => void;
    registrarCheckin: () => void;
    desbloquearLogro: (logroId: string) => void;
    getNivelActual: () => number;
    getXPSiguienteNivel: () => number;
    getProgresoNivel: () => number;
    hidratarDesdeDB: () => Promise<void>;
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
            dbSynced: false,

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            agregarXP: (cantidad: number, _motivo?: string): void => {
                const state = get();
                const nuevoXP = state.xp + cantidad;
                const nuevoNivel = Math.floor(nuevoXP / 500) + 1;
                set({ xp: nuevoXP, nivel: nuevoNivel });
                // Background DB Sync
                sincronizarGamificacion({
                    xp: nuevoXP, nivel: nuevoNivel, rachas: state.rachas,
                    maxRacha: state.maxRacha, ultimoCheckin: state.ultimoCheckin,
                    logrosDesbloqueados: state.logrosDesbloqueados,
                }).catch(e => console.error("Error al sincronizar gamificación", e));
            },

            actualizarRacha: (diasConsecutivos: number) => {
                const state = get();
                const nuevaRacha = Math.max(state.rachas, diasConsecutivos);
                const nuevaMaxRacha = Math.max(state.maxRacha, nuevaRacha);
                set({ rachas: nuevaRacha, maxRacha: nuevaMaxRacha });

                sincronizarGamificacion({
                    xp: state.xp, nivel: state.nivel, rachas: nuevaRacha,
                    maxRacha: nuevaMaxRacha, ultimoCheckin: state.ultimoCheckin,
                    logrosDesbloqueados: state.logrosDesbloqueados,
                }).catch(e => console.error(e));
            },

            registrarCheckin: () => {
                const ahora = new Date().toISOString();
                set({ ultimoCheckin: ahora });
                get().agregarXP(20, 'Check-in enviado'); // Esto ya llama a sincronizar
            },

            desbloquearLogro: (logroId: string) => {
                const state = get();
                const yaDesbloqueado = state.logrosDesbloqueados.some((l: LogroDesbloqueado) => l.logroId === logroId);
                if (yaDesbloqueado) return;

                const logro = LOGROS.find((l: Logro) => l.id === logroId);
                if (!logro) return;

                const nuevosLogros = [
                    ...state.logrosDesbloqueados,
                    { logroId, unlockedAt: new Date() }
                ];

                set({ logrosDesbloqueados: nuevosLogros });

                // Actualiza SQL Background antes de invocar agregarXP, para no duplicar llamadas innecesarias, igual agregarXP terminará salvando todo
                get().agregarXP(logro.xpRecompensa, `Logro: ${logro.titulo}`);
            },

            getNivelActual: () => get().nivel,
            getXPSiguienteNivel: () => (get().nivel + 1) * 500,
            getProgresoNivel: () => {
                const state = get();
                const xpInicioNivel = (state.nivel - 1) * 500;
                const xpProgreso = state.xp - xpInicioNivel;
                return Math.min(100, (xpProgreso / 500) * 100);
            },

            hidratarDesdeDB: async () => {
                // Prevenimos múltiple fetching si ya se cargó en la sesión
                if (get().dbSynced) return;

                try {
                    const rescate = await obtenerGamificacion();
                    if (rescate.exito && rescate.datos) {
                        const { experiencia, nivel, rachaDias, ultimoCheckin, logrosGenerales } = rescate.datos;

                        // Formateamos logros desde string[] en la DB a LogroDesbloqueado[] temporal para Zustand
                        const logrosConvertidos: LogroDesbloqueado[] = logrosGenerales.map((id: string) => ({
                            logroId: id,
                            unlockedAt: new Date(), // En este setup simple la DB guarda strings
                        }));

                        // Verificamos quién tiene la verdad para no pisar el progreso offline 
                        // En un escenario real se consolida usando timestamps, pero priorizaremos un max:
                        const estadoLocal = get();
                        const finalXp = Math.max(estadoLocal.xp, experiencia);
                        const finalNivel = Math.max(estadoLocal.nivel, nivel);
                        const finalRacha = Math.max(estadoLocal.rachas, rachaDias);

                        set({
                            xp: finalXp,
                            nivel: finalNivel,
                            rachas: finalRacha,
                            // Mantenemos max local
                            ultimoCheckin: ultimoCheckin ? ultimoCheckin.toISOString() : estadoLocal.ultimoCheckin,
                            logrosDesbloqueados: logrosConvertidos.length > estadoLocal.logrosDesbloqueados.length ? logrosConvertidos : estadoLocal.logrosDesbloqueados,
                            dbSynced: true
                        });
                    }
                } catch (e) {
                    console.error("Error al hidratar gamificación local:", e);
                }
            }
        }),
        {
            name: 'il-campus-gamificacion',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export { LOGROS };
