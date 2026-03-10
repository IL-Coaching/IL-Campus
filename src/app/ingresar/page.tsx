"use client"
import Link from 'next/link';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function IngresarPage() {
    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-naranja/5 blur-[120px] rounded-full -z-10"></div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 fade-up visible">

                {/* Header (Full Width) */}
                <div className="md:col-span-2 text-center mb-8">
                    <div className="flex justify-center items-center gap-1.5 mb-6">
                        <div className="w-2 h-8 bg-gris-claro rounded-sm opacity-60"></div>
                        <div className="w-3 h-10 bg-gris-claro rounded-sm opacity-80"></div>
                        <span className="text-6xl md:text-7xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-3 drop-shadow-[0_0_20px_rgba(255,107,0,0.4)]">IL</span>
                        <div className="w-3 h-10 bg-gris-claro rounded-sm opacity-80"></div>
                        <div className="w-2 h-8 bg-gris-claro rounded-sm opacity-60"></div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-barlow-condensed font-black uppercase text-blanco tracking-tight mb-2">Bienvenido al Campus</h1>
                    <p className="text-gris font-medium text-sm sm:text-base">Seleccioná tu tipo de acceso para continuar</p>
                </div>

                {/* Opción Alumno */}
                <Link href="/alumno/login" className="group">
                    <div className="h-full bg-marino-2 border border-marino-4 p-10 rounded-3xl hover:border-naranja/50 transition-all duration-500 hover:shadow-2xl hover:shadow-naranja/5 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-naranja/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="w-20 h-20 bg-marino-3 rounded-2xl flex items-center justify-center mb-6 text-naranja border border-marino-4 group-hover:scale-110 transition-transform duration-500">
                            <User size={40} />
                        </div>

                        <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-4 group-hover:text-naranja transition-colors">Soy Alumno</h2>
                        <p className="text-gris text-sm leading-relaxed mb-8">
                            Accedé a tu planificación, cargá tus check-ins y hacé el seguimiento de tu progreso semanal.
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-naranja font-bold uppercase tracking-widest text-xs">
                            Entrar al Campus <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Opción Entrenador */}
                <Link href="/entrenador/login" className="group">
                    <div className="h-full bg-marino-2 border border-marino-4 p-10 rounded-3xl hover:border-naranja/50 transition-all duration-500 hover:shadow-2xl hover:shadow-naranja/5 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-naranja/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="w-20 h-20 bg-marino-3 rounded-2xl flex items-center justify-center mb-6 text-naranja border border-marino-4 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck size={40} />
                        </div>

                        <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-4 group-hover:text-naranja transition-colors">Entrenador</h2>
                        <p className="text-gris text-sm leading-relaxed mb-8">
                            Gestioná atletas, administrá la biblioteca de ejercicios y revisá los reportes de progreso de tus alumnos.
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-naranja font-bold uppercase tracking-widest text-xs">
                            Panel de Control <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Footer Links */}
                <div className="md:col-span-2 flex justify-center gap-8 mt-12 border-t border-marino-4/30 pt-8">
                    <Link href="/" className="text-[0.7rem] font-bold text-gris uppercase tracking-widest hover:text-blanco transition-colors">Volver a la Web</Link>
                    <Link href="/#planes" className="text-[0.7rem] font-bold text-gris uppercase tracking-widest hover:text-blanco transition-colors">Ver Planes</Link>
                    <Link href="https://wa.me/5493425555607" className="text-[0.7rem] font-bold text-gris uppercase tracking-widest hover:text-blanco transition-colors">Soporte</Link>
                </div>

            </div>
        </main>
    );
}
