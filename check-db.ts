import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const notifs = await prisma.notificacion.findMany({
        take: 1,
        select: { id: true, gravedad: true, tipo: true }
    });
    console.log('✅ Campo gravedad OK:', JSON.stringify(notifs));
}

main().catch(e => { console.error('❌ ERROR:', e.message); }).finally(() => prisma.$disconnect());
