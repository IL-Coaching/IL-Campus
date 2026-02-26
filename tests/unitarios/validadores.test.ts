import { describe, it, expect } from 'vitest';
import { EsquemaLoginEntrenador, EsquemaResetPassword, EsquemaVerificarMFA } from '../../src/nucleo/validadores/auth.validador';

describe('Validadores de Autenticación', () => {
    describe('EsquemaLoginEntrenador', () => {
        it('debería aceptar credenciales válidas', () => {
            const result = EsquemaLoginEntrenador.safeParse({
                email: 'entrenador@il-campus.com',
                password: 'passwordSegura123'
            });
            expect(result.success).toBe(true);
        });

        it('debería rechazar email en formato incorrecto', () => {
            const result = EsquemaLoginEntrenador.safeParse({
                email: 'entrenador_sin_arroba',
                password: 'passwordSegura123'
            });
            expect(result.success).toBe(false);
        });

        it('debería rechazar contraseñas muy cortas', () => {
            const result = EsquemaLoginEntrenador.safeParse({
                email: 'entrenador@il-campus.com',
                password: '123'
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaResetPassword', () => {
        it('debería validar correctamente si las contraseñas coinciden y cumplen robustez', () => {
            const result = EsquemaResetPassword.safeParse({
                token: 'token-valido',
                password: 'PasswordSegura1',
                confirmPassword: 'PasswordSegura1'
            });
            expect(result.success).toBe(true);
        });

        it('debería fallar si las contraseñas no coinciden', () => {
            const result = EsquemaResetPassword.safeParse({
                token: 'token-valido',
                password: 'PasswordSegura1',
                confirmPassword: 'PasswordSegura2'
            });
            expect(result.success).toBe(false);
        });

        it('debería fallar si falta número o mayúscula', () => {
            const result = EsquemaResetPassword.safeParse({
                token: 'token-valido',
                password: 'passwordmin',
                confirmPassword: 'passwordmin'
            });
            expect(result.success).toBe(false);
        });
    });

    describe('EsquemaVerificarMFA', () => {
        it('debería aceptar código de 6 dígitos numéricos', () => {
            const result = EsquemaVerificarMFA.safeParse({ code: '123456' });
            expect(result.success).toBe(true);
        });

        it('debería rechazar códigos no numéricos', () => {
            const result = EsquemaVerificarMFA.safeParse({ code: '1234AB' });
            expect(result.success).toBe(false);
        });
    });
});
