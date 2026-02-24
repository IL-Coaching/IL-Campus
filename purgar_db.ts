
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('--- PURGA TOTAL DE EJERCICIOS ---')

    const countDia = await prisma.diaEjercicio.deleteMany({})
    console.log(`Eliminados ${countDia.count} registros de DiaEjercicio`)

    const countEj = await prisma.ejercicio.deleteMany({})
    console.log(`Eliminados ${countEj.count} registros de Ejercicio`)

    console.log('--- PURGA COMPLETADA ---')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
