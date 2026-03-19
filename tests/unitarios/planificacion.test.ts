import { describe, it, expect } from 'vitest';
import { EsquemaActualizarEjercicio } from '../../src/nucleo/validadores/planificacion.validador';

describe('Validadores de Planificación — ModoMedicion', () => {
    
    it('debería validar correctamente un ejercicio en modo REPS (tradicional)', () => {
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'REPS',
            repsMin: 8,
            repsMax: 12,
            series: 3,
            RIR: 2
        });
        expect(result.success).toBe(true);
    });

    it('debería validar correctamente un ejercicio en modo TIEMPO', () => {
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'TIEMPO',
            tiempoObjetivoSeg: 60,
            repsMin: null,
            repsMax: null,
            series: 3
        });
        expect(result.success).toBe(true);
    });

    it('debería validar correctamente un ejercicio en modo AMRAP', () => {
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'AMRAP',
            repsMin: null,
            repsMax: null,
            tiempoObjetivoSeg: null,
            series: 1
        });
        expect(result.success).toBe(true);
    });

    it('debería admitir valores nulos para reps si el modo lo permite', () => {
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'TIEMPO',
            repsMin: null,
            repsMax: null,
            tiempoObjetivoSeg: 45
        });
        expect(result.success).toBe(true);
    });

    it('debería rechazar un tiempo negativo', () => {
        // Asumiendo que min(0) está en el validador
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'TIEMPO',
            tiempoObjetivoSeg: -10
        });
        expect(result.success).toBe(false);
    });

    it('debería admitir RIR nulo (N/A)', () => {
        const result = EsquemaActualizarEjercicio.safeParse({
            modoMedicion: 'TIEMPO',
            RIR: null
        });
        expect(result.success).toBe(true);
    });
});
