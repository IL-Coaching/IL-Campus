const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPlans() {
    try {
        const email = 'legarretatraining@gmail.com';
        const entrenador = await prisma.entrenador.findUnique({
            where: { email }
        });

        if (!entrenador) {
            console.error('❌ No se encontró el entrenador:', email);
            return;
        }

        console.log('🌱 Sembrando planes para:', entrenador.nombre);

        const planes = [
            {
                nombre: 'Nivel 1 - Start ⭐',
                precio: 15000,
                duracionDias: 30,
                descripcion: 'Ideal para empezar y conocer el sistema',
                beneficios: ["Plan personalizado", "Seguimiento directo", "Guía de entrenamiento", "Videollamada semanal"]
            },
            {
                nombre: 'Nivel 2 - GymRat 🧠',
                precio: 40000,
                duracionDias: 90,
                descripcion: 'Para entrenar con estructura y progresar en serio',
                beneficios: ["Todo lo de Start", "Planificación por mesociclo", "Explicación detallada", "Acompañamiento premium"]
            },
            {
                nombre: 'Nivel 3 - Elite 🚀',
                precio: 125000,
                duracionDias: 365,
                descripcion: 'Para llevar tu entrenamiento a un nivel avanzado',
                beneficios: ["Todo lo de GymRat", "Macrociclo completo", "Análisis estratégico", "Prioridad en soporte"]
            }
        ];

        for (const plan of planes) {
            const existente = await prisma.plan.findFirst({
                where: {
                    nombre: plan.nombre,
                    entrenadorId: entrenador.id
                }
            });

            if (!existente) {
                await prisma.plan.create({
                    data: {
                        ...plan,
                        entrenadorId: entrenador.id
                    }
                });
                console.log('✅ Plan creado:', plan.nombre);
            } else {
                console.log('ℹ️ El plan ya existe:', plan.nombre);
            }
        }

        console.log('🚀 Proceso de seeding de planes completado.');

    } catch (error) {
        console.error('❌ Error en seeding de planes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPlans();
