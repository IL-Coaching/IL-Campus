const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const entrenadores = await prisma.entrenador.findMany({
            select: {
                id: true,
                email: true,
                nombre: true
            }
        });
        console.log('--- RESULTADOS ---');
        console.log(JSON.stringify(entrenadores, null, 2));
        console.log('--- FIN ---');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
