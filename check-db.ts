import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const planes = await prisma.plan.findMany();
    console.log('--- PLANES ---');
    console.log(JSON.stringify(planes, null, 2));

    const entrenadores = await prisma.entrenador.findMany();
    console.log('--- ENTRENADORES ---');
    console.log(JSON.stringify(entrenadores, null, 2));

    const clientes = await prisma.cliente.findMany();
    console.log('--- CLIENTES ---');
    console.log(JSON.stringify(clientes, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
