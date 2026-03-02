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
    Target,
    Sparkles,
    Sunrise,
    Sunset,
    Moon
} from 'lucide-react';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';
import { getAlumnoSesion } from '@/nucleo/seguridad/sesion';
import { prisma } from '@/baseDatos/conexion';
import { calcularFaseMenstrual } from '@/nucleo/utilidades/ciclo';
import { obtenerDashboardData } from '@/nucleo/acciones/dashboard-alumno.accion';
import Link from 'next/link';

function getSaludoYIcono() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
        return { saludo: "Buenos días", icono: Sunrise, emoji: "🌅" };
    } else if (hora >= 12 && hora < 18) {
        return { saludo: "Buenas tardes", icono: Sunset, emoji: "☀️" };
    } else if (hora >= 18 && hora < 22) {
        return { saludo: "Buenas noches", icono: Moon, emoji: "🌙" };
    } else {
        return { saludo: "Buenas noches", icono: Moon, emoji: "🌙" };
    }
}

interface DatosDashboard {
    tieneCheckinPendiente: boolean;
    mensajesNoLeidos: number;
    plan: { diasRestantes: number } | null;
    ultimoCheckin: { pesoKg: number | null } | null;
    checkinsUltimaSemana: number;
}

function getMensajeBienvenida(datos: DatosDashboard, diasActivo: number) {
    const { tieneCheckinPendiente, mensajesNoLeidos, plan } = datos;

    if (diasActivo < 7) {
        return {
            mensaje: "¡Bienvenido a tu viaje de transformación!",
            descripcion: "Tu entrenamiento personalizado te espera.",
            tipo: "bienvenida"
        };
    }

    if (mensajesNoLeidos > 0) {
        return {
            mensaje: `Tenés ${mensajesNoLeidos} mensaje${mensajesNoLeidos > 1 ? 's' : ''} sin leer`,
            descripcion: "Tu entrenador te está esperando.",
            tipo: "mensajes"
        };
    }

    if (tieneCheckinPendiente) {
        return {
            mensaje: "Tu equipo te está esperando 📊",
            descripcion: "Completá tu check-in semanal.",
            tipo: "checkin"
        };
    }

    if (plan && plan.diasRestantes <= 7) {
        return {
            mensaje: "Tu membresía necesita atención",
            descripcion: `${plan.diasRestantes} días restantes.`,
            tipo: "aviso"
        };
    }

    return {
        mensaje: "¡Listo para otra semana de hierro! 💪",
        descripcion: "Tu cuerpo te lo va a agradecer.",
        tipo: "normal"
    };
}

const FRASES_MOTIVACIONALES = [
    "El entrenamiento no es solo físico, es mental.",
    "Cada repetición te acerca a tu mejor versión.",
    "La disciplina vence al talento cuando el talento no tiene disciplina.",
    "Hoy entrenas, mañana remerás.",
    "El progreso no es lineal, pero siempre está.",
    "Más que entrenar: entender, adaptar, progresar.",
    "Tu único límite sos vos mismo.",
    "La constancia vence al talento."
];

