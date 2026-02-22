const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const client = await prisma.cliente.findFirst({
        where: { email: 'e2e-test@example.com' },
        include: {
            formularioInscripcion: true
        }
    });
    if (client) {
        console.log('Formulario Encontrado:', JSON.stringify(client.formularioInscripcion, null, 2));
    } else {
        console.log('Cliente no encontrado');
    }
}

main().finally(() => prisma.$disconnect());
