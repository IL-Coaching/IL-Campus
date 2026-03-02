"use client";

import { Dumbbell, Calendar, LayoutDashboard, User, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AlumnoNav() {
    const pathname = usePathname();

    const tabs = [
        { label: 'Inicio', path: '/alumno/dashboard', icon: LayoutDashboard },
        { label: 'Rutina', path: '/alumno/rutina', icon: Dumbbell },
        { label: 'Check-in', path: '/alumno/checkin', icon: Calendar },
        { label: 'Progreso', path: '/alumno/progreso', icon: TrendingUp },
        { label: 'Mensajes', path: '/alumno/mensajeria', icon: MessageCircle },
        { label: 'Perfil', path: '/alumno/perfil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-marino-2/80 backdrop-blur-xl border-t border-marino-4 px-2 py-2 pb-8 z-50 flex justify-around items-center sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.path || pathname.startsWith(tab.path + '/');

                return (
                    <Link
                        key={tab.path}
                        href={tab.path}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-naranja scale-105' : 'text-gris hover:text-blanco'}`}
                    >
                        <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-naranja/10' : ''}`}>
                            <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                        </div>
                        <span className="text-[0.5rem] font-black uppercase tracking-[0.1em]">
                            {tab.label}
                        </span>
                        {active && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-naranja rounded-full animate-pulse shadow-[0_0_10px_#FF6B00]"></div>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
