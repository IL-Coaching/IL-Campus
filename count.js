
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.ejercicio.count();
    const entrenadores = await prisma.entrenador.count();
    console.log('Ejercicios:', count);
    console.log('Entrenadores:', entrenadores);
    await prisma.$disconnect();
}
main();
