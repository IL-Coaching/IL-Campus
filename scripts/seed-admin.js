const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log('Iniciando creación de cuenta de Entrenador (Admin)...');

        const admin = await prisma.entrenador.upsert({
            where: { email: 'legarretatraining@gmail.com' },
            update: {
                nombre: 'Iñaki Legarreta',
                telefono: '+543425555607',
                activo: true
            },
            create: {
                nombre: 'Iñaki Legarreta',
                email: 'legarretatraining@gmail.com',
                telefono: '+543425555607',
                activo: true
            }
        });

        console.log('✅ Entrenador creado/actualizado con éxito:', admin);
    } catch (error) {
        console.error('❌ Error al crear el entrenador:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
