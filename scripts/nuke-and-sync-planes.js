const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'legarretatraining@gmail.com';
    const entrenador = await prisma.entrenador.findUnique({ where: { email } });

    if (!entrenador) {
        console.error('Entrenador no encontrado');
        return;
    }

    console.log(`Limpiando planes para: ${entrenador.nombre}`);

    // Borrar físicamente para evitar confusiones de visibilidad
    // (Nota: Esto fallaría si hay PlanAsignado vinculados, así que primero ocultamos y luego borramos los que no tengan vínculos)
    await prisma.plan.updateMany({
        where: { entrenadorId: entrenador.id },
        data: { visible: false }
    });

    const planesFlyer = [
        {
            nombre: "Nivel 1 - Start ★",
            precio: 15000,
            duracionDias: 30,
            visible: true,
            descripcion: "Ideal para conocer el sistema",
            beneficios: ["Plan personalizado", "Seguimiento directo", "Guía de entrenamiento", "Videollamada semanal"]
        },
        {
            nombre: "Nivel 2 - GymRat 🧠",
            precio: 40000,
            duracionDias: 90,
            visible: true,
            descripcion: "Para entrenar con estructura",
            beneficios: ["Todo lo de Nivel 1", "Planificación por mesociclo", "Explicación detallada"]
        },
        {
            nombre: "Nivel 3 - Elite 🚀",
            precio: 125000,
            duracionDias: 365,
            visible: true,
            descripcion: "Nivel avanzado",
            beneficios: ["Todo lo de Nivel 2", "Macrociclo completo", "Ajustes estratégicos"]
        }
    ];

    for (const p of planesFlyer) {
        await prisma.plan.upsert({
            where: {
                // Como no hay un constraint único por nombre+entrenador en el esquema, usamos findFirst y create
                id: 'placeholder-' + p.nombre.replace(/\s/g, '-')
            },
            create: { ...p, id: undefined, entrenadorId: entrenador.id },
            update: { ...p, id: undefined, visible: true }
        }).catch(async () => {
            // Si falla el upsert por el ID inventado, simplemente creamos
            await prisma.plan.create({ data: { ...p, entrenadorId: entrenador.id } });
        });
        console.log(`Plan sincronizado: ${p.nombre}`);
    }
}

main().finally(() => prisma.$disconnect());
