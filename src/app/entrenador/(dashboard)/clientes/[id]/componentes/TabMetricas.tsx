"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    Dumbbell,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    TrendingDown,
    Zap
} from "lucide-react";
import { obtenerResumenMetricasCliente } from "@/nucleo/acciones/metricas.accion";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface MetricasAdherencia {
    sesionesPlanificadas: number;
    sesionesCompletadas: number;
    porcentajeSeriesCompletadas: number;
    patronesIncumplimiento: {
        ejercicioId: string;
        nombre: string;
        frecuenciaSalto: number;
    }[];
}

interface MetricasTonelaje {
    totalMovidoKg: number;
    porSemana: {
        numeroSemana: number;
        tonelaje: number;
    }[];
    estancamientoDetectado: boolean;
}

interface ResumenMetricasData {
    adherencia: MetricasAdherencia | null;
    tonelaje: MetricasTonelaje | null;
    ultimoCheckin: {
        fecha: Date;
        pesoKg?: number | null;
    } | null;
}

interface Props {
    clienteId: string;
}

export default function TabMetricas({ clienteId }: Props) {
    const [loading, setLoading] = useState(true);
    const [datos, setDatos] = useState<ResumenMetricasData | null>(null);

    useEffect(() => {
        async function cargar() {
            setLoading(true);
            const res = await obtenerResumenMetricasCliente(clienteId);
            if (res.exito && res.datos) {
                setDatos(res.datos as ResumenMetricasData);
            }
            setLoading(false);
        }
        cargar();
    }, [clienteId]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-naranja border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gris text-xs font-black uppercase tracking-widest animate-pulse">Calculando métricas de rendimiento...</p>
            </div>
        );
    }

    if (!datos?.adherencia && !datos?.tonelaje) {
        return (
            <div className="bg-marino-2 border border-marino-4 p-12 rounded-3xl text-center">
                <Zap size={40} className="text-marino-4 mx-auto mb-4" />
                <h3 className="text-blanco font-barlow-condensed font-black uppercase text-xl mb-2">Sin datos suficientes</h3>
                <p className="text-gris text-sm max-w-sm mx-auto">El cliente todavía no tiene un macrociclo activo o registros de entrenamiento para generar métricas de rendimiento.</p>
            </div>
        );
    }

    const hasStagnation = datos.tonelaje?.estancamientoDetectado;
    const isNew = datos.tonelaje?.totalMovidoKg === 0 && (datos.adherencia?.sesionesCompletadas === 0);
    const highAdherence = (datos.adherencia?.porcentajeSeriesCompletadas || 0) > 85;

    return (
        <div className="space-y-8 fade-up visible">
            {/* ──── BANNERS DE INSIGHTS (INTELIGENCIA) ──── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Insight de Adherencia */}
                {isNew ? (
                    <div className="p-4 rounded-2xl border bg-marino-3/50 border-marino-4 flex items-start gap-4">
                        <Activity className="text-gris mt-1" size={20} />
                        <div>
                            <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-1 text-blanco">
                                Esperando Datos
                            </h4>
                            <p className="text-[0.7rem] text-gris font-medium leading-relaxed">
                                Aún no hay sesiones completadas para calcular la adherencia del atleta.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${highAdherence ? 'bg-green-500/10 border-green-500/20' : 'bg-naranja/10 border-naranja/30'}`}>
                        {highAdherence ? <CheckCircle2 className="text-green-500 mt-1" size={20} /> : <AlertCircle className="text-naranja mt-1" size={20} />}
                        <div>
                            <h4 className={`text-[0.65rem] font-black uppercase tracking-widest mb-1 ${highAdherence ? 'text-green-400' : 'text-naranja'}`}>
                                {highAdherence ? 'Apta Adherencia' : 'Análisis de Adherencia'}
                            </h4>
                            <p className="text-[0.7rem] text-gris font-medium leading-relaxed">
                                {highAdherence
                                    ? "El atleta mantiene un cumplimiento óptimo. Listo para incrementar intensidad o volumen en el próximo bloque."
                                    : "Se detectan desvíos en el cumplimiento. Revisar si el volumen actual es sostenible para el estilo de vida del cliente."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Insight de Progresión */}
                {isNew ? (
                    <div className="p-4 rounded-2xl border bg-marino-3/50 border-marino-4 flex items-start gap-4">
                        <Dumbbell className="text-gris mt-1" size={20} />
                        <div>
                            <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-1 text-blanco">
                                Construyendo Tonelaje
                            </h4>
                            <p className="text-[0.7rem] text-gris font-medium leading-relaxed">
                                El sistema comenzará a medir el progreso de carga una vez que el cliente registre sus primeros levantamientos.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${hasStagnation ? 'bg-rojo/10 border-rojo/30' : 'bg-blue-500/10 border-blue-500/20'}`}>
                        {hasStagnation ? <TrendingDown className="text-rojo mt-1" size={20} /> : <TrendingUp className="text-blue-400 mt-1" size={20} />}
                        <div>
                            <h4 className={`text-[0.65rem] font-black uppercase tracking-widest mb-1 ${hasStagnation ? 'text-rojo' : 'text-blue-400'}`}>
                                {hasStagnation ? 'Alerta de Estancamiento' : 'Progresión de Carga Activa'}
                            </h4>
                            <p className="text-[0.7rem] text-gris font-medium leading-relaxed">
                                {hasStagnation
                                    ? "Se detectan 3 semanas sin mejora en el tonelaje total. Considerar una fase de descarga (Deload) o cambio de estímulo."
                                    : "La progresión de carga es positiva. El tonelaje acumulado muestra una curva de adaptación anatómica saludable."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ──── KPI CARDS ──── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-naranja/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <Activity size={20} className="text-naranja mx-auto mb-4" />
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Adherencia Global</span>
                    <span className="text-4xl font-barlow-condensed font-black text-blanco">
                        {Math.round(datos.adherencia?.porcentajeSeriesCompletadas || 0)}%
                    </span>
                    <div className="mt-4 h-1.5 w-full bg-marino-4 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-naranja transition-all duration-1000 shadow-[0_0_10px_rgba(255,152,0,0.5)]"
                            style={{ width: `${datos.adherencia?.porcentajeSeriesCompletadas || 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg group">
                    <Dumbbell size={20} className="text-blue-400 mx-auto mb-4" />
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Tonelaje Acumulado</span>
                    <span className="text-4xl font-barlow-condensed font-black text-blanco">
                        {(datos.tonelaje?.totalMovidoKg || 0).toLocaleString()} <span className="text-sm">kg</span>
                    </span>
                    <p className="text-[0.55rem] text-gris mt-2 uppercase tracking-tighter">Total movido en el macrociclo actual</p>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg group">
                    <Calendar size={20} className="text-green-500 mx-auto mb-4" />
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Último Check-in</span>
                    <span className="text-xl font-barlow-condensed font-black text-blanco uppercase">
                        {datos.ultimoCheckin ? new Date(datos.ultimoCheckin.fecha).toLocaleDateString() : 'Pendiente'}
                    </span>
                    {datos.ultimoCheckin?.pesoKg && (
                        <p className="text-[0.65rem] text-green-400 mt-2 font-bold uppercase tracking-widest">{datos.ultimoCheckin.pesoKg} kg corporales</p>
                    )}
                </div>
            </div>

            {/* ──── GRÁFICO DE PROGRESIÓN DE CARGA ──── */}
            <div className="bg-marino-2 border border-marino-4 p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-barlow-condensed font-black uppercase text-blanco">Curva de Tonelaje Semanal</h4>
                        <p className="text-[0.65rem] text-gris font-medium uppercase tracking-widest">Evolución de la carga total movida por microciclo</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <ArrowUpRight className="text-blue-400" size={20} />
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datos.tonelaje?.porSemana || []}>
                            <defs>
                                <linearGradient id="colorTon" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                            <XAxis
                                dataKey="numeroSemana"
                                stroke="#64748B"
                                fontSize={10}
                                tickSize={0}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(val) => `Sem ${val}`}
                            />
                            <YAxis
                                stroke="#64748B"
                                fontSize={10}
                                tickSize={0}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(val) => `${val}kg`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                                itemStyle={{ color: '#F8FAFC', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#94A3B8', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="tonelaje"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTon)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ──── PATRONES DE INCUMPLIMIENTO (LA PARTE "HUMANA") ──── */}
            {datos?.adherencia && datos.adherencia.patronesIncumplimiento.length > 0 && (
                <div className="bg-marino-2 border border-marino-4 p-8 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-naranja" size={20} />
                        <h4 className="text-xl font-barlow-condensed font-black uppercase text-blanco">Análisis de Patrones Críticos</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {datos.adherencia.patronesIncumplimiento.map((p) => (
                            <div key={p.ejercicioId} className="bg-marino-3/50 border border-marino-4 p-4 rounded-2xl flex items-center justify-between group hover:border-naranja/40 transition-all">
                                <div>
                                    <p className="text-xs font-black text-blanco uppercase tracking-wider">{p.nombre}</p>
                                    <p className="text-[0.6rem] text-gris font-medium mt-1">Se saltea el {Math.round(p.frecuenciaSalto)}% de las series</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-rojo">{Math.round(p.frecuenciaSalto)}%</span>
                                    <div className="w-12 h-1 bg-rojo/20 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-rojo" style={{ width: `${p.frecuenciaSalto}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-[0.65rem] text-gris italic">
                        * Estos ejercicios muestran una tasa de salto superior al 30%. Recomendamos revisar el feedback subjetivo o ajustar la variante.
                    </p>
                </div>
            )}
        </div>
    );
}
