const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'e2e-test@example.com';

    // Delete associated records first (cascade should handle it if defined, but Prisma sometimes needs manual)
    // FormularioInscripcion
    await prisma.formularioInscripcion.deleteMany({
        where: { cliente: { email } }
    });

    // PlanAsignado
    await prisma.planAsignado.deleteMany({
        where: { cliente: { email } }
    });

    // Client
    await prisma.cliente.deleteMany({
        where: { email }
    });

    console.log('Test client deleted.');
}

main().finally(() => prisma.$disconnect());
