import { describe, it, expect } from 'vitest';
import { EsquemaActualizarEjercicio } from '../../src/nucleo/validadores/planificacion.validador';

describe('ejercicio-planificado.accion — Validadores', () => {

    describe('EsquemaActualizarEjercicio — modos de medición', () => {
        it('debería aceptar modo REPS con parámetros válidos', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'REPS',
                series: 4,
                repsMin: 6,
                repsMax: 10,
                RIR: 2,
                descanso: 120,
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar modo TIEMPO', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'TIEMPO',
                tiempoObjetivoSeg: 45,
                repsMin: null,
                repsMax: null,
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar modo AMRAP', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'AMRAP',
                series: 3,
                repsMin: null,
                repsMax: null,
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar modo de medición inválido', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'PORCENTAJE',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaActualizarEjercicio — rangos y límites', () => {
        it('debería rechazar series mayor a 20', () => {
            const result = EsquemaActualizarEjercicio.safeParse({ series: 21 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar repsMin negativo', () => {
            const result = EsquemaActualizarEjercicio.safeParse({ repsMin: -1 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar repsMax mayor a 100', () => {
            const result = EsquemaActualizarEjercicio.safeParse({ repsMax: 101 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar RIR mayor a 10', () => {
            const result = EsquemaActualizarEjercicio.safeParse({ RIR: 11 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar descanso mayor a 600 segundos', () => {
            const result = EsquemaActualizarEjercicio.safeParse({ descanso: 601 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar tiempoObjetivoSeg negativo', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'TIEMPO',
                tiempoObjetivoSeg: -10,
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar tiempoObjetivoSeg mayor a 7200 segundos (2hs)', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                modoMedicion: 'TIEMPO',
                tiempoObjetivoSeg: 7201,
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar tempo mayor a 10 caracteres', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                tempo: '30-0-30-0X',  // 10 chars — válido
            });
            expect(result.success).toBe(true);

            const resultInvalido = EsquemaActualizarEjercicio.safeParse({
                tempo: '30-0-30-0-XX',  // 12 chars — inválido
            });
            expect(resultInvalido.success).toBe(false);
        });

        it('debería rechazar notas con más de 500 caracteres', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                notas: 'x'.repeat(501),
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaActualizarEjercicio — ejercicio libre vs biblioteca', () => {
        it('debería aceptar ejercicio de biblioteca con UUID válido', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                ejercicioId: '123e4567-e89b-12d3-a456-426614174000',
                esBiblioteca: true,
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar ejercicioId con formato inválido', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                ejercicioId: 'no-es-un-uuid',
                esBiblioteca: true,
            });
            expect(result.success).toBe(false);
        });

        it('debería aceptar ejercicio libre con nombreLibre', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                ejercicioId: null,
                nombreLibre: 'Cardio libre',
                esBiblioteca: false,
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar nombreLibre con más de 100 caracteres', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                nombreLibre: 'x'.repeat(101),
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaActualizarEjercicio — testeo', () => {
        it('debería aceptar modalidad de testeo DIRECTO', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                esTesteo: true,
                modalidadTesteo: 'DIRECTO',
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar modalidad de testeo INDIRECTO', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                esTesteo: true,
                modalidadTesteo: 'INDIRECTO',
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar modalidad de testeo inválida', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                esTesteo: true,
                modalidadTesteo: 'ESTIMADO',
            });
            expect(result.success).toBe(false);
        });

        it('debería aceptar modalidadTesteo null (no es testeo)', () => {
            const result = EsquemaActualizarEjercicio.safeParse({
                esTesteo: false,
                modalidadTesteo: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe('EsquemaActualizarEjercicio — objeto vacío', () => {
        it('debería aceptar actualización sin campos (todos opcionales)', () => {
            const result = EsquemaActualizarEjercicio.safeParse({});
            expect(result.success).toBe(true);
        });
    });
});
