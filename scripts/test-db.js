const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Probando conexión a la base de datos...');
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('Resultado:', result);
        console.log('Conexión exitosa.');
    } catch (error) {
        console.error('Error al conectar:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
