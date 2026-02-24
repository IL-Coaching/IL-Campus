"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    MessageCircle,
    CreditCard,
    Settings,
    LayoutTemplate,
    ClipboardList,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/nucleo/acciones/auth.accion';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/entrenador/dashboard' },
    { name: 'Clientes', icon: Users, href: '/entrenador/clientes' },
    { name: 'Planes', icon: ClipboardList, href: '/entrenador/planes' },
    { name: 'Biblioteca', icon: Dumbbell, href: '/entrenador/biblioteca' },
    { name: 'Mensajería', icon: MessageCircle, href: '/entrenador/mensajeria' },
    { name: 'Finanzas', icon: CreditCard, href: '/entrenador/finanzas' },
    { name: 'CMS', icon: LayoutTemplate, href: '/entrenador/cms' },
    { name: 'Cuenta', icon: Settings, href: '/entrenador/cuenta' },
];

export default function SidebarEntrenador({ badgeMensajeria = 0 }: { badgeMensajeria?: number }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Botón Mobile */}
            <div className="md:hidden fixed top-0 w-full flex items-center justify-between p-4 bg-marino-2 border-b border-marino-4 z-50">
                <span className="text-xl font-barlow-condensed font-black italic text-naranja leading-none">IL</span>
                <button className="text-blanco" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-marino-2 border-r border-marino-4 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    } pt-16 md:pt-0`}
            >
                {/* Header Logo */}
                <div className="hidden md:flex flex-col h-24 pt-4 items-center justify-center border-b border-marino-4">
                    {/* Logo IL */}
                    <div className="flex items-center gap-1 text-gris-claro">
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-gris-claro"></div>
                        <span className="text-4xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-1">IL</span>
                        <div className="w-1.5 h-1.5 bg-gris-claro"></div>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                    </div>
                </div>

                {/* Menu Nav */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                    ? "bg-naranja/10 text-naranja border-r-2 border-naranja"
                                    : "text-gris hover:text-blanco hover:bg-marino-3"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="tracking-wide text-sm">{item.name}</span>
                                {item.name === 'Mensajería' && badgeMensajeria > 0 && (
                                    <div className="ml-auto bg-rojo text-blanco text-[0.6rem] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-rojo/20">
                                        {badgeMensajeria > 99 ? '+99' : badgeMensajeria}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-marino-4">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-gris hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors duration-200 w-full font-medium"
                    >
                        <LogOut size={20} />
                        <span className="tracking-wide text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay Mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-marino/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}
        </>
    );
}
