import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";
import { Dumbbell, Play, ChevronRight, Calendar, Clock, Target, Zap, Activity, ShieldAlert } from "lucide-react";
import { Cliente } from '@prisma/client';
import { DescargarRutinaBtn } from "@/compartido/componentes/pdf/DescargarRutinaBtn";

const DIA_ORDEN: Record<string, number> = {
    Lunes: 1, Martes: 2, Miércoles: 3, Miercoles: 3,
    Jueves: 4, Viernes: 5, Sábado: 6, Sabado: 6, Domingo: 7
};

function badgeMusculo(musculo: string) {
    const colors: Record<string, string> = {
        CUADRICEPS: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        ISQUIOTIBIALES: "bg-purple-500/20 text-purple-300 border-purple-400/30",
        GLUTEO: "bg-pink-500/20 text-pink-300 border-pink-400/30",
        PECHO: "bg-red-500/20 text-red-300 border-red-400/30",
        ESPALDA: "bg-green-500/20 text-green-300 border-green-400/30",
        HOMBROS: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
        BICEPS: "bg-orange-500/20 text-orange-300 border-orange-400/30",
        TRICEPS: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
        CORE: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
        GEMELOS: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    };
    return colors[musculo] || "bg-marino-4 text-gris border-marino-5";
}

function idxToLetter(idx: number) {
    return String.fromCharCode(65 + idx);
}

