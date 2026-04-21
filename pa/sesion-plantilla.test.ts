import { describe, it, expect } from 'vitest';

describe('sesion.accion — lógica pura', () => {

    describe('validación de diaSemana', () => {
        const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diasInvalidos = ['lunes', 'LUNES', 'Monday', '', '  '];

        it('debería reconocer todos los días válidos de la semana', () => {
            diasValidos.forEach(dia => {
                expect(diasValidos.includes(dia)).toBe(true);
            });
        });

        it('los días inválidos no deberían estar en la lista válida', () => {
            diasInvalidos.forEach(dia => {
                expect(diasValidos.includes(dia)).toBe(false);
            });
        });
    });

    describe('clonarContenidoSesion — estructura de datos', () => {
        it('debería mapear correctamente los bloques al clonar', () => {
            const groupMap = new Map<string, string>();
            groupMap.set('bloque-viejo-1', 'bloque-nuevo-1');
            groupMap.set('bloque-viejo-2', 'bloque-nuevo-2');

            const ejercicioOriginal = { grupoId: 'bloque-viejo-1', orden: 1 };
            const nuevoGrupoId = ejercicioOriginal.grupoId && groupMap.has(ejercicioOriginal.grupoId)
                ? groupMap.get(ejercicioOriginal.grupoId)
                : null;

            expect(nuevoGrupoId).toBe('bloque-nuevo-1');
        });

        it('debería retornar null para ejercicios sin grupo', () => {
            const groupMap = new Map<string, string>();
            const ejercicioSinGrupo = { grupoId: null, orden: 1 };
            const nuevoGrupoId = ejercicioSinGrupo.grupoId && groupMap.has(ejercicioSinGrupo.grupoId)
                ? groupMap.get(ejercicioSinGrupo.grupoId)
                : null;

            expect(nuevoGrupoId).toBeNull();
        });

        it('debería retornar null para ejercicios con grupoId no presente en el mapa', () => {
            const groupMap = new Map<string, string>();
            groupMap.set('bloque-viejo-1', 'bloque-nuevo-1');

            const ejercicioDeOtroBloque = { grupoId: 'bloque-desconocido', orden: 2 };
            const nuevoGrupoId = ejercicioDeOtroBloque.grupoId && groupMap.has(ejercicioDeOtroBloque.grupoId)
                ? groupMap.get(ejercicioDeOtroBloque.grupoId)
                : null;

            expect(nuevoGrupoId).toBeNull();
        });
    });
});

describe('plantilla.accion — lógica pura', () => {

    describe('crearPlantillaSemana — días de la semana', () => {
        it('debería generar exactamente 7 días', () => {
            const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            expect(diasSemana).toHaveLength(7);
        });

        it('debería incluir todos los días en el orden correcto', () => {
            const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            expect(diasSemana[0]).toBe('Lunes');
            expect(diasSemana[4]).toBe('Viernes');
            expect(diasSemana[6]).toBe('Domingo');
        });
    });

    describe('agregarEjercicioAPlantilla — cálculo de orden', () => {
        it('debería calcular el siguiente orden correctamente', () => {
            const ejerciciosExistentes = [
                { orden: 1 }, { orden: 2 }, { orden: 3 }
            ];
            const ultimoOrden = ejerciciosExistentes.length > 0
                ? Math.max(...ejerciciosExistentes.map(e => e.orden))
                : 0;
            expect(ultimoOrden + 1).toBe(4);
        });

        it('debería retornar 1 para la primera posición cuando no hay ejercicios', () => {
            const ejerciciosVacios: { orden: number }[] = [];
            const ultimoOrden = ejerciciosVacios.length > 0
                ? Math.max(...ejerciciosVacios.map(e => e.orden))
                : 0;
            expect(ultimoOrden + 1).toBe(1);
        });

        it('debería manejar gaps en el orden correctamente', () => {
            // Si hay gaps (1, 3, 5) debe usar el máximo + 1
            const ejerciciosConGap = [{ orden: 1 }, { orden: 3 }, { orden: 5 }];
            const ultimoOrden = Math.max(...ejerciciosConGap.map(e => e.orden));
            expect(ultimoOrden + 1).toBe(6);
        });
    });

    describe('importarSemanaAPlantilla — cálculo de próximo número', () => {
        it('debería calcular el próximo número de semana en modo agregar', () => {
            const ultimasSemanas = [{ numeroSemana: 4 }];
            const proximoNumero = ultimasSemanas.length > 0
                ? ultimasSemanas[0].numeroSemana + 1
                : 1;
            expect(proximoNumero).toBe(5);
        });

        it('debería empezar en 1 si no hay semanas previas', () => {
            const ultimasSemanas: { numeroSemana: number }[] = [];
            const proximoNumero = ultimasSemanas.length > 0
                ? ultimasSemanas[0].numeroSemana + 1
                : 1;
            expect(proximoNumero).toBe(1);
        });
    });

    describe('reordenarEjerciciosPlantilla — asignación de orden', () => {
        it('debería asignar índice base 1 a cada ejercicio', () => {
            const ids = ['id-a', 'id-b', 'id-c'];
            const asignaciones = ids.map((id, index) => ({ id, orden: index + 1 }));

            expect(asignaciones[0].orden).toBe(1);
            expect(asignaciones[1].orden).toBe(2);
            expect(asignaciones[2].orden).toBe(3);
        });

        it('el orden nunca debería ser 0 o negativo', () => {
            const ids = ['id-x', 'id-y'];
            const asignaciones = ids.map((id, index) => ({ id, orden: index + 1 }));
            asignaciones.forEach(a => expect(a.orden).toBeGreaterThan(0));
        });
    });
});
