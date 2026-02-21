import { Dumbbell, Calendar, LayoutDashboard, User } from 'lucide-react';
import Link from 'next/link';

export default function AlumnoNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-marino-2 border-t border-marino-4 px-6 py-3 pb-8 z-50 flex justify-between items-center sm:hidden">
            <Link href="/alumno/dashboard" className="flex flex-col items-center gap-1 text-naranja">
                <LayoutDashboard size={20} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">Inicio</span>
            </Link>
            <Link href="/alumno/rutina" className="flex flex-col items-center gap-1 text-gris hover:text-blanco transition-colors">
                <Dumbbell size={20} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">Rutina</span>
            </Link>
            <Link href="/alumno/checkin" className="flex flex-col items-center gap-1 text-gris hover:text-blanco transition-colors">
                <Calendar size={20} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">Check-in</span>
            </Link>
            <Link href="/alumno/perfil" className="flex flex-col items-center gap-1 text-gris hover:text-blanco transition-colors">
                <User size={20} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">Perfil</span>
            </Link>
        </nav>
    );
}
