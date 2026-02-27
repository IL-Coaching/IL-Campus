"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SemanaConDias } from "@/nucleo/tipos/planificacion.tipos";
import { Calendar, Trash2, Zap, Plus, Activity, BarChart3, AlertTriangle, Layers, Copy, ClipboardPaste, Loader2 } from "lucide-react";
import { crearSesion, eliminarSesion, obtenerVolumenSemanal, actualizarSemana, clonarSemana } from "@/nucleo/acciones/planificacion.accion";
import { ModeloPeriodizacion } from "@prisma/client";

interface VistaMicrocicloProps {
    semana: SemanaConDias;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [volumen, setVolumen] = useState<{ grupoMuscular: string; seriesTotal: number; estado: string }[]>([]);
    const [loadingVol, setLoadingVol] = useState(false);
    const [copiedSemanaId, setCopiedSemanaId] = useState<string | null>(null);
    const [pasting, setPasting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchVolumen = async () => {
            setLoadingVol(true);
            const res = await obtenerVolumenSemanal(semana.id);
            if (res.exito && res.volumen) {
                setVolumen(res.volumen);
            }
            setLoadingVol(false);
        };
        fetchVolumen();
        setCopiedSemanaId(localStorage.getItem('copied_semana_id'));
    }, [semana.id]);

    const handleCopySemana = () => {
        localStorage.setItem('copied_semana_id', semana.id);
        setCopiedSemanaId(semana.id);
        alert("Estructura de la semana copiada.");
    };

    const handlePasteSemana = async () => {
        const idOrigen = localStorage.getItem('copied_semana_id');
        if (!idOrigen) return;
        if (!confirm("Esto reemplazará todas las sesiones de esta semana con las de la semana copiada. ¿Seguro?")) return;

        setPasting(true);
        const res = await clonarSemana(idOrigen, semana.id);
        if (res.exito) {
            router.refresh();
            alert("Semana clonada con éxito.");
        } else {
            alert("Error al pegar semana: " + res.error);
        }
        setPasting(false);
    };

    const handleCrearSesion = async (dia: string) => {
        setIsCreating(true);
        const res = await crearSesion(semana.id, dia);
        if (res.exito) {
            router.refresh();
        } else {
            alert("Error al crear sesión: " + res.error);
        }
        setIsCreating(false);
    };

    const handleEliminarSesion = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta sesión permanentemente?")) return;
        const res = await eliminarSesion(id);
        if (res.exito) {
            router.refresh();
        } else {
            alert("Error al eliminar: " + res.error);
        }
    };

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const hayInterferencia = () => {
        return semana.diasSesion.some(s => {
            const esCardio = s.focoMuscular && s.focoMuscular.toLowerCase().includes('cardio');
            return esCardio && s.ejercicios.length > 0;
        });
    };

    const interferencia = hayInterferencia();

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Microciclo */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-marino-4 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-marino-3 rounded-lg border border-marino-4">
                            <Calendar size={18} className="text-naranja" />
                        </div>
                        <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] block">Distribución Semanal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-5xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                            Semana {semana.numeroSemana} <span className="text-gris/30 mx-2">—</span> {semana.objetivoSemana}
                        </h2>
                        {semana.esFaseDeload && (
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest border border-blue-500/30 animate-pulse">
                                Fase de Deload
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Selector de Periodización Científica */}
                    <div className="relative group/sel">
                        <div className="flex items-center gap-3 bg-marino-3/50 border border-marino-4 px-4 py-2.5 rounded-xl transition-all hover:border-naranja/40">
                            <Layers size={16} className="text-naranja" />
                            <select
                                defaultValue={semana.modeloPeriodizacion}
                                onChange={async (e) => {
                                    await actualizarSemana(semana.id, { modeloPeriodizacion: e.target.value as ModeloPeriodizacion });
                                    router.refresh();
                                }}
                                className="bg-transparent text-xs font-black text-blanco uppercase tracking-widest outline-none cursor-pointer pr-2"
                            >
                                <option value="LINEAL" className="bg-marino-2 text-blanco">Periodización Lineal</option>
                                <option value="ONDULANTE" className="bg-marino-2 text-blanco">Periodización Ondulante</option>
                                <option value="CONJUGADA" className="bg-marino-2 text-blanco">Periodización Conjugada</option>
                                <option value="PERSONALIZADO" className="bg-marino-2 text-blanco">Personalizado</option>
                            </select>
                        </div>
                    </div>

                    {/* Switch de Check-in */}
                    <button
                        onClick={async () => {
                            await actualizarSemana(semana.id, { checkinRequerido: !semana.checkinRequerido });
                            router.refresh();
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${semana.checkinRequerido ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-marino-3/50 border-marino-4 text-gris hover:text-blanco'}`}
                    >
                        <Activity size={16} className={semana.checkinRequerido ? 'animate-pulse' : ''} />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">{semana.checkinRequerido ? '✓ Check-in Pedido' : 'Pedir Check-in'}</span>
                    </button>

                    <button
                        onClick={handleCopySemana}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-marino-4 bg-marino-3/50 text-gris hover:text-blanco transition-all"
                        title="Copiar estructura de toda la semana"
                    >
                        <Copy size={16} />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">Copiar</span>
                    </button>

                    {copiedSemanaId && copiedSemanaId !== semana.id && (
                        <button
                            onClick={handlePasteSemana}
                            disabled={pasting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-naranja/40 bg-naranja/10 text-naranja hover:bg-naranja hover:text-marino transition-all"
                            title="Reemplazar esta semana con la copiada"
                        >
                            {pasting ? <Loader2 className="animate-spin" size={16} /> : <ClipboardPaste size={16} />}
                            <span className="text-[0.65rem] font-black uppercase tracking-widest">{pasting ? "Pegando..." : "Pegar Semana"}</span>
                        </button>
                    )}

                    <div className="flex gap-6 items-center bg-marino-2 p-3.5 rounded-2xl border border-marino-4 shadow-inner">
                        <div className="text-center px-6">
                            <span className="text-[0.55rem] font-bold text-gris uppercase tracking-widest block mb-1">Sesiones</span>
                            <span className="text-xl font-black text-blanco">{semana.diasSesion.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Científico - Volumen Semanal IUSCA */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {diasSemana.map((nombre) => {
                        const sesionesEnEsteDia = semana.diasSesion.filter(d => d.diaSemana === nombre);
                        return (
                            <div key={nombre} className="space-y-3">
                                <div className="text-[0.7rem] text-gris font-black uppercase tracking-[0.2em] border-b border-marino-4 pb-2 mb-4">
                                    {nombre}
                                </div>
                                {sesionesEnEsteDia.length > 0 ? (
                                    <>
                                        {sesionesEnEsteDia.map((s) => (
                                            <div
                                                key={s.id}
                                                onClick={() => onSelectSesion(s.diaSemana)}
                                                className={`group relative bg-marino-2 border rounded-2xl p-6 min-h-[160px] flex flex-col transition-all duration-300 cursor-pointer shadow-lg hover:shadow-naranja/5 mb-3 ${semana.esFaseDeload ? 'border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10' : 'border-marino-4 hover:border-naranja/50 hover:bg-marino-3'}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${semana.esFaseDeload ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-marino' : 'bg-naranja/10 text-naranja group-hover:bg-naranja group-hover:text-marino'}`}>
                                                        <Zap size={16} />
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleEliminarSesion(e, s.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-gris hover:text-[#EF4444] transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="mb-auto">
                                                    <h4 className="text-xl font-barlow-condensed font-black uppercase leading-tight text-blanco group-hover:text-naranja transition-colors">
                                                        {s.focoMuscular}
                                                    </h4>
                                                    <span className="text-[0.6rem] text-gris font-bold uppercase tracking-widest">
                                                        {s.ejercicios.length} Ejercicios
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => !isCreating && handleCrearSesion(nombre)}
                                            className="group h-[60px] border-2 border-dashed border-marino-4 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 group-hover:text-naranja transition-all">
                                                <Plus size={14} />
                                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-gris group-hover:text-naranja">Añadir Sesión</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        onClick={() => !isCreating && handleCrearSesion(nombre)}
                                        className="group h-[160px] border-2 border-dashed border-marino-4 rounded-2xl flex flex-col items-center justify-center p-4 opacity-40 hover:opacity-100 hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer"
                                    >
                                        <div className="p-3 bg-marino-3 rounded-full mb-2 group-hover:bg-naranja group-hover:text-marino transition-all shadow-inner">
                                            <Plus size={16} />
                                        </div>
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gris">Añadir</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-marino-2 border border-marino-4 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-naranja/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-naranja/10 transition-colors"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-naranja/10 rounded-xl border border-naranja/20">
                                <BarChart3 size={20} className="text-naranja" />
                            </div>
                            <div>
                                <h4 className="text-xl font-barlow-condensed font-black uppercase text-blanco leading-none">Volumen Semanal</h4>
                                <span className="text-[0.55rem] font-bold text-naranja uppercase tracking-widest">Consenso IUSCA 2021</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 relative z-10">
                        {loadingVol ? (
                            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-naranja border-t-transparent rounded-full animate-spin"></div></div>
                        ) : volumen.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gris text-xs font-medium italic">Sin datos de volumen.</p>
                            </div>
                        ) : volumen.map((v) => (
                            <div key={v.grupoMuscular} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[0.7rem] font-black text-blanco uppercase tracking-wider">{v.grupoMuscular}</span>
                                    <span className="text-sm font-black text-blanco">{v.seriesTotal}</span>
                                </div>
                                <div className="h-2 w-full bg-marino-4 rounded-full overflow-hidden flex">
                                    {Array.from({ length: Math.min(v.seriesTotal, 20) }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-full flex-1 border-r border-marino-2 last:border-0 ${v.estado === 'BAJO' ? 'bg-rojo' : v.estado === 'ELEVADO' ? 'bg-naranja' : 'bg-[#22C55E]'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerta de Interferencia */}
            {interferencia && (
                <div className="bg-naranja/10 border border-naranja/30 rounded-2xl p-6 flex items-center gap-6">
                    <AlertTriangle className="text-naranja" size={24} />
                    <p className="text-xs text-gris font-medium">Interferencia detectada (Cardio + Fuerza). Recomendación IUSCA: +6h separación.</p>
                </div>
            )}
        </div>
    );
}
