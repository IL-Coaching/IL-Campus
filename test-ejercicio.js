
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const entrenador = await prisma.entrenador.findFirst();
        if (!entrenador) {
            console.log("No hay entrenadores");
            return;
        }
        console.log("Entrenador encontrado:", entrenador.id);

        const ej = {
            nombre: "Test Ejercicio " + Date.now(),
            musculoPrincipal: "CUADRICEPS",
            articulacion: "MULTIARTICULAR",
            patron: "AISLAMIENTO",
            equipamiento: [],
            lateralidad: "BILATERAL",
            entrenadorId: entrenador.id,
            origen: 'BIBLIOTECA_IL',
            visibleParaClientes: true
        };

        const creado = await prisma.ejercicio.create({ data: ej });
        console.log("Ejercicio creado:", creado.id);

        const actualizado = await prisma.ejercicio.update({
            where: { id: creado.id },
            data: { nombre: creado.nombre + " UPDATED" }
        });
        console.log("Ejercicio actualizado:", actualizado.nombre);

        const eliminado = await prisma.ejercicio.delete({ where: { id: creado.id } });
        console.log("Ejercicio eliminado");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
