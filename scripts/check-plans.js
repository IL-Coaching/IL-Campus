const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
    try {
        const entrenador = await prisma.entrenador.findFirst();
        if (!entrenador) {
            console.log("No entrenador found");
            return;
        }
        console.log("Current Entrenador:", { id: entrenador.id, email: entrenador.email });

        const planes = await prisma.plan.findMany();
        console.log("Total Plans in DB:", planes.length);
        planes.forEach(p => {
            console.log(`Plan: ${p.nombre}, ID: ${p.id}, EntrenadorID: ${p.entrenadorId}, Visible: ${p.visible}`);
        });

    } catch (error) {
        console.error("Error checking plans:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlans();
