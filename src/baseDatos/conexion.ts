// conexion.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

// extendemos el objeto global para Typescript
const globalForPrisma = globalThis as unknown as {
    prismaGlobal: PrismaClient | undefined
}

// Instanciamos uno nuevo o tomamos el cacheado (ideal para hot reload de Next.js sin agotar pool de DB)
export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
