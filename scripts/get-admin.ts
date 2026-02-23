import { PrismaClient } from '@prisma/client'

async function main() {
    const prisma = new PrismaClient()
    try {
        const entrenador = await prisma.entrenador.findFirst();

        if (!entrenador) {
            console.log("No trainer found.");
            return;
        }

        console.log("Admin Email:", entrenador.email);
    } catch (e) {
        console.error('DB Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
