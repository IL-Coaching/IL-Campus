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
        <div className="flex min-h-screen bg-marino text-blanco">
            {/* Sidebar fijo a la izquierda */}
            <SidebarEntrenador />

            {/* Contenido principal */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-10 min-h-screen">
                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
