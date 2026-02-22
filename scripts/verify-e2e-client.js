const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const client = await prisma.cliente.findFirst({
        where: { email: 'e2e-test@example.com' },
        include: {
            cicloMenstrual: true
        }
    });
    console.log('Client Found:', JSON.stringify(client, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
