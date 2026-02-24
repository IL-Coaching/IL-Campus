import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const stats = await prisma.ejercicio.groupBy({
        by: ['entrenadorId', 'origen'],
        _count: {
            id: true
        }
    });
    console.log(JSON.stringify(stats, null, 2));

    const trainers = await prisma.entrenador.findMany({
        select: { id: true, nombre: true, email: true }
    });
    console.log('Trainers:', JSON.stringify(trainers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
