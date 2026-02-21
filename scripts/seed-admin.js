const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('--- Iniciando Seeding Real ---');

        // 1. Crear Entrenador (Admin)
        const admin = await prisma.entrenador.upsert({
            where: { email: 'legarretatraining@gmail.com' },
            update: {
                nombre: 'Iñaki Legarreta',
                password: 'admin123', // En producción usar hash
                activo: true
            },
            create: {
                nombre: 'Iñaki Legarreta',
                email: 'legarretatraining@gmail.com',
                password: 'admin123',
                telefono: '+543425555607',
                activo: true
            }
        });
        console.log('✅ Entrenador (Admin) listo. Login: legarretatraining@gmail.com / admin123');

        // 2. Crear Alumno de Prueba
        const alumno = await prisma.cliente.upsert({
            where: { email: 'alumno@prueba.com' },
            update: {
                password: 'alumno123'
            },
            create: {
                nombre: 'Alumno de Prueba',
                email: 'alumno@prueba.com',
                password: 'alumno123',
                entrenadorId: admin.id,
                activo: true
            }
        });
        console.log('✅ Alumno de prueba listo. Login: alumno@prueba.com / alumno123');

    } catch (error) {
        console.error('❌ Error en el seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
