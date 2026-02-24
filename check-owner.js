
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const t = await prisma.entrenador.findFirst();
    if (t) {
        const ejs = await prisma.ejercicio.count({ where: { entrenadorId: t.id } });
        console.log('Entrenador:', t.email, 'ID:', t.id);
        console.log('Sus ejercicios:', ejs);
    } else {
        console.log('No entrenadores');
    }
    await prisma.$disconnect();
}
main();
