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
        <div className="flex min-h-screen bg-[#0F1629] text-blanco relative overflow-hidden" style={{ background: 'radial-gradient(circle at 2%, 2%, #1A2540 0%, #0F1629 100%)' }}>
            {/* Sistema de Fondo Premium (Reflactores) — Best Practice: Premium Aesthetics */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-naranja/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] bg-naranja/5 blur-[100px] rounded-full pointer-events-none opacity-30" />
            <div className="absolute bottom-[-100px] left-[20%] w-[600px] h-[600px] bg-marino-3/20 blur-[150px] rounded-full pointer-events-none" />

            {/* Textura de Grano Sutil */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            {/* Sidebar fijo a la izquierda */}
            <SidebarEntrenador />

            {/* Contenido principal con mayor margen superior para evitar "efecto cortado" */}
            <main className="flex-1 md:ml-64 pt-20 md:pt-10 pb-10 min-h-screen relative z-10 transition-all duration-500">
                <div className="p-6 md:px-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
