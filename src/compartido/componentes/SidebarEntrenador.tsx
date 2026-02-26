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
            <div className="md:hidden fixed top-0 w-full flex items-center justify-between p-4 bg-marino-2 border-b border-marino-4 z-[120] h-16">
                <div className="flex items-center gap-1">
                    <div className="w-1 h-4 bg-naranja rounded-full"></div>
                    <span className="text-xl font-barlow-condensed font-black italic text-naranja leading-none">IL</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => logout()}
                        className="p-2 text-gris hover:text-rojo transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                    <button className="p-2 text-blanco" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-[110] w-72 bg-marino-2 border-r border-marino-4 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    } pt-16 md:pt-0 shadow-2xl overflow-hidden`}
            >
                {/* Header Logo */}
                <div className="hidden md:flex flex-col h-24 pt-4 items-center justify-center border-b border-marino-4 mb-4">
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
                <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 pt-4 md:pt-0">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[0.7rem] transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-naranja to-orange-500 text-marino shadow-xl shadow-naranja/20"
                                    : "text-gris hover:text-blanco hover:bg-marino-3/50"
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
                                <span className="tracking-[0.1em]">{item.name}</span>
                                {item.name === 'Mensajería' && badgeMensajeria > 0 && (
                                    <div className={`ml-auto border w-6 h-6 flex items-center justify-center rounded-full text-[0.65rem] font-black ${isActive ? 'bg-marino border-marino/20 text-naranja' : 'bg-rojo border-rojo/20 text-blanco shadow-lg shadow-rojo/20'}`}>
                                        {badgeMensajeria > 99 ? '+99' : badgeMensajeria}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-marino-4 bg-marino-3/30">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gris hover:text-rojo hover:bg-rojo/10 transition-all duration-300 w-full font-black uppercase tracking-[0.15em] text-[0.7rem] shadow-sm"
                    >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay Mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-marino-1/80 backdrop-blur-md z-[105] md:hidden animate-in fade-in duration-300"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}
        </>
    );
}
