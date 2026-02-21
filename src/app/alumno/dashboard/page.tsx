import {
    Play,
    TrendingUp,
    Calendar,
    AlertCircle,
    ChevronRight,
    Flame,
    Weight
} from 'lucide-react';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';
import { getAlumnoSesion } from '@/nucleo/seguridad/sesion';

export default async function AlumnoDashboard() {
    const alumno = await getAlumnoSesion();

    // Obtenemos las iniciales para el avatar
    const iniciales = alumno.nombre
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            {/* Header Alumno */}
            <header className="p-6 pt-10 flex justify-between items-start border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none">¡Hola, {alumno.nombre.split(' ')[0]}! 🚀</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.15em] border border-naranja/30 bg-naranja/5 px-2 py-0.5 rounded">Alumno IL Campus</span>
                        <span className="text-[0.6rem] font-bold text-gris uppercase tracking-[0.15em]">Seguimiento Activo</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-naranja overflow-hidden bg-marino-3 flex items-center justify-center font-barlow-condensed font-black text-naranja text-xl">
                    {iniciales}
                </div>
            </header>

            <main className="p-6 space-y-8 fade-up visible">

                {/* Acción Principal: Entrenar */}
                <section className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-naranja to-naranja-h rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-xl overflow-hidden active:scale-[0.98] transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.2em] block mb-1">Hoy te toca entrenar</span>
                                <h2 className="text-3xl font-barlow-condensed font-black uppercase leading-[0.9]">Planificación<br />Personalizada</h2>
                            </div>
                            <div className="bg-marino-3 p-3 rounded-xl border border-marino-4">
                                <Flame size={24} className="text-naranja" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gris" />
                                <span className="text-xs text-gris-claro font-medium">Revisá tu rutina</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-gris" />
                                <span className="text-xs text-gris-claro font-medium italic">Progreso Real</span>
                            </div>
                        </div>

                        <button className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest font-barlow-condensed text-lg transition-all shadow-lg shadow-naranja/20">
                            <Play size={20} fill="currentColor" /> Empezar Entrenamiento
                        </button>
                    </div>
                </section>

                {/* Métricas Rápidas */}
                <section>
                    <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Estado de tu Proceso</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl min-w-[140px] flex-1">
                            <Weight size={18} className="text-naranja mb-3" />
                            <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Peso Actual</p>
                            <p className="text-xl font-barlow-condensed font-black text-blanco">No registrado</p>
                        </div>
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl min-w-[140px] flex-1">
                            <TrendingUp size={18} className="text-[#22C55E] mb-3" />
                            <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Estado</p>
                            <p className="text-xl font-barlow-condensed font-black text-blanco">Activo</p>
                        </div>
                    </div>
                </section>

                {/* Alerta de Check-in */}
                <section className="bg-marino-3/50 border border-[#EAB308]/30 p-5 rounded-2xl flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#EAB308]/10 flex items-center justify-center shrink-0 border border-[#EAB308]/20">
                        <AlertCircle size={20} className="text-[#EAB308]" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-blanco leading-tight">Check-in Pendiente</h4>
                        <p className="text-xs text-gris-claro font-medium mt-0.5">Subí tus fotos y reportes de la semana.</p>
                    </div>
                    <ChevronRight size={20} className="text-gris" />
                </section>

                {/* Frase Motivadora */}
                <section className="py-6 text-center italic text-gris-claro text-sm font-light leading-relaxed">
                    &quot;Entrenar es un privilegio que muchos no tienen, aprovecha cada repetición.&quot;
                </section>

            </main>

            {/* Navegación Alumno */}
            <AlumnoNav />
        </div>
    );
}
