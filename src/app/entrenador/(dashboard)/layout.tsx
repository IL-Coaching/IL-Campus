import SidebarEntrenador from "@/compartido/componentes/SidebarEntrenador";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";

export default async function EntrenadorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Protección de ruta: Si no hay sesión, getEntrenadorSesion redirige automáticamente
    await getEntrenadorSesion();

    return (
        <div className="flex min-h-screen bg-marino text-blanco relative overflow-hidden">
            {/* Decoración de fondo Premium (Blobs dinámicos) — Best Practice: Wow Aesthetics */}
            <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-naranja/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-naranja/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-marino-3/50 blur-[80px] rounded-full pointer-events-none" />

            {/* Sidebar fijo a la izquierda */}
            <SidebarEntrenador />

            {/* Contenido principal */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-10 min-h-screen relative z-10 transition-all duration-500">
                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
