const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Identificar al entrenador (Iñaki Legarreta) por email
    const entrenador = await prisma.entrenador.findUnique({
        where: { email: 'legarretatraining@gmail.com' }
    });

    if (!entrenador) {
        console.error('No se encontró al entrenador');
        return;
    }

    console.log(`Entrenador encontrado: ${entrenador.nombre} (ID: ${entrenador.id})`);

    // 2. Eliminar planes que no coinciden con la estructura profesional (Limpieza total)
    // No los borramos físicamente si tienen asignaciones, pero los ocultamos y renombramos si es necesario.
    // En este punto, como es fase de desarrollo/alineación, vamos a marcarlos como no visibles.
    await prisma.plan.updateMany({
        where: { entrenadorId: entrenador.id },
        data: { visible: false }
    });

    const planesReales = [
        {
            nombre: "Nivel 1 - Start ★",
            precio: 15000,
            duracionDias: 30,
            visible: true,
            beneficios: ["Plan Personalizado", "Seguimiento Directo", "Guía de Entrenamiento", "Videollamada Semanal"],
            descripcion: "Ideal para empezar y conocer el sistema"
        },
        {
            nombre: "Nivel 2 - GymRat 🧠",
            precio: 40000,
            duracionDias: 90,
            visible: true,
            beneficios: ["Lo anterior +", "Planificación por mesociclo", "Explicación detallada del entrenamiento", "Mayor comprensión del proceso"],
            descripcion: "Para entrenar con estructura y empezar a progresar en serio"
        },
        {
            nombre: "Nivel 3 - Elite 🚀",
            precio: 125000,
            duracionDias: 365,
            visible: true,
            beneficios: ["Lo anterior +", "Macrociclo completo", "Análisis del proceso", "Ajustes estratégicos"],
            descripcion: "Para llevar tu entrenamiento a un nivel avanzado"
        }
    ];

    for (const p of planesReales) {
        await prisma.plan.create({
            data: {
                ...p,
                entrenadorId: entrenador.id
            }
        });
        console.log(`Plan creado: ${p.nombre}`);
    }

    console.log('--- DB ALINEADA CON EL FLYER REAL ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
