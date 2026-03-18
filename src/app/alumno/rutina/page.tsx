import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";
import { ShieldAlert, Dumbbell, Calendar } from "lucide-react";
import { Cliente } from '@prisma/client';
import { DescargarRutinaBtn } from "@/compartido/componentes/pdf/DescargarRutinaBtn";
import RutinaClient from "./RutinaClient";

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

    // Buscar el macrociclo activo y datos del entrenador en paralelo
    const [macrociclo, datosEntrenador] = await Promise.all([
        prisma.macrociclo.findFirst({
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
                                        sesionesReales: {
                                            orderBy: { fecha: "desc" },
                                            take: 1,
                                            select: {
                                                id: true,
                                                fecha: true,
                                                completada: true,
                                                duracionMinutos: true
                                            }
                                        },
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
        }),
        prisma.entrenador.findUnique({
            where: { id: alumno.entrenadorId },
            select: { nombre: true }
        })
    ]);

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
    const semanaActiva = todasLasSemanas.find(s =>
        s.diasSesion.some(d => d.ejercicios.length > 0)
    ) || todasLasSemanas[0];

    const bloqueSemanaActiva = macrociclo.bloquesMensuales.find(b =>
        b.semanas.some(s => s.id === semanaActiva?.id)
    );

    const macrocicloData = {
        semanaActiva,
        todasLasSemanas,
        bloqueObjetivo: bloqueSemanaActiva?.objetivo,
        notasMacrociclo: macrociclo.notas
    };

    return (
        <div className="min-h-screen bg-marino pb-32 text-blanco selection:bg-naranja/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden origin-top opacity-50 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-naranja/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full"></div>
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
                                <span className="w-1.5 h-1.5 rounded-full bg-verde shadow-[0_0_6px_rgba(74,222,128,0.6)]"></span>
                                <p className="text-gris text-[0.65rem] font-bold uppercase tracking-widest leading-none">
                                    Conectado
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

            <main className="p-5 relative z-10 max-w-2xl mx-auto">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RutinaClient macrocicloData={macrocicloData as any} />
            </main>

            <div className="z-50 relative">
                <AlumnoNav />
            </div>
        </div>
    );
}
