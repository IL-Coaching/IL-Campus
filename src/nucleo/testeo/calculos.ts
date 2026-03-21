// src/nucleo/testeo/calculos.ts
import { TABLA_PORCENTAJES } from "../planificacion/zonas.constantes";

/**
 * Calcula el 1RM usando la fórmula de O'Conner.
 * 1RM = Peso / (1,0278 − 0,0278 × reps)
 */
export function calcularUnRM(pesoKg: number, reps: number): number {
    if (reps === 1) return pesoKg;
    // Fórmula de O'Conner
    const unRM = pesoKg / (1.0278 - 0.0278 * reps);
    return Math.round(unRM * 10) / 10; // redondear a 1 decimal
}

/**
 * Calcula el peso para un porcentaje específico del 1RM.
 */
export function calcularPesoPorPorcentaje(
    unRM: number,
    porcentaje: number
): number {
    return Math.round((unRM * porcentaje / 100) * 10) / 10;
}

/**
 * Calcula la fuerza relativa (1RM / Peso Corporal).
 */
export function calcularFuerzaRelativa(
    unRM: number,
    pesoCorporal: number
): number {
    if (!pesoCorporal || pesoCorporal === 0) return 0;
    return Math.round((unRM / pesoCorporal) * 100) / 100;
}

/**
 * Genera la tabla completa de porcentajes basada en un 1RM.
 */
export function calcularTablaCompleta(unRM: number) {
    return TABLA_PORCENTAJES.map(fila => ({
        ...fila,
        pesoKg: calcularPesoPorPorcentaje(unRM, fila.porcentaje)
    }));
}

/**
 * Advierte si el número de repeticiones es demasiado alto para una estimación precisa.
 */
export function advertirPrecision(reps: number): string | null {
    if (reps > 10) {
        return 'Para mayor precisión se recomiendan entre 3 y 10 repeticiones. Con más de 10 reps la estimación puede perder exactitud.';
    }
    return null;
}

/**
 * Mapea una tabla de porcentajes a formato compatible con PorcentajesCliente.
 * Extrae los pesos para cada nivel de reps (1-18).
 */
export function mapearPorcentajesATabla(tabla: { reps: number; pesoKg: number }[]): {
    p100: number;
    p94_3: number;
    p90_6: number;
    p88_1: number;
    p85_6: number;
    p83_1: number;
    p80_7: number;
    p78_6: number;
    p76_5: number;
    p74_4: number;
    p72_3: number;
    p70_3: number;
    p68_8: number;
    p67_5: number;
    p66_2: number;
    p65_0: number;
    p63_8: number;
    p62_7: number;
} {
    const get = (reps: number) => tabla.find(f => f.reps === reps)?.pesoKg || 0;
    return {
        p100: get(1),
        p94_3: get(2),
        p90_6: get(3),
        p88_1: get(4),
        p85_6: get(5),
        p83_1: get(6),
        p80_7: get(7),
        p78_6: get(8),
        p76_5: get(9),
        p74_4: get(10),
        p72_3: get(11),
        p70_3: get(12),
        p68_8: get(13),
        p67_5: get(14),
        p66_2: get(15),
        p65_0: get(16),
        p63_8: get(17),
        p62_7: get(18),
    };
}