function getFraseMotivacional() {
    const dia = new Date().getDate();
    return FRASES_MOTIVACIONALES[dia % FRASES_MOTIVACIONALES.length];
}

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

    // Calcular días activo como cliente
    const diasActivo = Math.ceil((new Date().getTime() - new Date(alumno.fechaAlta).getTime()) / (1000 * 60 * 60 * 24));

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
    const { saludo, icono: IconoSaludo, emoji } = getSaludoYIcono();
    const { mensaje: _mensaje, tipo } = getMensajeBienvenida(datos, diasActivo);
    const fraseDelDia = getFraseMotivacional();

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            <div className="fade-up visible">
                {/* Header con bienvenida dinámica */}
                <header className="p-6 pt-10 border-b border-marino-4 bg-gradient-to-b from-marino-2/80 to-transparent">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Saludo dinámico */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-naranja/20 rounded-lg flex items-center justify-center">
                                    <IconoSaludo size={16} className="text-naranja" />
                                </div>
                                <span className="text-naranja text-xs font-bold uppercase tracking-[0.2em]">{saludo}</span>
                            </div>
                            
                            <h1 className="text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none">
                                {alumno.nombre.split(' ')[0]}{" "}
                                <span className="text-naranja">{emoji}</span>
                            </h1>
                            
                            {/* Mensaje contextual */}
                            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                tipo === 'bienvenida' ? 'bg-green-500/10 border border-green-500/20' :
                                tipo === 'mensajes' ? 'bg-blue-500/10 border border-blue-500/20' :
                                tipo === 'checkin' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                tipo === 'aviso' ? 'bg-red-500/10 border border-red-500/20' :
                                'bg-naranja/10 border border-naranja/20'
                            }`}>
                                <Sparkles size={12} className={
                                    tipo === 'bienvenida' ? 'text-green-400' :
                                    tipo === 'mensajes' ? 'text-blue-400' :
                                    tipo === 'checkin' ? 'text-yellow-400' :
                                    tipo === 'aviso' ? 'text-red-400' :
                                    'text-naranja'
                                } />
                                <span className="text-xs font-medium text-blanco">{_mensaje}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {datos.mensajesNoLeidos > 0 && (
                                <Link href="/alumno/mensajeria" className="relative">
                                    <div className="w-10 h-10 rounded-full bg-marino-3 border border-marino-4 flex items-center justify-center">
                                        <MessageCircle size={18} className="text-naranja" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-naranja text-marino text-[0.6rem] font-black rounded-full flex items-center justify-center animate-pulse">
                                        {datos.mensajesNoLeidos}
                                    </span>
                                </Link>
                            )}
                            <Link href="/alumno/perfil" className="w-12 h-12 rounded-full border-2 border-naranja overflow-hidden bg-marino-3 flex items-center justify-center font-barlow-condensed font-black text-naranja text-xl shadow-lg shadow-naranja/20 hover:scale-105 transition-transform active:scale-95">
                                {iniciales}
                            </Link>
                        </div>
                    </div>

                    {/* Stats rápidas */}
                    <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-marino-2/50 border border-marino-4/50 rounded-lg whitespace-nowrap">
                            <Calendar size={12} className="text-naranja" />
                            <span className="text-xs font-bold text-blanco">{diasActivo}</span>
                            <span className="text-[0.55rem] text-gris uppercase">días activo</span>
                        </div>
                        {datos.plan && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-marino-2/50 border border-marino-4/50 rounded-lg whitespace-nowrap">
                                <Clock size={12} className={datos.plan.diasRestantes <= 7 ? "text-yellow-400" : "text-green-400"} />
                                <span className="text-xs font-bold text-blanco">{datos.plan.diasRestantes}</span>
                                <span className="text-[0.55rem] text-gris uppercase">días plan</span>
                            </div>
                        )}
                        {macrosCiclo && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-marino-2/50 border border-marino-4/50 rounded-lg whitespace-nowrap">
                                <Target size={12} className="text-blue-400" />
                                <span className="text-xs font-bold text-blanco">{macrosCiclo.duracionSemanas}</span>
                                <span className="text-[0.55rem] text-gris uppercase">semanas</span>
                            </div>
                        )}
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

                    {/* CTA Principal: Entrenar */}
                    <section className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-naranja to-naranja-h rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.2em] block mb-1">Acción principal</span>
                                    <h2 className="text-3xl font-barlow-condensed font-black uppercase leading-[0.9]">Tu Entrenamiento</h2>
                                </div>
                                <div className="bg-marino-3 p-3 rounded-xl border border-marino-4">
                                    <Flame size={24} className="text-naranja" />
                                </div>
                            </div>

                            <Link href="/alumno/rutina" className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest font-barlow-condensed text-lg transition-all shadow-lg shadow-naranja/20 active:scale-95">
                                <Play size={20} fill="currentColor" /> Empezar Entrenamiento
                            </Link>
                        </div>
                    </section>

                    {/* Estado de la semana */}
                    <section>
                        <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Estado de tu semana</h3>
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
                                <p className="text-[0.6rem] text-gris uppercase font-bold tracking-widest">Check-in</p>
                                <p className="text-xl font-barlow-condensed font-black text-blanco">
                                    {datos.checkinsUltimaSemana > 0 ? 'Completado' : 'Pendiente'}
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

                    {/* Frase Motivacional del día */}
                    <section className="py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-naranja/5 border border-naranja/10 rounded-full">
                            <Sparkles size={14} className="text-naranja" />
                            <p className="text-xs text-gris-claro italic font-medium">&quot;{fraseDelDia}&quot;</p>
                        </div>
                    </section>

                </main>

            </div>
            <AlumnoNav />
        </div>
    );
}
