const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const clientes = await prisma.cliente.findMany({
            select: {
                id: true,
                email: true,
                nombre: true,
                forcePasswordChange: true
            }
        });
        console.log('--- CLIENTES ---');
        console.log(JSON.stringify(clientes, null, 2));
        console.log('--- FIN ---');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
