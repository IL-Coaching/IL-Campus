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
        <div className="flex min-h-screen bg-[#060912] text-blanco relative">
            {/* Atmósfera de Fondo Premium — Estándar ArchSecure AI */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Gradiente de Profundidad */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, #151c2e 0%, #060912 100%)' }} />

                {/* Destellos de Marca (Naranja sutil) */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-naranja/5 blur-[150px] rounded-full animate-pulse transition-all duration-[10s]" />
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-marino-3/10 blur-[100px] rounded-full" />

                {/* Textura de Grano Técnico */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* Sidebar fijo a la izquierda */}
            <SidebarEntrenador />

            {/* Contenido principal con padding superior de seguridad (Safe Area) */}
            <main className="flex-1 md:ml-64 pt-28 md:pt-20 pb-16 min-h-screen relative z-10">
                <div className="px-6 md:px-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
