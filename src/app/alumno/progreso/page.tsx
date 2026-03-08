import { TrendingUp, Calendar, Battery, Moon, Activity, Flame, Award, AlertCircle } from 'lucide-react';
import { obtenerDatosProgreso } from '@/nucleo/acciones/progreso-alumno.accion';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TesteoFuerzaAlumno from './TesteoFuerzaAlumno';

export default async function ProgresoPage() {
    const datos = await obtenerDatosProgreso();
    const { estadisticas, checkins } = datos.progreso;

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            <header className="p-6 pt-10 border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                <h1 className="text-2xl font-barlow-condensed font-black uppercase">Tu Progreso</h1>
                <p className="text-[0.6rem] text-gris uppercase tracking-widest mt-1">Seguimiento de tu evolución</p>
            </header>

            <main className="p-6 space-y-6">
                {/* Stats principales */}
                <section>
                    <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Resumen</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-naranja/20 to-naranja/5 border border-naranja/20 p-4 rounded-2xl">
                            <Award size={20} className="text-naranja mb-2" />
                            <p className="text-2xl font-barlow-condensed font-black text-blanco">{estadisticas.semanasActivas}</p>
                            <p className="text-[0.6rem] text-gris uppercase tracking-widest">Semanas activo</p>
                        </div>
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-2xl">
                            <Calendar size={20} className="text-blue-400 mb-2" />
                            <p className="text-2xl font-barlow-condensed font-black text-blanco">{estadisticas.totalCheckins}</p>
                            <p className="text-[0.6rem] text-gris uppercase tracking-widest">Check-ins</p>
                        </div>
                    </div>
                </section>

                {/* Métricas de sensación */}
                <section>
                    <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Cómo te has sentido (promedio)</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-2xl text-center">
                            <Battery size={18} className="text-yellow-400 mx-auto mb-2" />
                            <p className="text-xl font-barlow-condensed font-black text-blanco">{estadisticas.promedioEnergia}/10</p>
                            <p className="text-[0.5rem] text-gris uppercase tracking-widest mt-1">Energía</p>
                        </div>
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-2xl text-center">
                            <Moon size={18} className="text-blue-400 mx-auto mb-2" />
                            <p className="text-xl font-barlow-condensed font-black text-blanco">{estadisticas.promedioSueno}/10</p>
                            <p className="text-[0.5rem] text-gris uppercase tracking-widest mt-1">Sueño</p>
                        </div>
                        <div className="bg-marino-2 border border-marino-4 p-4 rounded-2xl text-center">
                            <Activity size={18} className="text-green-400 mx-auto mb-2" />
                            <p className="text-xl font-barlow-condensed font-black text-blanco">{estadisticas.promedioAdherencia}%</p>
                            <p className="text-[0.5rem] text-gris uppercase tracking-widest mt-1">Adherencia</p>
                        </div>
                    </div>
                </section>

                {/* Historial de check-ins */}
                <section>
                    <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Historial reciente</h3>
                    <div className="space-y-3">
                        {checkins.length === 0 ? (
                            <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center">
                                <TrendingUp size={24} className="text-gris mx-auto mb-2" />
                                <p className="text-gris text-sm">Aún no hay registros</p>
                                <p className="text-[0.6rem] text-gris-claro mt-1">Completá tu primer check-in</p>
                            </div>
                        ) : (
                            checkins.slice(0, 8).map((checkin) => (
                                <div key={checkin.id} className="bg-marino-2 border border-marino-4 p-4 rounded-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-naranja uppercase tracking-widest">
                                            {format(new Date(checkin.fecha), "dd MMMM", { locale: es })}
                                        </p>
                                        <div className="flex gap-3 text-[0.6rem]">
                                            <span className="flex items-center gap-1 text-yellow-400">
                                                <Battery size={10} /> {checkin.energia}
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-400">
                                                <Moon size={10} /> {checkin.sueno}
                                            </span>
                                            <span className="flex items-center gap-1 text-green-400">
                                                <Activity size={10} /> {checkin.adherencia}%
                                            </span>
                                        </div>
                                    </div>
                                    {checkin.nota && (
                                        <p className="text-xs text-gris-claro italic">&quot;{checkin.nota}&quot;</p>
                                    )}
                                    {checkin.ajustesEsperados && (
                                        <p className="text-[0.6rem] text-red-400 mt-2 flex items-center gap-1">
                                            <AlertCircle size={10} /> {checkin.ajustesEsperados}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Testeo de Fuerza / RM */}
                <section>
                    <TesteoFuerzaAlumno />
                </section>

                {/* motivational */}
                <section className="py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-naranja/10 border border-naranja/20 rounded-full">
                        <Flame size={16} className="text-naranja" />
                        <p className="text-xs font-bold text-naranja uppercase tracking-widest">Sigue así</p>
                    </div>
                </section>
            </main>

            <AlumnoNav />
        </div>
    );
}
