import {
    Play,
    TrendingUp,
    Calendar,
    AlertCircle,
    ChevronRight,
    Flame,
    Weight,
    Zap,
    MessageCircle,
    Clock,
    Target
} from 'lucide-react';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';
import { getAlumnoSesion } from '@/nucleo/seguridad/sesion';
import { prisma } from '@/baseDatos/conexion';
import { calcularFaseMenstrual } from '@/nucleo/utilidades/ciclo';
import { obtenerDashboardData } from '@/nucleo/acciones/dashboard-alumno.accion';
import Link from 'next/link';

export default async function AlumnoDashboard() {
    const alumno = await getAlumnoSesion();
    
    const [datosDashboard, ciclo, macrosCiclo] = await Promise.all([
        obtenerDashboardData(),
        prisma.cicloMenstrual.findUnique({ where: { clienteId: alumno.id } }),
        prisma.macrociclo.findFirst({
            where: { clienteId: alumno.id },
            orderBy: { creadoEn: 'desc' },
            include: {
                bloquesMensuales: {
                    orderBy: { id: 'asc' },
                    include: {
                        semanas: {
                            orderBy: { numeroSemana: 'asc' },
                            take: 1
                        }
                    }
                }
            }
        })
    ]);

    const infoCiclo = ciclo?.activo 
        ? calcularFaseMenstrual(new Date(ciclo.fechaInicioUltimoCiclo), ciclo.duracionCiclo)
        : null;

    const iniciales = alumno.nombre
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const datos = datosDashboard.datos;

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            <div className="fade-up visible">
                {/* Header Alumno */}
                <header className="p-6 pt-10 flex justify-between items-start border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                    <div>
                        <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none">¡Hola, {alumno.nombre.split(' ')[0]}! 🚀</h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.15em] border border-naranja/30 bg-naranja/5 px-2 py-0.5 rounded">IL Campus</span>
                            {datos.plan && (
                                <span className="text-[0.55rem] font-bold text-green-400 uppercase tracking-[0.15em] flex items-center gap-1">
                                    <Clock size={10} /> {datos.plan.diasRestantes} días restantes
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {datos.mensajesNoLeidos > 0 && (
                            <Link href="/alumno/mensajeria" className="relative">
                                <div className="w-10 h-10 rounded-full bg-marino-3 border border-marino-4 flex items-center justify-center">
                                    <MessageCircle size={18} className="text-naranja" />
                                </div>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-naranja text-marino text-[0.6rem] font-black rounded-full flex items-center justify-center">
                                    {datos.mensajesNoLeidos}
                                </span>
                            </Link>
                        )}
                        <Link href="/alumno/perfil" className="w-12 h-12 rounded-full border-2 border-naranja overflow-hidden bg-marino-3 flex items-center justify-center font-barlow-condensed font-black text-naranja text-xl shadow-lg shadow-naranja/20 hover:scale-105 transition-transform active:scale-95">
                            {iniciales}
                        </Link>
                    </div>
                </header>

                <main className="p-6 space-y-6 animate-in fade-in duration-700">

                    {/* Banner de Ciclo Menstrual */}
                    {infoCiclo && (
                        <section className="animate-in slide-in-from-top-4 duration-500">
                            <div
                                className="relative overflow-hidden p-5 rounded-3xl border-2 shadow-2xl transition-all"
                                style={{
                                    borderColor: `${infoCiclo.color}40`,
                                    background: `linear-gradient(135deg, ${infoCiclo.color}15, var(--marino-2))`
                                }}
                            >
                                <div className="relative z-10 flex items-start gap-4">
                                    <div
                                        className="p-3 rounded-2xl border flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${infoCiclo.color}20`, borderColor: `${infoCiclo.color}30`, color: infoCiclo.color }}
                                    >
                                        <Zap size={24} fill="currentColor" className="animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-barlow-condensed font-black uppercase text-xl leading-none" style={{ color: infoCiclo.color }}>{infoCiclo.titulo}</h3>
                                            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-blanco/5 text-gris uppercase border border-blanco/10">Recomendado</span>
                                        </div>
                                        <p className="text-blanco font-bold text-sm leading-tight italic">{infoCiclo.intensidad}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Acción Principal: Entrenar */}
                    <section className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-naranja to-naranja-h rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.2em] block mb-1">Hoy te toca entrenar</span>
                                    <h2 className="text-3xl font-barlow-condensed font-black uppercase leading-[0.9]">Tu Entrenamiento</h2>
                                </div>
                                <div className="bg-marino-3 p-3 rounded-xl border border-marino-4">
                                    <Flame size={24} className="text-naranja" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-gris" />
                                    <span className="text-xs text-gris-claro font-medium">Tu rutina de la semana</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Target size={14} className="text-gris" />
                                    <span className="text-xs text-gris-claro font-medium italic">{macrosCiclo ? `${macrosCiclo.duracionSemanas} semanas` : 'Sin planificar'}</span>
                                </div>
                            </div>

                            <Link href="/alumno/rutina" className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest font-barlow-condensed text-lg transition-all shadow-lg shadow-naranja/20 active:scale-95">
                                <Play size={20} fill="currentColor" /> Empezar Entrenamiento
                            </Link>
                        </div>
                    </section>

                    {/* Métricas Rápidas */}
                    <section>
                        <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Tu Estado</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl">
                                <Weight size={18} className="text-naranja mb-2" />
                                <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Peso</p>
                                <p className="text-xl font-barlow-condensed font-black text-blanco">
                                    {datos.ultimoCheckin?.pesoKg ? `${datos.ultimoCheckin.pesoKg} kg` : 'Sin registro'}
                                </p>
                            </div>
                            <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl">
                                <TrendingUp size={18} className="text-green-400 mb-2" />
                                <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Check-ins</p>
                                <p className="text-xl font-barlow-condensed font-black text-blanco">
                                    {datos.checkinsUltimaSemana > 0 ? 'Esta semana' : 'Pendiente'}
                                </p>
                            </div>
                            <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl">
                                <Calendar size={18} className="text-blue-400 mb-2" />
                                <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Plan</p>
                                <p className="text-xl font-barlow-condensed font-black text-blanco">
                                    {datos.plan ? `${datos.plan.diasRestantes} días` : 'Sin plan'}
                                </p>
                            </div>
                            <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl">
                                <MessageCircle size={18} className="text-purple-400 mb-2" />
                                <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Mensajes</p>
                                <p className="text-xl font-barlow-condensed font-black text-blanco">
                                    {datos.mensajesNoLeidos > 0 ? `${datos.mensajesNoLeidos} nuevos` : 'Sin nuevos'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Alerta de Check-in */}
                    {datos.tieneCheckinPendiente && (
                        <Link href="/alumno/checkin" className="bg-marino-3/50 border border-[#EAB308]/30 p-5 rounded-2xl flex gap-4 items-center group cursor-pointer hover:border-[#EAB308]/60 transition-colors active:scale-[0.98]">
                            <div className="w-10 h-10 rounded-full bg-[#EAB308]/10 flex items-center justify-center shrink-0 border border-[#EAB308]/20">
                                <AlertCircle size={20} className="text-[#EAB308]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-blanco leading-tight">Check-in Pendiente</h4>
                                <p className="text-xs text-gris-claro font-medium mt-0.5">Compartí cómo te sentiste esta semana.</p>
                            </div>
                            <ChevronRight size={20} className="text-gris group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}

                    {/* Frase Motivadora */}
                    <section className="py-6 text-center italic text-gris-claro text-sm font-light leading-relaxed max-w-xs mx-auto">
                        &quot;Entrenar es un privilegio que muchos no tienen, aprovecha cada repetición.&quot;
                    </section>

                </main>

            </div>
            <AlumnoNav />
        </div>
    );
}
