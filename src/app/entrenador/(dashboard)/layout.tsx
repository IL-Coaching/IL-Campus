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
        <div className="flex min-h-screen bg-[#0F1629] text-blanco relative overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 50%, #1A2540 0%, #0F1629 100%)' }}>
            {/* Decoración de fondo Premium (Blobs dinámicos) — Best Practice: Wow Aesthetics */}
            <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-naranja/10 blur-[130px] rounded-full pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-naranja/5 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[15s]" />
            <div className="absolute top-[30%] right-[20%] w-[15%] h-[15%] bg-marino-3/30 blur-[70px] rounded-full pointer-events-none" />

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
