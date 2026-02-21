import SidebarEntrenador from "@/compartido/componentes/SidebarEntrenador";

export default function EntrenadorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-marino text-blanco">
            {/* Sidebar fijo a la izquierda */}
            <SidebarEntrenador />

            {/* Contenido principal, respetando el ancho del sidebar en Desktop, y el header en mobile */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-10 min-h-screen">
                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
