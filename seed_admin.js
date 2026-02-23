const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
    try {
        const email = 'legarretatraining@gmail.com';
        const passwordPlana = 'Inaki2024*';
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(passwordPlana, salt);

        console.log('Creando entrenador...');

        // Primero intentamos buscarlo
        const existente = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (existente) {
            await prisma.entrenador.update({
                where: { id: existente.id },
                data: { password: passwordHash }
            });
            console.log('✅ Password actualizada para:', email);
        } else {
            await prisma.entrenador.create({
                data: {
                    nombre: 'Inaki Legarreta',
                    email: email,
                    password: passwordHash
                }
            });
            console.log('✅ Entrenador creado:', email);
        }

        console.log('Contraseña seteada a:', passwordPlana);

    } catch (error) {
        console.error('❌ Error de seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main = seed;
main();
