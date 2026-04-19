import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dispararAlertasFormularios } from '../../src/nucleo/acciones/notificacion.accion';
import { prisma } from '../../src/baseDatos/conexion';
import * as sesion from '../../src/nucleo/seguridad/sesion';
import { TipoNotificacion, GravedadNotificacion } from '@prisma/client';

// Mock de las dependencias externas
vi.mock('../../src/baseDatos/conexion', () => ({
    prisma: {
        cliente: {
            findMany: vi.fn()
        },
        notificacion: {
            findFirst: vi.fn(),
            create: vi.fn(),
        }
    }
}));

vi.mock('../../src/nucleo/seguridad/sesion', () => ({
    getEntrenadorSesion: vi.fn()
}));

// Mock para revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Notificacion Acciones - dispararAlertasFormularios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock default entrenador
        vi.mocked(sesion.getEntrenadorSesion).mockResolvedValue({ id: 'entrenador-123' } as any);
    });

    it('deberia ignorar prospectos que ya tienen una notificacion reciente', async () => {
        // Setup prospectos
        vi.mocked(prisma.cliente.findMany).mockResolvedValue([
            { id: 'cliente-1', nombre: 'Juan Perez', entrenadorId: 'entrenador-123' } as any
        ]);

        // Simular que YA existe una notificación para "Juan Perez"
        vi.mocked(prisma.notificacion.findFirst).mockResolvedValue({
            id: 'notif-1',
            entrenadorId: 'entrenador-123',
            tipo: TipoNotificacion.NUEVO_FORMULARIO
        } as any);

        const result = await dispararAlertasFormularios();

        expect(result.exito).toBe(true);
        expect(prisma.notificacion.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                entrenadorId: 'entrenador-123',
                tipo: TipoNotificacion.NUEVO_FORMULARIO,
                cuerpo: { contains: 'Juan Perez' }
            })
        }));

        // NO debería crear notificación
        expect(prisma.notificacion.create).not.toHaveBeenCalled();
    });

    it('deberia crear una nueva notificacion si el prospecto no tiene una previa', async () => {
        // Setup prospectos
        vi.mocked(prisma.cliente.findMany).mockResolvedValue([
            { id: 'cliente-1', nombre: 'Maria Gomez', entrenadorId: 'entrenador-123' } as any
        ]);

        // Simular que NO existe una notificación para "Maria Gomez"
        vi.mocked(prisma.notificacion.findFirst).mockResolvedValue(null);

        const result = await dispararAlertasFormularios();

        expect(result.exito).toBe(true);

        // DEBERÍA crear notificación con los datos actualizados
        expect(prisma.notificacion.create).toHaveBeenCalledWith(expect.objectContaining({
            data: {
                entrenadorId: 'entrenador-123',
                tipo: TipoNotificacion.NUEVO_FORMULARIO,
                gravedad: GravedadNotificacion.INFO,
                titulo: 'Formulario Pendiente: Maria Gomez',
                cuerpo: 'El prospecto Maria Gomez envió su formulario y aún no tiene un plan asignado.',
                enlace: '/entrenador/clientes/cliente-1'
            }
        }));
    });
});
