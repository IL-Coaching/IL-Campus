"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MessageCircle,
    Dumbbell,
    CreditCard
} from 'lucide-react';

export default function BottomNav({ badgeMensajeria = 0 }: { badgeMensajeria?: number }) {
    const pathname = usePathname();

    const ITEMS = [
        { name: 'Home', icon: LayoutDashboard, href: '/entrenador/dashboard' },
        { name: 'Atletas', icon: Users, href: '/entrenador/clientes' },
        { name: 'Matrix', icon: Dumbbell, href: '/entrenador/biblioteca' },
        { name: 'Inbox', icon: MessageCircle, href: '/entrenador/mensajeria' },
        { name: 'Caja', icon: CreditCard, href: '/entrenador/finanzas' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-marino-2/95 backdrop-blur-xl border-t border-marino-4 z-[100] px-2 pb-safe-area-inset-bottom h-20 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 h-16 rounded-2xl ${isActive ? 'bg-naranja/10 text-naranja' : 'text-gris hover:text-blanco'
                            }`}
                    >
                        <div className="relative">
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name === 'Inbox' && badgeMensajeria > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-rojo text-blanco text-[0.55rem] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-marino-2">
                                    {badgeMensajeria > 9 ? '9+' : badgeMensajeria}
                                </span>
                            )}
                        </div>
                        <span className={`text-[0.55rem] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
