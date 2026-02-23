import { PrismaClient } from '@prisma/client'

async function main() {
    const prisma = new PrismaClient()
    try {
        console.log('Testing full Cliente query...')
        const entrenador = await prisma.entrenador.findFirst();

        if (!entrenador) {
            console.log("No trainer found.");
            return;
        }

        const clientes = await prisma.cliente.findMany({
            where: { entrenadorId: entrenador.id },
            include: {
                planesAsignados: {
                    include: { plan: true },
                    orderBy: { fechaInicio: 'desc' },
                    take: 1
                },
                formularioInscripcion: {
                    select: { id: true }
                }
            },
            orderBy: { fechaAlta: "desc" }
        });
        console.log('Success! Found clientes:', clientes.length);
    } catch (e) {
        console.error('DB Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
