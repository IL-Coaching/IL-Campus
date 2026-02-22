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
