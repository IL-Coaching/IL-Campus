import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";
import { Dumbbell, Play, ChevronRight, Calendar, Clock, Target, Zap, BookOpen } from "lucide-react";

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

export default async function RutinaPage() {
    const alumno = await getAlumnoSesion();

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
        <div className="min-h-screen bg-marino pb-28 text-blanco">
            {/* Header */}
            <header className="p-6 pt-10 border-b border-marino-4 bg-marino-2/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-[0.2em] block mb-1">Plan Activo</span>
                        <h1 className="text-3xl font-barlow-condensed font-black uppercase leading-none text-blanco">
                            Tu Rutina
                        </h1>
                        {semanaActiva && (
                            <p className="text-gris text-xs font-medium mt-1">
                                Semana {semanaActiva.numeroSemana} · {semanaActiva.objetivoSemana}
                            </p>
                        )}
                    </div>
                    <div className="bg-marino-3 border border-marino-4 rounded-2xl p-3 flex flex-col items-center min-w-[60px]">
                        <span className="text-2xl font-barlow-condensed font-black text-naranja">{diasConEjercicios.length}</span>
                        <span className="text-[0.5rem] text-gris uppercase font-bold tracking-widest">días</span>
                    </div>
                </div>
            </header>

            <main className="p-5 space-y-6 animate-in fade-in duration-500">

                {/* Stats semanales */}
                <section className="grid grid-cols-3 gap-3">
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-4 text-center">
                        <Target size={16} className="text-naranja mx-auto mb-2" />
                        <span className="text-xl font-barlow-condensed font-black text-blanco block">{totalEjercicios}</span>
                        <span className="text-[0.55rem] text-gris uppercase font-bold tracking-widest">ejercicios</span>
                    </div>
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-4 text-center">
                        <Zap size={16} className="text-naranja mx-auto mb-2" />
                        <span className="text-xl font-barlow-condensed font-black text-blanco block">
                            {semanaActiva?.RIRobjetivo ?? "-"}
                        </span>
                        <span className="text-[0.55rem] text-gris uppercase font-bold tracking-widest">RIR objetivo</span>
                    </div>
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-4 text-center">
                        <BookOpen size={16} className="text-naranja mx-auto mb-2" />
                        <span className="text-xl font-barlow-condensed font-black text-blanco block">
                            {bloqueSemanaActiva?.objetivo.slice(0, 8) || "—"}
                        </span>
                        <span className="text-[0.55rem] text-gris uppercase font-bold tracking-widest">objetivo</span>
                    </div>
                </section>

                {/* Lista de Días de Entrenamiento */}
                {diasConEjercicios.length === 0 ? (
                    <div className="bg-marino-2 border border-marino-4 rounded-3xl p-10 text-center">
                        <Dumbbell size={32} className="text-marino-4 mx-auto mb-3" />
                        <p className="text-gris text-sm font-medium">Tu rutina de esta semana aún no tiene ejercicios asignados.</p>
                    </div>
                ) : (
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold text-gris uppercase tracking-[0.2em] ml-1">Esta semana</h2>
                        {diasConEjercicios.map((dia) => (
                            <div key={dia.id} className="bg-marino-2 border border-marino-4 rounded-3xl overflow-hidden">
                                {/* Cabecera del día */}
                                <div className="px-5 py-4 border-b border-marino-4 flex items-center justify-between bg-marino-3/30">
                                    <div>
                                        <h3 className="font-barlow-condensed font-black uppercase text-xl text-blanco leading-none">
                                            {dia.diaSemana}
                                        </h3>
                                        {dia.focoMuscular && (
                                            <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-widest mt-0.5 block">
                                                {dia.focoMuscular}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[0.6rem] font-bold text-gris uppercase">
                                            {dia.ejercicios.length} ejercicios
                                        </span>
                                        <Clock size={12} className="text-gris" />
                                    </div>
                                </div>

                                {/* Lista de Ejercicios del día */}
                                <div className="divide-y divide-marino-4">
                                    {dia.ejercicios.map((ep, idx) => {
                                        const nombreEjercicio = ep.ejercicio?.nombre || ep.nombreLibre || "Ejercicio sin nombre";
                                        const tieneVideo = !!ep.ejercicio?.urlVideo;
                                        const musculo = ep.ejercicio?.musculoPrincipal;
                                        const esLongitudLarga = ep.ejercicio?.posicionCarga === "LONGITUD_LARGA";

                                        return (
                                            <div key={ep.id} className="px-5 py-4 flex items-start gap-4">
                                                {/* Número */}
                                                <span className="w-6 h-6 rounded-full bg-marino-4 border border-marino-5 flex items-center justify-center text-[0.6rem] font-black text-gris shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>

                                                {/* Info ejercicio */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <p className="font-bold text-blanco text-sm leading-tight">{nombreEjercicio}</p>
                                                        {tieneVideo && (
                                                            <span className="text-[0.55rem] font-black text-naranja border border-naranja/30 bg-naranja/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                <Play size={7} fill="currentColor" /> VIDEO
                                                            </span>
                                                        )}
                                                        {esLongitudLarga && (
                                                            <span className="text-[0.5rem] font-black text-green-400 border border-green-400/30 bg-green-400/10 px-1.5 py-0.5 rounded">
                                                                🟢 IUSCA
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Series / Reps / RIR */}
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-[0.65rem] font-bold text-naranja">
                                                            {ep.series} × {ep.repsMin}-{ep.repsMax}
                                                        </span>
                                                        <span className="text-[0.6rem] text-gris font-medium">
                                                            RIR {ep.RIR}
                                                        </span>
                                                        {ep.descansoSegundos > 0 && (
                                                            <span className="text-[0.6rem] text-gris font-medium">
                                                                {ep.descansoSegundos}s descanso
                                                            </span>
                                                        )}
                                                        {ep.pesoSugerido && (
                                                            <span className="text-[0.6rem] font-bold text-blanco bg-marino-4 px-2 py-0.5 rounded">
                                                                {ep.pesoSugerido} kg sugerido
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Badge músculo */}
                                                    {musculo && (
                                                        <div className="mt-1.5">
                                                            <span className={`text-[0.5rem] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter ${badgeMusculo(musculo)}`}>
                                                                {musculo}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Notas técnicas */}
                                                    {ep.notasTecnicas && (
                                                        <p className="text-[0.6rem] text-gris italic mt-2 leading-relaxed">
                                                            📌 {ep.notasTecnicas}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Link al video si existe */}
                                                {tieneVideo && ep.ejercicio?.urlVideo && (
                                                    <a
                                                        href={ep.ejercicio.urlVideo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 w-10 h-10 bg-naranja/10 border border-naranja/30 rounded-xl flex items-center justify-center text-naranja hover:bg-naranja hover:text-marino transition-all active:scale-90"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Play size={14} fill="currentColor" />
                                                    </a>
                                                )}
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
