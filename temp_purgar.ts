
import { purgarTodaLaBiblioteca } from "./src/nucleo/acciones/purgar.accion";

async function main() {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    console.log("🚀 Iniciando purga total...");
    try {
        const res = await purgarTodaLaBiblioteca();
        console.log("✅ Resultado:", res);
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

// Nota: Este script requeriría un entorno con acceso a la DB y sesión simulada.
// Para hacerlo de forma segura y directa, usaré un script de Prisma directo.