export default async function RutinaPage() {
    const alumno = (await getAlumnoSesion()) as Cliente;

    if (alumno.enEstasis) {
        return (
            <div className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 text-center text-blanco">
                <div className="w-32 h-32 bg-blue-500/10 text-blue-400 border-2 border-blue-500/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-20"></div>
                    <ShieldAlert size={64} />
                </div>
                <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tighter leading-none mb-4">
                    Cámara de Éstasis Activa
                </h1>
                <p className="text-blue-200/60 text-sm font-medium max-w-xs leading-relaxed mb-8">
                    Tu acceso a la planificación ha sido congelado temporalmente por tu entrenador. Tu progreso financiero está en pausa y tus rutinas están resguardadas.
                </p>
                <div className="p-4 bg-marino-2 border border-blue-500/20 rounded-2xl text-[0.65rem] text-blue-300 font-bold uppercase tracking-widest">
                    Contacta a tu coach para reactivar
                </div>
                <AlumnoNav />
            </div>
        );
    }

    // Buscar el macrociclo activo del alumno con toda la jerarquía
    const macrociclo = await prisma.macrociclo.findFirst({
        where: { clienteId: alumno.id },
        orderBy: { creadoEn: "desc" },
        include: {
            bloquesMensuales: {
                orderBy: { id: "asc" },
                include: {
                    semanas: {
                        orderBy: { numeroSemana: "asc" },
                        include: {
                            diasSesion: {
                                orderBy: { diaSemana: "asc" },
                                include: {
                                    ejercicios: {
                                        orderBy: { orden: "asc" },
                                        include: {
                                            ejercicio: {
                                                select: {
                                                    nombre: true,
                                                    urlVideo: true,
                                                    thumbnailUrl: true,
                                                    musculoPrincipal: true,
                                                    posicionCarga: true,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const datosEntrenador = await prisma.entrenador.findUnique({
        where: { id: alumno.entrenadorId },
        select: { nombre: true }
    });

    const nombreEntrenador = datosEntrenador?.nombre || 'Tu Entrenador';

    if (!macrociclo) {
        return (
            <div className="min-h-screen bg-marino pb-24 text-blanco flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-naranja/10 text-naranja border-2 border-naranja/20 rounded-full flex items-center justify-center mb-8">
                    <Dumbbell size={48} />
                </div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight">
                    Planificación en Preparación
                </h1>
                <p className="text-gris text-sm font-medium mt-4 max-w-xs leading-relaxed">
                    Tu entrenador aún no ha asignado un plan de entrenamiento. Mantente atento — llegará pronto.
                </p>
                <div className="mt-8 p-5 bg-marino-2 border border-marino-4 rounded-3xl flex items-center gap-4 max-w-sm w-full">
                    <div className="w-10 h-10 bg-naranja/10 rounded-2xl flex items-center justify-center border border-naranja/20 shrink-0">
                        <Calendar size={20} className="text-naranja" />
                    </div>
                    <p className="text-xs text-gris-claro font-medium text-left leading-relaxed">
                        Una vez asignada, verás aquí tu estructura de entrenamiento completa semana a semana.
                    </p>
                </div>
                <AlumnoNav />
            </div>
        );
    }

    // Determinar semana actual: buscar la primera semana que tenga ejercicios
    const todasLasSemanas = macrociclo.bloquesMensuales.flatMap(b => b.semanas);
    // La semana activa es la primera semana con al menos un día con ejercicios
    const semanaActiva = todasLasSemanas.find(s =>
        s.diasSesion.some(d => d.ejercicios.length > 0)
    ) || todasLasSemanas[0];

    const bloqueSemanaActiva = macrociclo.bloquesMensuales.find(b =>
        b.semanas.some(s => s.id === semanaActiva?.id)
    );

    const diasConEjercicios = semanaActiva
        ? [...semanaActiva.diasSesion]
            .sort((a, b) => (DIA_ORDEN[a.diaSemana] || 99) - (DIA_ORDEN[b.diaSemana] || 99))
            .filter(d => d.ejercicios.length > 0)
        : [];

    const totalEjercicios = diasConEjercicios.reduce((sum, d) => sum + d.ejercicios.length, 0);

    return (
        <div className="min-h-screen bg-marino pb-32 text-blanco selection:bg-naranja/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden origin-top opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-naranja/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            {/* Header — Ultra Premium */}
            <header className="p-6 pt-12 pb-8 border-b border-marino-4/30 bg-marino/40 backdrop-blur-2xl sticky top-0 z-40">
                <div className="flex items-start justify-between">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-naranja animate-pulse shadow-[0_0_8px_#FF6B00]"></div>
                            <span className="text-[0.65rem] font-black text-naranja border border-naranja/20 bg-naranja/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Planificación Alpha</span>
                        </div>
                        <h1 className="text-4xl font-barlow-condensed font-black uppercase leading-none text-blanco tracking-tighter">
                            Mi Entrenamiento
                        </h1>
                        {semanaActiva && (
                            <div className="flex items-center gap-2 mt-2 group cursor-default">
                                <Calendar size={12} className="text-gris group-hover:text-naranja transition-colors" />
                                <p className="text-gris text-[0.7rem] font-bold uppercase tracking-widest">
                                    Semana {semanaActiva.numeroSemana} <span className="opacity-30 mx-1">/</span> <span className="text-blanco/80 italic">{semanaActiva.objetivoSemana}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    {macrociclo && macrociclo.bloquesMensuales.length > 0 && (
                        <DescargarRutinaBtn
                            macrociclo={macrociclo as unknown as import('@/compartido/componentes/pdf/DescargarRutinaBtn').MacrocicloData}
                            nombreAlumno={alumno.nombre}
                            nombreEntrenador={nombreEntrenador}
                        />
                    )}
                </div>
            </header>

            <main className="p-5 space-y-8 relative z-10">

                {/* Dashboard de Sesión — Gualda Style */}
                <section className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="bg-marino-2/60 backdrop-blur-md border border-marino-4/50 rounded-3xl p-5 text-center shadow-xl group hover:border-naranja/30 transition-all">
                        <div className="p-2.5 bg-naranja/10 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Target size={20} className="text-naranja" />
                        </div>
                        <span className="text-2xl font-barlow-condensed font-black text-blanco block leading-none">{totalEjercicios}</span>
                        <span className="text-[0.55rem] text-gris uppercase font-black tracking-widest mt-1 block">Ejercicios</span>
                    </div>
                    <div className="bg-marino-2/60 backdrop-blur-md border border-marino-4/50 rounded-3xl p-5 text-center shadow-xl group hover:border-blue-500/30 transition-all">
                        <div className="p-2.5 bg-blue-500/10 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Zap size={20} className="text-blue-400" />
                        </div>
                        <span className="text-2xl font-barlow-condensed font-black text-blanco block leading-none">
                            {semanaActiva?.RIRobjetivo ?? "-"}
                        </span>
                        <span className="text-[0.55rem] text-gris uppercase font-black tracking-widest mt-1 block">RIR Plan</span>
                    </div>
                    <div className="bg-marino-2/60 backdrop-blur-md border border-marino-4/50 rounded-3xl p-5 text-center shadow-xl group hover:border-purple-500/30 transition-all">
                        <div className="p-2.5 bg-purple-500/10 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Activity size={20} className="text-purple-400" />
                        </div>
                        <span className="text-2xl font-barlow-condensed font-black text-blanco block leading-none truncate px-1">
                            {bloqueSemanaActiva?.objetivo.slice(0, 8) || "—"}
                        </span>
                        <span className="text-[0.55rem] text-gris uppercase font-black tracking-widest mt-1 block">Bloque</span>
                    </div>
                </section>

                {/* Cartas de Día (Sesiones Operativas) */}
                {diasConEjercicios.length === 0 ? (
                    <div className="bg-marino-2/40 border border-marino-4/30 border-dashed rounded-[2.5rem] p-16 text-center animate-in fade-in duration-1000">
                        <Dumbbell size={48} className="text-marino-4 mx-auto mb-6 opacity-20" />
                        <p className="text-[0.7rem] font-bold text-gris uppercase tracking-[0.3em]">Tu rutina aún se está cocinando...</p>
                    </div>
                ) : (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[0.65rem] font-black text-gris uppercase tracking-[0.3em]">Sesiones Operativas</h2>
                            <span className="text-[0.6rem] font-black text-naranja uppercase bg-naranja/10 px-3 py-1 rounded-full">{diasConEjercicios.length} Días</span>
                        </div>

                        {diasConEjercicios.map((dia, dIdx) => (
                            <div key={dia.id} className="bg-marino-2 border border-marino-4/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${dIdx * 100}ms` }}>
                                {/* Decoración de fondo por día */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 rotate-12">
                                    <Dumbbell size={140} />
                                </div>

                                {/* Cabecera del día — Compacta & Fuerte */}
                                <div className="px-6 py-6 border-b border-marino-4/40 flex items-center justify-between bg-gradient-to-r from-marino-3/50 to-transparent">
                                    <div>
                                        <h3 className="font-barlow-condensed font-black uppercase text-3xl text-blanco leading-none tracking-tight">
                                            {dia.diaSemana}
                                        </h3>
                                        {dia.focoMuscular && (
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-naranja shadow-[0_0_6px_#FF6B00]"></div>
                                                <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.2em]">
                                                    {dia.focoMuscular}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-barlow-condensed font-black text-blanco/40 leading-none">{idxToLetter(dIdx)}</p>
                                        <p className="text-[0.5rem] font-black text-gris uppercase tracking-widest mt-1">Sesión</p>
                                    </div>
                                </div>

                                {/* Listado de Ejercicios — Clean Design */}
                                <div className="divide-y divide-marino-4/30">
                                    {dia.ejercicios.map((ep, idx) => {
                                        const nombreEjercicio = ep.ejercicio?.nombre || ep.nombreLibre || "Ejercicio sin nombre";
                                        const tieneVideo = !!ep.ejercicio?.urlVideo;
                                        const musculo = ep.ejercicio?.musculoPrincipal;
                                        const esLongitudLarga = ep.ejercicio?.posicionCarga === "LONGITUD_LARGA";

                                        return (
                                            <div key={ep.id} className="px-6 py-6 active:bg-marino-3/40 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    {/* Badge de Orden */}
                                                    <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                                                        <span className="text-[0.6rem] font-black text-gris/40 uppercase">E-{idx + 1}</span>
                                                        <div className="w-1 h-8 bg-marino-4 rounded-full overflow-hidden">
                                                            <div className="w-full h-1/2 bg-naranja shadow-[0_0_8px_#FF6B00]"></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        {/* Nombre & Badges */}
                                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                                            <h4 className="font-black text-blanco text-lg leading-tight uppercase tracking-tight truncate">{nombreEjercicio}</h4>
                                                            <div className="flex gap-1.5">
                                                                {tieneVideo && (
                                                                    <div className="p-1.5 bg-naranja/10 rounded-lg text-naranja border border-naranja/20">
                                                                        <Play size={10} fill="currentColor" />
                                                                    </div>
                                                                )}
                                                                {ep.esTesteo && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1"></div>}
                                                            </div>
                                                        </div>

                                                        {/* Grid de Prescripción — Look & Feel de Apple Health */}
                                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                                            <div className="bg-marino-3/50 rounded-2xl p-3 border border-marino-4/50">
                                                                <span className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-0.5">Sets</span>
                                                                <p className="text-xl font-barlow-condensed font-black text-blanco leading-none">{ep.series}</p>
                                                            </div>
                                                            <div className="bg-marino-3/50 rounded-2xl p-3 border border-marino-4/50 col-span-2 text-center">
                                                                <span className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-0.5">Repeticiones</span>
                                                                <p className="text-xl font-barlow-condensed font-black text-naranja leading-none tracking-widest">{ep.repsMin}<span className="text-gris/40 mx-1">—</span>{ep.repsMax}</p>
                                                            </div>
                                                            <div className="bg-marino-3/50 rounded-2xl p-3 border border-marino-4/50 text-right">
                                                                <span className="text-[0.5rem] font-black text-gris uppercase tracking-widest block mb-0.5">RIR</span>
                                                                <p className="text-xl font-barlow-condensed font-black text-verde leading-none">{ep.RIR ?? "—"}</p>
                                                            </div>
                                                        </div>

                                                        {/* Detalles Secundarios */}
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            {ep.descansoSegundos && ep.descansoSegundos > 0 && (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-marino-4/40 rounded-xl border border-marino-4/50">
                                                                    <Clock size={10} className="text-gris" />
                                                                    <span className="text-[0.6rem] font-black text-gris-claro uppercase tracking-widest">{ep.descansoSegundos}s Descanso</span>
                                                                </div>
                                                            )}
                                                            {ep.pesoSugerido && (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-verde/10 rounded-xl border border-verde/20">
                                                                    <Dumbbell size={10} className="text-verde" />
                                                                    <span className="text-[0.6rem] font-black text-verde uppercase tracking-widest">{ep.pesoSugerido} KG Sugerido</span>
                                                                </div>
                                                            )}
                                                            {musculo && (
                                                                <span className={`text-[0.55rem] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest transition-colors ${badgeMusculo(musculo)}`}>
                                                                    {musculo}
                                                                </span>
                                                            )}
                                                            {esLongitudLarga && (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                                                    <ShieldAlert size={10} className="text-blue-400" />
                                                                    <span className="text-[0.55rem] font-black text-blue-300 uppercase tracking-widest">IUSCA Optimized</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Feedback e Interacción de Testeo */}
                                                        {ep.esTesteo && (
                                                            <div className={`mt-5 p-5 rounded-3xl border overflow-hidden relative group/test transition-all ${ep.modalidadTesteo === 'DIRECTO' ? 'bg-rojo/5 border-rojo/20 shadow-xl shadow-rojo/5' : 'bg-naranja/5 border-naranja/20 shadow-xl shadow-naranja/5'}`}>
                                                                <div className="flex items-center justify-between relative z-10">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`p-3 rounded-2xl ${ep.modalidadTesteo === 'DIRECTO' ? 'bg-rojo/10 text-rojo' : 'bg-naranja/10 text-naranja'}`}>
                                                                            <Zap size={20} fill="currentColor" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[0.7rem] font-black uppercase tracking-widest leading-none">Registrar Protocolo de Testeo</p>
                                                                            <p className="text-[0.55rem] font-bold opacity-60 uppercase mt-1">Impacto Metodológico: Muy Alto</p>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight size={20} className="opacity-30 group-hover/test:translate-x-1 transition-transform" />
                                                                </div>
                                                                <div className="mt-4 flex gap-3">
                                                                    <button className={`flex-1 py-3 rounded-2xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${ep.modalidadTesteo === 'DIRECTO' ? 'bg-rojo text-marino' : 'bg-naranja text-marino'}`}>
                                                                        Iniciar Evaluación
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Video Floating Button */}
                                                    {tieneVideo && ep.ejercicio?.urlVideo && (
                                                        <a
                                                            href={ep.ejercicio.urlVideo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="shrink-0 w-12 h-12 bg-marino-3 border border-marino-4 rounded-2xl flex items-center justify-center text-naranja hover:bg-naranja hover:text-marino transition-all shadow-xl active:scale-90"
                                                        >
                                                            <Play size={18} fill="currentColor" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Navegación entre semanas */}
                {todasLasSemanas.length > 1 && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-gris uppercase tracking-[0.2em] ml-1">Todas las semanas</h2>
                        <div className="space-y-2">
                            {todasLasSemanas.map((semana) => {
                                const diasSemana = semana.diasSesion.filter(d => d.ejercicios.length > 0);
                                const esActiva = semana.id === semanaActiva?.id;
                                return (
                                    <div
                                        key={semana.id}
                                        className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${esActiva
                                            ? 'bg-naranja/10 border-naranja/40'
                                            : 'bg-marino-2 border-marino-4'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-barlow-condensed font-black text-sm ${esActiva ? 'bg-naranja text-marino' : 'bg-marino-4 text-gris'}`}>
                                            {semana.numeroSemana}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${esActiva ? 'text-blanco' : 'text-gris-claro'}`}>
                                                Semana {semana.numeroSemana}
                                                {semana.esFaseDeload && <span className="ml-2 text-[0.55rem] font-black text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-1.5 py-0.5 rounded uppercase">Deload</span>}
                                            </p>
                                            <p className="text-[0.6rem] text-gris font-medium">
                                                {semana.objetivoSemana} · RIR {semana.RIRobjetivo} · {diasSemana.length} días
                                            </p>
                                        </div>
                                        {esActiva && <ChevronRight size={16} className="text-naranja" />}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            <AlumnoNav />
        </div>
    );
}
