import { describe, it, expect } from 'vitest';
import {
    EsquemaNuevoMacrociclo,
    EsquemaActualizarMacrociclo,
    EsquemaNuevoMesociclo,
    EsquemaActualizarMesociclo,
    EsquemaActualizarSemana,
} from '../../src/nucleo/validadores/planificacion.validador';

describe('macrociclo.accion — Validadores', () => {

    describe('EsquemaNuevoMacrociclo', () => {
        it('debería aceptar duración y fecha válidas', () => {
            const result = EsquemaNuevoMacrociclo.safeParse({
                duracion: '12',
                fechaInicio: '2026-01-01',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.duracion).toBe(12);
                expect(result.data.fechaInicio).toBeInstanceOf(Date);
            }
        });

        it('debería rechazar duración cero', () => {
            const result = EsquemaNuevoMacrociclo.safeParse({
                duracion: '0',
                fechaInicio: '2026-01-01',
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar duración mayor a 104 semanas', () => {
            const result = EsquemaNuevoMacrociclo.safeParse({
                duracion: '105',
                fechaInicio: '2026-01-01',
            });
            expect(result.success).toBe(false);
        });

        it('debería aceptar duración en el límite máximo (104)', () => {
            const result = EsquemaNuevoMacrociclo.safeParse({
                duracion: '104',
                fechaInicio: '2026-06-01',
            });
            expect(result.success).toBe(true);
        });
    });

    describe('EsquemaActualizarMacrociclo', () => {
        it('debería aceptar todos los campos opcionales', () => {
            const result = EsquemaActualizarMacrociclo.safeParse({
                duracionSemanas: 8,
                notas: 'Fase de preparación general',
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar un objeto vacío (sin cambios)', () => {
            const result = EsquemaActualizarMacrociclo.safeParse({});
            expect(result.success).toBe(true);
        });

        it('debería rechazar notas que excedan 1000 caracteres', () => {
            const result = EsquemaActualizarMacrociclo.safeParse({
                notas: 'x'.repeat(1001),
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar duracionSemanas mayor a 104', () => {
            const result = EsquemaActualizarMacrociclo.safeParse({
                duracionSemanas: 200,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaNuevoMesociclo', () => {
        it('debería aceptar un mesociclo mínimo válido', () => {
            const result = EsquemaNuevoMesociclo.safeParse({
                objetivo: 'Hipertrofia',
                numeroMes: 1,
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar todos los campos opcionales', () => {
            const result = EsquemaNuevoMesociclo.safeParse({
                nombre: 'Bloque A',
                objetivo: 'Fuerza máxima',
                metodo: 'Progresión lineal',
                rangoReferencia: '3-5 reps',
                numeroMes: 2,
                numSemanas: 4,
                numSesiones: 4,
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar objetivo vacío', () => {
            const result = EsquemaNuevoMesociclo.safeParse({
                objetivo: '',
                numeroMes: 1,
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar numeroMes fuera de rango', () => {
            const resultCero = EsquemaNuevoMesociclo.safeParse({ objetivo: 'Test', numeroMes: 0 });
            const resultMax = EsquemaNuevoMesociclo.safeParse({ objetivo: 'Test', numeroMes: 25 });
            expect(resultCero.success).toBe(false);
            expect(resultMax.success).toBe(false);
        });

        it('debería rechazar numSesiones mayor a 14', () => {
            const result = EsquemaNuevoMesociclo.safeParse({
                objetivo: 'Test',
                numeroMes: 1,
                numSesiones: 15,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaActualizarMesociclo', () => {
        it('debería aceptar actualización parcial', () => {
            const result = EsquemaActualizarMesociclo.safeParse({
                objetivo: 'Potencia explosiva',
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar duración 0 o negativa', () => {
            const result = EsquemaActualizarMesociclo.safeParse({ duracion: 0 });
            expect(result.success).toBe(false);
        });

        it('debería rechazar duración mayor a 12 meses', () => {
            const result = EsquemaActualizarMesociclo.safeParse({ duracion: 13 });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaActualizarSemana', () => {
        it('debería aceptar una semana con todos los campos', () => {
            const result = EsquemaActualizarSemana.safeParse({
                objetivoSemana: 'Semana de choque',
                RIRobjetivo: 2,
                volumenEstimado: 'Alto',
                esFaseDeload: false,
                esSemanaTesteo: false,
                tipoCarga: 'CHOQUE',
                modeloPeriodizacion: 'LINEAL',
                checkinRequerido: true,
            });
            expect(result.success).toBe(true);
        });

        it('debería aceptar un objeto vacío', () => {
            const result = EsquemaActualizarSemana.safeParse({});
            expect(result.success).toBe(true);
        });

        it('debería rechazar RIRobjetivo fuera del rango 0-10', () => {
            const resultNeg = EsquemaActualizarSemana.safeParse({ RIRobjetivo: -1 });
            const resultMax = EsquemaActualizarSemana.safeParse({ RIRobjetivo: 11 });
            expect(resultNeg.success).toBe(false);
            expect(resultMax.success).toBe(false);
        });

        it('debería rechazar tipoCarga con valor inválido', () => {
            const result = EsquemaActualizarSemana.safeParse({
                tipoCarga: 'SUPER_CARGA_INVALIDA',
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar modeloPeriodizacion con valor inválido', () => {
            const result = EsquemaActualizarSemana.safeParse({
                modeloPeriodizacion: 'BLOQUE',
            });
            expect(result.success).toBe(false);
        });

        it('debería aceptar una semana de deload', () => {
            const result = EsquemaActualizarSemana.safeParse({
                esFaseDeload: true,
                RIRobjetivo: 4,
                tipoCarga: 'DESCARGA_TEST',
            });
            expect(result.success).toBe(true);
        });
    });
});
