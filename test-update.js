
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
    try {
        const ej = await prisma.ejercicio.findFirst();
        if (!ej) {
            console.log("No exercises to update");
            return;
        }
        console.log("Updating exercise:", ej.id);

        const data = {
            nombre: ej.nombre + " MOD",
            musculoPrincipal: "HOMBROS",
            articulacion: "MONOARTICULAR",
            patronMovimiento: "AISLAMIENTO",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            descripcion: "Test description"
        };

        const res = await prisma.ejercicio.update({
            where: { id: ej.id },
            data: {
                nombre: data.nombre,
                musculoPrincipal: data.musculoPrincipal,
                articulacion: data.articulacion,
                patron: data.patronMovimiento,
                urlVideo: data.videoUrl,
                descripcion: data.descripcion
            }
        });
        console.log("Success:", res.nombre);
    } catch (e) {
        console.error("Error updating:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testUpdate();
