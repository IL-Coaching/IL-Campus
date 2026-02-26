import { describe, it, expect } from 'vitest';
import { CriptoServicio } from '../../src/nucleo/seguridad/cripto';

describe('CriptoServicio', () => {
    describe('generarCodigoActivacion', () => {
        it('debería tener el formato correcto IL-XXXX-XXX', () => {
            const codigo = CriptoServicio.generarCodigoActivacion();

            // Debe comenzar con IL-
            expect(codigo.startsWith('IL-')).toBe(true);

            // Debe coincidir con el regex exacto (letras mayus o numeros)
            expect(codigo).toMatch(/^IL-[A-Z0-9]{4}-[A-Z0-9]{3}$/);

            // Longitud total: 3 (IL-) + 4 + 1 (-) + 3 = 11
            expect(codigo.length).toBe(11);
        });

        it('debería generar códigos únicos', () => {
            const codigo1 = CriptoServicio.generarCodigoActivacion();
            const codigo2 = CriptoServicio.generarCodigoActivacion();

            expect(codigo1).not.toBe(codigo2);
        });
    });

    describe('generateRandomToken', () => {
        it('debería generar un token del tamaño solicitado', () => {
            const token16 = CriptoServicio.generateRandomToken(16);
            expect(token16.length).toBe(16);

            const token32 = CriptoServicio.generateRandomToken(32);
            expect(token32.length).toBe(32);
        });
    });
});
