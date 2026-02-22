import { differenceInDays } from "date-fns";

export type FaseCiclo = 'MENSTRUACION' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';

interface InfoFase {
    fase: FaseCiclo;
    titulo: string;
    recomendacion: string;
    intensidad: string;
    color: string;
}

export function calcularFaseMenstrual(fechaInicio: Date, duracionCiclo: number): InfoFase {
    const hoy = new Date();
    const diasTranscurridos = differenceInDays(hoy, fechaInicio) % duracionCiclo;

    // Fases estándar promedio
    if (diasTranscurridos >= 0 && diasTranscurridos <= 5) {
        return {
            fase: 'MENSTRUACION',
            titulo: 'Fase de Menstruación',
            intensidad: 'Baja / Recuperación',
            recomendacion: 'Cuerpo en limpieza. Bajá la carga si sentís fatiga, mantené el movimiento técnico.',
            color: '#EF4444'
        };
    } else if (diasTranscurridos > 5 && diasTranscurridos <= 12) {
        return {
            fase: 'FOLICULAR',
            titulo: 'Fase Folicular',
            intensidad: 'Alta / Máxima Potencia',
            recomendacion: 'Energía en ascenso. Buen momento para buscar RPEs altos y récords de fuerza.',
            color: '#3B82F6'
        };
    } else if (diasTranscurridos > 12 && diasTranscurridos <= 16) {
        return {
            fase: 'OVULATORIA',
            titulo: 'Fase Ovulatoria',
            intensidad: 'Pico de Fuerza',
            recomendacion: 'Máxima fuerza pero cuidado con los ligamentos. Mantené la intensidad alta.',
            color: '#F59E0B'
        };
    } else {
        return {
            fase: 'LUTEA',
            titulo: 'Fase Lútea',
            intensidad: 'Moderada / RIR Alto',
            recomendacion: 'Te cansás más rápido. No fuerces los límites, priorizá la técnica y el RIR conservador.',
            color: '#8B5CF6'
        };
    }
}
