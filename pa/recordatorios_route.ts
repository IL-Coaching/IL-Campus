import { NextResponse } from 'next/server';
import { prisma } from '@/baseDatos/conexion';
import { EmailServicio } from '@/nucleo/servicios/email.servicio';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const ahora = new Date();
        const haceSieteDias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const enTresDias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);

        const resultados = {
            checkinsPendientes: 0,
            membresiasPorVencer: 0,
            errores: [] as string[]
        };

        // 1. Check-ins pendientes - buscar clientes sin check-in reciente
        const clientes = await prisma.cliente.findMany({
            where: { activo: true },
            select: { 
                id: true, 
                email: true, 
                nombre: true
            }
        });

        for (const cliente of clientes) {
            const ultimoCheckin = await prisma.checkin.findFirst({
                where: { clienteId: cliente.id },
                orderBy: { fecha: 'desc' }
            });
            
            if (!ultimoCheckin || new Date(ultimoCheckin.fecha) < haceSieteDias) {
                try {
                    await EmailServicio.enviarRecordatorioCheckin({
                        email: cliente.email,
                        nombre: cliente.nombre
                    });
                    resultados.checkinsPendientes++;
                } catch (e) {
                    resultados.errores.push(`Error ${cliente.email}: ${e}`);
                }
            }
        }

        // 2. Membresías por vencer
        const planesPorVencer = await prisma.planAsignado.findMany({
            where: {
                fechaVencimiento: { gte: ahora, lte: enTresDias },
                estado: 'ACTIVO'
            },
            include: { cliente: { select: { email: true, nombre: true } } }
        });

        for (const plan of planesPorVencer) {
            try {
                await EmailServicio.enviarRecordatorioRenovacion({
                    email: plan.cliente.email,
                    nombre: plan.cliente.nombre,
                    fechaVencimiento: plan.fechaVencimiento
                });
                resultados.membresiasPorVencer++;
            } catch (e) {
                resultados.errores.push(`Error ${plan.cliente.email}: ${e}`);
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...resultados
        });

    } catch (error) {
        console.error('Error en cron de recordatorios:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}
