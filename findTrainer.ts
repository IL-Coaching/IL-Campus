import { prisma } from "./src/baseDatos/conexion";

async function findTrainer() {
    const trainer = await prisma.entrenador.findFirst();
    console.log("TRAINER_ID:", trainer?.id);
}

findTrainer();
