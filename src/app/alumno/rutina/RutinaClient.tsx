"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Dumbbell, Play, Clock, Zap, ShieldAlert, ArrowLeft, Square, RotateCcw, CheckCircle2, Activity, AlertCircle } from "lucide-react";
import { guardarSeries, obtenerSeriesRegistradas, finalizarSesion } from "@/nucleo/acciones/sesion-alumno.accion";
import { registrarPesoSesion } from "@/nucleo/acciones/checkin.accion";

// Types
type Ejercicio = {
    id: string;
    nombreLibre: string | null;
    series: number;
    repsMin: number | null;
    repsMax: number | null;
    RIR: number | null;
    descansoSegundos: number | null;
    pesoSugerido: number | null;
    esTesteo: boolean;
    modalidadTesteo: string | null;
    notasTecnicas: string | null;
    bloqueId?: string | null;
    bloque?: {
        id: string;
        nombre: string | null;
        modalidad: string;
        orden: number;
    } | null;
    ejercicio: {
        nombre: string;
        urlVideo: string | null;
        thumbnailUrl: string | null;
        musculoPrincipal: string | null;
        posicionCarga: string | null;
    } | null;
};

type SesionRealMeta = {
    id: string;
    fecha: Date;
    completada: boolean;
    duracionMinutos: number | null;
};

type DiaSesion = {
    id: string;
    diaSemana: string;
    focoMuscular: string | null;
    notas: string | null;
    ejercicios: Ejercicio[];
    sesionesReales?: SesionRealMeta[];
};

type Semana = {
    id: string;
    numeroSemana: number;
    objetivoSemana: string | null;
    RIRobjetivo: number | null;
    esFaseDeload: boolean;
    diasSesion: DiaSesion[];
};

type MacrocicloData = {
    semanaActiva: Semana | undefined;
    todasLasSemanas: Semana[];
    bloqueObjetivo: string | undefined;
    notasMacrociclo: string | null;
};

const DIA_ORDEN: Record<string, number> = {
    Lunes: 1, Martes: 2, Miércoles: 3, Miercoles: 3,
    Jueves: 4, Viernes: 5, Sábado: 6, Sabado: 6, Domingo: 7
};



function CronometroDescanso({ segundos }: { segundos: number }) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft !== null && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev! - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            setIsRunning(false);
            try {
                const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
                audio.play().catch(() => {});
            } catch {}
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        if (timeLeft === 0 || timeLeft === null) {
            setTimeLeft(segundos);
        }
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(segundos);
    };

    const displayTime = timeLeft !== null ? timeLeft : segundos;
    const mins = Math.floor(displayTime / 60);
    const secs = displayTime % 60;
    const format = `${mins}:${secs.toString().padStart(2, '0')}`;

    return (
        <div className="flex items-center justify-between gap-3 bg-marino-2 p-2.5 rounded-xl border border-marino-4/50 w-full min-w-[140px]">
            <div className="flex items-center gap-2">
                <Clock size={14} className={isRunning ? "text-naranja animate-pulse" : "text-gris"} />
                <span className={`font-mono text-lg leading-none font-bold ${isRunning ? "text-naranja" : "text-blanco"}`}>
                    {format}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                {(timeLeft !== null && timeLeft !== segundos) && (
                    <button onClick={handleReset} className="p-1.5 bg-marino-3 hover:bg-marino-4 rounded-md text-gris/70 hover:text-gris transition-colors flex items-center justify-center">
                        <RotateCcw size={14} />
                    </button>
                )}
                <button onClick={handleStart} className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-verde/20 text-verde hover:bg-verde/30'}`}>
                    {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
            </div>
        </div>
    );
}


function CronometroSesion({ diaId, sesionIniciada, onIniciar }: { diaId: string, sesionIniciada: boolean, onIniciar: () => void }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!sesionIniciada) {
            setSeconds(0);
            return;
        }

        const storedStart = localStorage.getItem(`sesion_inicio_${diaId}`);
        let startTime: number;

        if (storedStart) {
            startTime = parseInt(storedStart);
        } else {
            startTime = Date.now();
            localStorage.setItem(`sesion_inicio_${diaId}`, startTime.toString());
        }

        const interval = setInterval(() => {
            const now = Date.now();
            setSeconds(Math.floor((now - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [diaId, sesionIniciada]);

    const format = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-2xl border ${sesionIniciada ? 'bg-marino-3/50 border-naranja/20 shadow-lg shadow-naranja/5' : 'bg-marino-2 border-marino-4/30'}`}>
            <Clock size={16} className={sesionIniciada ? "text-naranja animate-pulse" : "text-gris"} />
            <div className="flex flex-col">
                <span className="text-[0.45rem] font-black text-gris uppercase tracking-[0.2em] leading-none mb-1">Duración</span>
                <span className="font-mono text-lg font-black tracking-widest leading-none text-blanco">
                    {format(seconds)}
                </span>
            </div>
            {!sesionIniciada && (
                <button 
                    onClick={onIniciar}
                    className="ml-3 bg-naranja/10 text-naranja border border-naranja/20 hover:bg-naranja hover:text-marino transition-colors px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest flex items-center gap-1.5"
                >
                    <Play size={10} fill="currentColor" /> Iniciar
                </button>
            )}
        </div>
    );
}

type SetLogEntry = { pesoKg: string; repsReales: string; notas: string };

function RegistroSeries({
    ejercicioPlanificadoId,
    diaId,
    numSeries,
    pesoSugerido,
    seriesRegistradas,
}: {
    ejercicioPlanificadoId: string;
    diaId: string;
    numSeries: number;
    pesoSugerido: number | null;
    seriesRegistradas?: SetLogEntry[];
}) {
    // Si viene la data de DB, rellenamos SIEMPRE hasta completar numSeries (Evitamos el bug de borrado)
    const initialState = Array.from({ length: numSeries }, (_, idx) => {
        const sr = seriesRegistradas?.[idx];
        return {
            pesoKg: sr?.pesoKg ?? (pesoSugerido ? String(pesoSugerido) : ""),
            repsReales: sr?.repsReales ?? "",
            notas: sr?.notas ?? ""
        };
    });    const [sets, setSets] = useState<SetLogEntry[]>(initialState);
    const [estadoGuardado, setEstadoGuardado] = useState<"ignorado" | "guardando" | "guardado" | "error">("ignorado");
    const [, startTransition] = useTransition();

    // Use a ref to keep track of the timeout ID
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const guardarSilencioso = (currentSets: SetLogEntry[]) => {
        setEstadoGuardado("guardando");
        
        const payload = currentSets.map(s => ({
            pesoKg: s.pesoKg !== "" ? parseFloat(s.pesoKg) : null,
            repsReales: s.repsReales !== "" ? parseInt(s.repsReales) : null,
            notas: s.notas || null
        }));

        // Si es la primera vez que hace algo, iniciar la sesión en LocalStorage
        const started = localStorage.getItem(`sesion_inicio_${diaId}`);
        if (!started) {
            localStorage.setItem(`sesion_inicio_${diaId}`, Date.now().toString());
            window.dispatchEvent(new Event('storage'));
        }

        startTransition(async () => {
            const res = await guardarSeries({ diaId, ejercicioPlanificadoId, series: payload });
            if (res.exito) {
                setEstadoGuardado("guardado");
                window.dispatchEvent(new Event('storage'));
            } else {
                setEstadoGuardado("error");
            }
        });
    };

    const handleChange = (idx: number, field: keyof SetLogEntry, val: string) => {
        const nuevosSets = sets.map((s, i) => i === idx ? { ...s, [field]: val } : s);
        setSets(nuevosSets);
        setEstadoGuardado("guardando");

        // Debounce auto-save
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => guardarSilencioso(nuevosSets), 1200);
    };

    return (
        <div className="mt-4 border-t border-marino-4/30 pt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-[0.6rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={12} className={estadoGuardado === "guardado" ? "text-verde" : "text-gris/40"} />
                    Registro de Series
                </h4>
                {/* Indicador de Estado Automático */}
                <div className="flex items-center gap-1.5">
                    {estadoGuardado === "guardando" && (
                        <span className="text-naranja text-[0.55rem] font-black uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} className="animate-spin" /> Auto-guardando
                        </span>
                    )}
                    {estadoGuardado === "guardado" && (
                        <span className="text-verde text-[0.55rem] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={10} /> Sincronizado
                        </span>
                    )}
                    {estadoGuardado === "error" && (
                        <span className="text-red-400 text-[0.55rem] font-black uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle size={10} /> Error al guardar
                        </span>
                    )}
                </div>
            </div>
            
            <div className="space-y-2 mb-3">
                {sets.map((s, i) => (
                    <div key={i} className="grid grid-cols-[28px_1fr_1fr] items-center gap-2">
                        <span className="text-[0.6rem] font-black text-gris text-center">{i + 1}</span>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="kg"
                                value={s.pesoKg}
                                onChange={e => handleChange(i, 'pesoKg', e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4/60 rounded-lg px-3 py-2 text-sm text-blanco placeholder-gris/40 focus:outline-none focus:border-naranja/50 transition-colors"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.55rem] text-gris/60 font-bold pointer-events-none">KG</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="reps"
                                value={s.repsReales}
                                onChange={e => handleChange(i, 'repsReales', e.target.value)}
                                className="w-full bg-marino-3 border border-marino-4/60 rounded-lg px-3 py-2 text-sm text-blanco placeholder-gris/40 focus:outline-none focus:border-naranja/50 transition-colors"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.55rem] text-gris/60 font-bold pointer-events-none">REP</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mb-2">
                <textarea 
                    placeholder="Escribe aquí si tuviste que realizar otro ejercicio (Ej: Máquina rota, hice press en banco), acotar algún dolor o molestia..."
                    value={sets[0]?.notas || ""}
                    onChange={e => handleChange(0, 'notas', e.target.value)}
                    className="w-full bg-marino-3 border border-marino-4/60 rounded-lg px-3 py-2 text-[0.7rem] text-blanco placeholder-gris/40 focus:outline-none focus:border-naranja/50 transition-colors resize-none h-16"
                />
            </div>
        </div>
    );
}

export default function RutinaClient({ macrocicloData }: { macrocicloData: MacrocicloData }) {
    const { semanaActiva, todasLasSemanas, bloqueObjetivo, notasMacrociclo } = macrocicloData;
    const [semanaSeleccionadaId, setSemanaSeleccionadaId] = useState<string | undefined>(semanaActiva?.id);
    const [diaVisualizado, setDiaVisualizado] = useState<DiaSesion | null>(null);
    const [seriesDelDia, setSeriesDelDia] = useState<Record<string, SetLogEntry[]>>({});
    const [pesoCorporal, setPesoCorporal] = useState("");
    const [isSavingPeso, setIsSavingPeso] = useState(false);
    const [pesoGuardado, setPesoGuardado] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isFinishing, startFinishing] = useTransition();
    const [sesionIniciada, setSesionIniciada] = useState(false);

    const semanaActual = todasLasSemanas.find(s => s.id === semanaSeleccionadaId) || semanaActiva;

    const handleDiaClick = async (dia: DiaSesion) => {
        setDiaVisualizado(dia);
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Check if there's already a saved start time
        const storedStart = localStorage.getItem(`sesion_inicio_${dia.id}`);

        // Cargar series ya registradas hoy
        const res = await obtenerSeriesRegistradas(dia.id);
        if (res.exito && res.series) {
            const hasSeries = res.series.length > 0;
            if (storedStart || hasSeries) setSesionIniciada(true);
            else setSesionIniciada(false);

            const mapped: Record<string, SetLogEntry[]> = {};
            res.series.forEach((s: { ejercicioPlanificadoId: string; pesoKg: number | null; repsReales: number | null; notas?: string | null }) => {
                if (!mapped[s.ejercicioPlanificadoId]) mapped[s.ejercicioPlanificadoId] = [];
                mapped[s.ejercicioPlanificadoId].push({
                    pesoKg: s.pesoKg?.toString() || "",
                    repsReales: s.repsReales?.toString() || "",
                    notas: s.notas || ""
                });
            });
            setSeriesDelDia(mapped);
        } else {
            setSesionIniciada(!!storedStart);
        }
    };

    const handleGuardarPeso = async () => {
        if (!pesoCorporal || isSavingPeso) return;
        setIsSavingPeso(true);
        try {
            const res = await registrarPesoSesion(parseFloat(pesoCorporal));
            if (res.exito) setPesoGuardado(true);
        } finally {
            setIsSavingPeso(false);
        }
    };

    const diasConEjercicios = semanaActual
        ? [...semanaActual.diasSesion]
            .sort((a: DiaSesion, b: DiaSesion) => (DIA_ORDEN[a.diaSemana] || 99) - (DIA_ORDEN[b.diaSemana] || 99))
            .filter((d: DiaSesion) => d.ejercicios.length > 0)
        : [];

    const handleVolverAlHub = () => {
        setDiaVisualizado(null);
    };

    const handleFinalizarClic = () => {
        if (!diaVisualizado) return;
        const totalEjercicios = diaVisualizado.ejercicios.length;
        const completados = diaVisualizado.ejercicios.filter(e => seriesDelDia[e.id] && seriesDelDia[e.id].length > 0).length;
        
        if (completados < totalEjercicios) {
            setShowFinishModal(true);
        } else {
            confirmarFinalizacion();
        }
    };

    const confirmarFinalizacion = () => {
        if (!diaVisualizado) return;
        startFinishing(async () => {
            const res = await finalizarSesion(diaVisualizado.id);
            if (res.exito) {
                localStorage.removeItem(`sesion_inicio_${diaVisualizado.id}`);
                setShowFinishModal(false);
                setDiaVisualizado(null); // Vuelve al hub al finalizar
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert(res.error || "Error al finalizar la sesión.");
            }
        });
    };

    // --- VISTA: MODO FOCO DIARIO ---
    if (diaVisualizado) {
        // Collect all unique muscles for the day
        const musculosDelDia = Array.from(new Set(diaVisualizado.ejercicios.map(e => e.ejercicio?.musculoPrincipal).filter(Boolean)));
        
        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Botón Volver */}
                <button 
                    onClick={handleVolverAlHub}
                    className="flex items-center gap-2 text-gris hover:text-blanco transition-colors mb-6 group bg-marino-2/50 backdrop-blur-md px-4 py-2 rounded-full border border-marino-4/30 hover:border-marino-4"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Volver al Hub Semanal</span>
                </button>

                {/* Cabecera del Día Activo */}
                <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4/50 rounded-[2rem] p-8 mb-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                        <Dumbbell size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`px-3 py-1 border rounded-lg ${sesionIniciada ? 'bg-naranja/10 border-naranja/20' : 'bg-marino-4/20 border-marino-4/30'}`}>
                                    <span className={`text-[0.65rem] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${sesionIniciada ? 'text-naranja' : 'text-gris'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${sesionIniciada ? 'bg-naranja shadow-[0_0_6px_#FF6B00] animate-pulse' : 'bg-gris'}`}></div>
                                        {sesionIniciada ? 'Entrenando' : 'Viendo Plan'}
                                    </span>
                                </div>
                                <CronometroSesion 
                                    diaId={diaVisualizado.id} 
                                    sesionIniciada={sesionIniciada} 
                                    onIniciar={() => setSesionIniciada(true)} 
                                />
                                <span className="text-[0.65rem] font-bold text-gris uppercase tracking-widest hidden md:inline-block">
                                    Semana {semanaActual?.numeroSemana}
                                </span>
                            </div>
                            
                            <h2 className="text-5xl md:text-6xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tighter mb-2">
                                {diaVisualizado.diaSemana}
                            </h2>
                            
                            {diaVisualizado.focoMuscular && (
                                <p className="text-lg text-gris-claro font-medium">
                                    Foco: <span className="text-blanco font-bold">{diaVisualizado.focoMuscular}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 flex-wrap max-w-xs md:justify-end">
                            {musculosDelDia.map(musculo => (
                                <span key={musculo} className="text-[0.55rem] font-black bg-marino-4/30 border border-marino-4/50 text-gris-claro px-2.5 py-1 rounded-md uppercase tracking-widest">
                                    {musculo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registro de Peso Corporal (Antes de empezar) */}
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-naranja/10 flex items-center justify-center border border-naranja/20">
                            <Activity size={24} className="text-naranja" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blanco">Peso Corporal de Hoy</h4>
                            <p className="text-[0.65rem] text-gris uppercase tracking-widest font-bold">Registro matutino o pre-entreno</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="number"
                            placeholder="kg"
                            value={pesoCorporal}
                            disabled={pesoGuardado}
                            onChange={(e) => setPesoCorporal(e.target.value)}
                            className="bg-marino-3 border border-marino-4 rounded-xl px-4 py-2.5 text-blanco font-bold focus:border-naranja/50 focus:outline-none w-full md:w-24 text-center"
                        />
                        <button
                            onClick={handleGuardarPeso}
                            disabled={isSavingPeso || pesoGuardado || !pesoCorporal}
                            className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[0.65rem] transition-all flex items-center gap-2 ${
                                pesoGuardado 
                                ? 'bg-verde/10 text-verde border border-verde/20' 
                                : 'bg-naranja text-marino hover:bg-naranja-h'
                            }`}
                        >
                            {isSavingPeso ? <Clock size={14} className="animate-spin" /> : pesoGuardado ? <CheckCircle2 size={14} /> : 'Guardar'}
                        </button>
                    </div>
                </div>

                {/* Notas del Día (si existen) */}
                {diaVisualizado.notas && (
                    <div className="mb-8 p-5 bg-marino-2/40 border border-blue-500/20 rounded-2xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>
                        <h4 className="text-[0.65rem] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            Notas del Día
                        </h4>
                        <p className="text-sm text-blue-100/80 leading-relaxed whitespace-pre-wrap">
                            {diaVisualizado.notas}
                        </p>
                    </div>
                )}

                {/* Lista de Ejercicios por Bloques */}
                <div className="space-y-6">
                    {(() => {
                        const chunks: any[] = [];
                        let currentBlockId: string | null = null;
                        let currentChunk: any[] = [];
                        let currentBlockName = 'Entrenamiento Principal';
                        let currentModalidad = 'SECUENCIAL';
                        
                        diaVisualizado.ejercicios.forEach(ep => {
                            if (ep.bloqueId !== currentBlockId) {
                                if (currentChunk.length > 0) {
                                    chunks.push({ isBlock: !!currentBlockId, id: currentBlockId || `free-${chunks.length}`, nombre: currentBlockName, modalidad: currentModalidad, ejercicios: currentChunk });
                                }
                                currentBlockId = ep.bloqueId || null;
                                currentBlockName = ep.bloque?.nombre || 'Entrenamiento Principal';
                                currentModalidad = ep.bloque?.modalidad || 'SECUENCIAL';
                                currentChunk = [];
                            }
                            currentChunk.push(ep);
                        });
                        if (currentChunk.length > 0) chunks.push({ isBlock: !!currentBlockId, id: currentBlockId || `free-${chunks.length}`, nombre: currentBlockName, modalidad: currentModalidad, ejercicios: currentChunk });
                        
                        return chunks.map((chunk, chunkIdx) => {
                            // Si son flat (viejos o sueltos), se agrupan en un bloque "Entrenamiento Principal"
                            return (
                                <details key={chunk.id || chunkIdx} className="group" open={chunkIdx === 0}>
                                    <summary className="list-none cursor-pointer p-4 md:p-5 bg-marino-2/40 border border-marino-4/30 rounded-2xl md:rounded-3xl hover:bg-marino-3/50 transition-all flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-marino-3 flex items-center justify-center font-black text-blanco shadow-[0_4px_10px_-2px_rgba(0,0,0,0.5)]">
                                                {chunkIdx + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-barlow-condensed font-black uppercase text-blanco tracking-widest">{chunk.nombre}</h3>
                                                <span className="text-[0.6rem] font-bold text-naranja tracking-widest uppercase">{chunk.ejercicios.length} ejercicios • Modalidad {chunk.modalidad}</span>
                                            </div>
                                        </div>
                                        <div className="text-gris/50 group-open:rotate-180 transition-transform duration-300 w-8 h-8 flex items-center justify-center bg-marino-4/20 rounded-full shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </summary>
                                    
                                    <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-transparent md:border-marino-4/20 md:ml-5 py-4 mb-8">
                                        {chunk.ejercicios.map((ep: any, idx: number) => {
                                            const nombreEjercicio = ep.ejercicio?.nombre || ep.nombreLibre || "Ejercicio sin nombre";
                                            const tieneVideo = !!ep.ejercicio?.urlVideo;
                                            const esLongitudLarga = ep.ejercicio?.posicionCarga === "LONGITUD_LARGA";

                                            return (
                                                <div 
                                                    key={ep.id} 
                                                    className={`bg-marino-2/60 backdrop-blur-sm border ${ep.esTesteo ? 'border-red-500/30 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.2)]' : 'border-marino-4/40'} rounded-3xl p-5 md:p-6 transition-all hover:border-marino-4/80 flex flex-col gap-6 relative`}
                                                >
                                                    {/* Decorador de Conexión del Circuito */}
                                                    {chunk.modalidad !== 'SECUENCIAL' && idx !== chunk.ejercicios.length - 1 && (
                                                        <div className="absolute -bottom-8 left-12 w-0.5 h-8 bg-naranja/20 hidden md:block"></div>
                                                    )}

                                                    {/* HEADER: Título y Botón Play */}
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-marino-3 border border-marino-4 flex items-center justify-center shrink-0">
                                                                <span className={`text-xl font-barlow-condensed font-black ${ep.esTesteo ? 'text-red-400' : 'text-blanco'}`}>
                                                                    {chunk.modalidad === 'SECUENCIAL' ? idx + 1 : `${idx + 1}`}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl md:text-2xl font-black text-blanco uppercase tracking-tight leading-tight mb-2">
                                                                    {nombreEjercicio}
                                                                </h3>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    {ep.esTesteo && (
                                                                        <span className="text-[0.55rem] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 w-fit">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                                            Testeo
                                                                        </span>
                                                                    )}
                                                                    {esLongitudLarga && (
                                                                        <span className="border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 rounded text-[0.55rem] font-black text-blue-300 flex items-center gap-1 w-fit uppercase tracking-widest">
                                                                            <ShieldAlert size={10} /> IUSCA
                                                                        </span>
                                                                    )}
                                                                    {ep.pesoSugerido && (
                                                                        <span className="border border-verde/20 bg-verde/5 px-2 py-0.5 rounded text-verde/90 text-[0.55rem] font-bold uppercase tracking-widest w-fit flex items-center gap-1">
                                                                            <Dumbbell size={10} /> {ep.pesoSugerido} kg
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Video Link */}
                                                        {tieneVideo && ep.ejercicio?.urlVideo && (
                                                            <a
                                                                href={ep.ejercicio.urlVideo}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="shrink-0 flex items-center justify-center w-12 h-12 bg-naranja/10 border border-naranja/20 rounded-2xl text-naranja hover:bg-naranja hover:text-marino transition-all shadow-[0_0_15px_-5px_#FF6B00]"
                                                                title="Ver Video"
                                                            >
                                                                <Play size={18} fill="currentColor" className="ml-1" />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* DATA & TIMER: Grid Layout */}
                                                    <div className="grid grid-cols-3 md:grid-cols-5 bg-marino-3/50 rounded-2xl border border-marino-4/30 overflow-hidden divide-x-0 divide-y md:divide-x md:divide-y-0 divide-marino-4/30">
                                                        
                                                        {/* STATS (Columnas 1-3) */}
                                                        <div className="flex flex-col items-center justify-center p-4 col-span-1">
                                                            <span className="text-[0.6rem] text-gris uppercase tracking-widest font-black mb-1">Sets</span>
                                                            <span className="text-2xl md:text-3xl font-barlow-condensed font-black text-blanco leading-none">{ep.series}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center p-4 col-span-1 border-l border-marino-4/30">
                                                            <span className="text-[0.6rem] text-gris uppercase tracking-widest font-black mb-1">Reps</span>
                                                            <span className="text-2xl md:text-3xl font-barlow-condensed font-black text-naranja tracking-widest leading-none">{ep.repsMin}<span className="text-gris/40 mx-0.5 font-normal">—</span>{ep.repsMax}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center p-4 col-span-1 border-l border-marino-4/30">
                                                            <span className="text-[0.6rem] text-gris uppercase tracking-widest font-black mb-1">RIR</span>
                                                            <span className="text-2xl md:text-3xl font-barlow-condensed font-black text-verde leading-none">{ep.RIR ?? "-"}</span>
                                                        </div>

                                                        {/* TIMER Component (Columnas 4-5) */}
                                                        <div className="col-span-3 md:col-span-2 bg-marino-2/80 p-4 flex flex-col justify-center">
                                                            <span className="text-[0.55rem] text-gris uppercase tracking-widest font-black block mb-2 px-1 text-center md:text-left">Recuperación</span>
                                                            {ep.descansoSegundos && ep.descansoSegundos > 0 ? (
                                                                <CronometroDescanso segundos={ep.descansoSegundos} />
                                                            ) : (
                                                                <div className="text-sm text-gris-claro font-medium px-1">— Sin descanso pautado</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Notas Técnicas del Ejercicio */}
                                                    {ep.notasTecnicas && (
                                                        <div className="mt-4 p-4 bg-marino-3/30 border border-marino-4/50 rounded-xl relative">
                                                            <h4 className="text-[0.65rem] font-black text-gris uppercase tracking-widest mb-1.5">
                                                                Feedback / Notas Técnicas
                                                            </h4>
                                                            <p className="text-sm text-gris-claro leading-relaxed whitespace-pre-wrap">
                                                                {ep.notasTecnicas}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Testing protocol CTA */}
                                                    {ep.esTesteo && (
                                                        <div className={`mt-2 pt-5 border-t ${ep.modalidadTesteo === 'DIRECTO' ? 'border-red-500/20' : 'border-naranja/20'}`}>
                                                            <button className={`w-full py-3.5 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ${ep.modalidadTesteo === 'DIRECTO' ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-naranja/10 text-naranja border border-naranja/20 hover:bg-naranja/20'}`}>
                                                                <Zap size={16} fill="currentColor" />
                                                                Registrar Protocolo de Testeo
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Registro de Series */}
                                                    <RegistroSeries
                                                        ejercicioPlanificadoId={ep.id}
                                                        diaId={diaVisualizado.id}
                                                        numSeries={ep.series}
                                                        pesoSugerido={ep.pesoSugerido}
                                                        seriesRegistradas={seriesDelDia[ep.id]}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        });
                    })()}
                </div>

                {/* BOTÓN FINALIZAR SESIÓN */}
                <div className="mt-8">
                    <button
                        onClick={handleFinalizarClic}
                        disabled={isFinishing}
                        className="w-full py-4 bg-gradient-to-r from-naranja to-naranja-h shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] text-marino rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        {isFinishing ? <Clock className="animate-spin" size={20} /> : <CheckCircle2 size={24} />}
                        Finalizar Sesión de Hoy
                    </button>
                </div>

                {/* MODAL ANTI MISS-CLICK */}
                {showFinishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marino/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-marino-2 border border-naranja/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-naranja/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-16 h-16 bg-naranja/10 rounded-full flex items-center justify-center text-naranja mb-6 border border-naranja/20">
                                    <AlertCircle size={32} />
                                </div>
                                
                                <h3 className="text-2xl font-barlow-condensed font-black text-blanco uppercase tracking-tight mb-2">
                                    Sesión Incompleta
                                </h3>
                                
                                <p className="text-[0.75rem] font-medium text-gris-claro leading-relaxed mb-8">
                                    Tienes ejercicios planeados sin series registradas. ¿Seguro que deseas dar por finalizada la sesión así? Se guardará como <strong className="text-naranja">Parcial</strong>.
                                </p>
                                
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={confirmarFinalizacion}
                                        disabled={isFinishing}
                                        className="w-full py-3.5 bg-naranja hover:bg-naranja-h text-marino rounded-xl font-black uppercase tracking-widest text-[0.65rem] transition-all relative"
                                    >
                                        {isFinishing ? "Finalizando..." : "Sí, Finalizar Sesión Real"}
                                    </button>
                                    
                                    <button
                                        onClick={() => setShowFinishModal(false)}
                                        disabled={isFinishing}
                                        className="w-full py-3.5 bg-marino-3 hover:bg-marino-4 border border-marino-4/50 text-gris-claro rounded-xl font-black uppercase tracking-widest text-[0.65rem] transition-all"
                                    >
                                        Perdón, me falto cargar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }


    // --- VISTA: HUB SEMANAL ---
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cabecera del Bloque */}
            {bloqueObjetivo && (
                <section className="bg-marino-2/60 backdrop-blur-md border border-marino-4/50 rounded-2xl p-5 flex flex-col justify-center shadow-lg">
                    <span className="text-[0.55rem] text-naranja uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-naranja animate-pulse shadow-[0_0_4px_#FF6B00]"></div>
                        Bloque de Entrenamiento
                    </span>
                    <span className="text-xl md:text-2xl font-barlow-condensed font-black text-blanco uppercase tracking-tight leading-none mb-4">
                        {bloqueObjetivo}
                    </span>
                    
                    {notasMacrociclo && (
                        <div className="mt-2 text-sm text-gris-claro/90 leading-relaxed border-t border-marino-4/30 pt-4 whitespace-pre-wrap">
                            <span className="text-[0.6rem] font-black text-gris uppercase tracking-widest block mb-2">Nota de la Rutina</span>
                            {notasMacrociclo}
                        </div>
                    )}
                </section>
            )}

            {/* Listado de Días (Cola de Estímulos) */}
            <section>
                {(() => {
                    const totalSemanas = diasConEjercicios.length;
                    const completadas = diasConEjercicios.filter(d => d.sesionesReales && d.sesionesReales.some(sr => sr.completada === true)).length;
                    const porcentaje = totalSemanas > 0 ? (completadas / totalSemanas) * 100 : 0;

                    return (
                        <div className="mb-8 px-2">
                             <div className="flex items-center justify-between mb-3">
                                <h2 className="text-[0.65rem] font-black text-gris uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Activity size={12} /> Tu Progreso Semanal
                                </h2>
                                <span className="text-[0.65rem] font-black text-naranja uppercase tracking-widest">
                                    {completadas} / {totalSemanas} Estímulos
                                </span>
                            </div>
                            <div className="h-2 w-full bg-marino-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div 
                                    className="h-full bg-gradient-to-r from-naranja/50 to-naranja rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,107,0,0.3)]"
                                    style={{ width: `${porcentaje}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })()}

                {diasConEjercicios.length === 0 ? (
                    <div className="bg-marino-2/40 border border-marino-4/30 border-dashed rounded-[2rem] p-12 text-center">
                        <Dumbbell size={32} className="text-marino-4 mx-auto mb-4 opacity-20" />
                        <p className="text-[0.7rem] font-bold text-gris uppercase tracking-[0.2em] max-w-xs mx-auto">
                            No hay ejercicios asignados para esta semana todavía.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {(() => {
                            let haEncontradoSiguiente = false;
                            
                            return diasConEjercicios.map((dia: DiaSesion, idx: number) => {
                                const seriesEsperadas = dia.ejercicios.reduce((acc, ej) => acc + (ej.series || 0), 0);
                                const sr = (dia.sesionesReales && dia.sesionesReales.length > 0) ? dia.sesionesReales[0] : null;
                                const tieneSesionReal = sr?.completada === true;
                                // @ts-expect-error - _count exists in Prisma payload
                                const seriesRegistradas = sr?._count?.series || 0;
                                const esSiguiente = !tieneSesionReal && !haEncontradoSiguiente;
                                
                                if (esSiguiente) haEncontradoSiguiente = true;

                                let estadoColorStr = "";
                                let estadoTextStr = "";
                                if (tieneSesionReal) {
                                    if (seriesRegistradas === 0) {
                                        estadoTextStr = "Sin entrenamiento";
                                        estadoColorStr = "red";
                                    } else if (seriesRegistradas < seriesEsperadas) {
                                        estadoTextStr = "Parcialmente completa";
                                        estadoColorStr = "yellow";
                                    } else {
                                        estadoTextStr = "Completada";
                                        estadoColorStr = "emerald";
                                    }
                                }

                                return (
                                    <button
                                        key={dia.id}
                                        onClick={() => handleDiaClick(dia)}
                                        className={`relative overflow-hidden group transition-all duration-500 rounded-[2rem] text-left border ${
                                            tieneSesionReal 
                                            ? (estadoColorStr === "red" ? 'bg-red-500/5 border-red-500/20 py-4 px-6 scale-[0.98]' : estadoColorStr === "yellow" ? 'bg-yellow-500/5 border-yellow-500/20 py-4 px-6 scale-[0.98]' : 'bg-emerald-500/5 border-emerald-500/20 py-4 px-6 scale-[0.98]') 
                                            : esSiguiente
                                                ? 'bg-gradient-to-br from-marino-2 to-marino-3 border-naranja shadow-[0_20px_50px_-20px_rgba(255,107,0,0.3)] py-8 px-8 scale-100 mb-2 z-10'
                                                : 'bg-marino-2/60 border-marino-4/40 py-6 px-6 opacity-80'
                                        }`}
                                    >
                                        {/* Estado y Paso */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {tieneSesionReal ? (
                                                    <div className={`px-2 py-0.5 border rounded-full flex items-center gap-1.5 ${
                                                        estadoColorStr === "red" ? 'bg-red-500/10 border-red-500/20' : 
                                                        estadoColorStr === "yellow" ? 'bg-yellow-500/10 border-yellow-500/20' : 
                                                        'bg-emerald-500/10 border-emerald-500/20'
                                                    }`}>
                                                        {estadoColorStr === "red" ? <AlertCircle size={10} className="text-red-500" /> : 
                                                         estadoColorStr === "yellow" ? <Activity size={10} className="text-yellow-500" /> : 
                                                         <CheckCircle2 size={10} className="text-emerald-500" />}
                                                        <span className={`text-[0.45rem] sm:text-[0.55rem] font-black uppercase tracking-widest ${
                                                            estadoColorStr === "red" ? 'text-red-500' : 
                                                            estadoColorStr === "yellow" ? 'text-yellow-500' : 
                                                            'text-emerald-500'
                                                        }`}>{estadoTextStr}</span>
                                                    </div>
                                                ) : esSiguiente ? (
                                                    <div className="px-3 py-1 bg-naranja border border-naranja/20 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                                                        <Play size={10} fill="currentColor" className="text-marino" />
                                                        <span className="text-[0.55rem] font-black text-marino uppercase tracking-widest">Siguiente Estímulo</span>
                                                    </div>
                                                ) : (
                                                    <div className="px-2 py-0.5 bg-marino-4/30 border border-marino-4/20 rounded-full flex items-center gap-1.5 text-gris">
                                                        <Clock size={10} />
                                                        <span className="text-[0.55rem] font-black uppercase tracking-widest">Programado</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ${esSiguiente ? 'bg-naranja/10 text-naranja border border-naranja/20' : 'text-gris/40 bg-marino-3/50'}`}>
                                                Paso {idx + 1}
                                            </span>
                                        </div>
 
                                        <div className="flex items-end justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className={`font-barlow-condensed font-black uppercase leading-none tracking-tighter transition-all ${
                                                    tieneSesionReal ? (estadoColorStr === "red" ? 'text-lg text-red-500/50' : estadoColorStr === "yellow" ? 'text-lg text-yellow-500/50' : 'text-lg text-emerald-500/50') : esSiguiente ? 'text-5xl text-blanco mb-2' : 'text-3xl text-blanco/80 mb-1'
                                                }`}>
                                                    {dia.diaSemana}
                                                </h3>
                                                {dia.focoMuscular && (
                                                    <p className={`font-bold transition-all ${
                                                        tieneSesionReal ? 'text-[0.65rem] text-gris/40' : esSiguiente ? 'text-sm text-naranja/80' : 'text-[0.7rem] text-gris-claro'
                                                    }`}>
                                                        {dia.focoMuscular}
                                                    </p>
                                                )}
                                            </div>
 
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {!tieneSesionReal && (
                                                   <span className={`text-[0.65rem] font-black uppercase tracking-widest ${esSiguiente ? 'text-blanco/40' : 'text-gris/30'}`}>
                                                       {dia.ejercicios.length} ejercicios
                                                   </span>
                                                )}
                                                
                                                {esSiguiente && (
                                                    <div className="w-14 h-14 rounded-2xl bg-naranja flex items-center justify-center text-marino shadow-[0_10px_25px_-5px_#FF6B00] transition-transform hover:scale-110 active:scale-95">
                                                        <Play size={28} fill="currentColor" className="translate-x-[2px]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
 
                                        {/* Glow effect for Next Session */}
                                        {esSiguiente && (
                                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-naranja/10 rounded-full blur-[60px] pointer-events-none"></div>
                                        )}
                                    </button>
                                );
                            });
                        })()}
                    </div>
                )}
            </section>

             {/* Navegación entre semanas (Selector Ultra Premium) */}
             {todasLasSemanas.length > 1 && (
                <section className="mt-12 pt-8 border-t border-marino-4/20 relative">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="text-[0.6rem] font-black text-gris uppercase tracking-[0.4em]">Cronograma de Bloques</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-verde/40"></div>
                                <span className="text-[0.45rem] font-bold text-gris/60 uppercase tracking-widest">Listo</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-naranja animate-pulse"></div>
                                <span className="text-[0.45rem] font-bold text-naranja uppercase tracking-widest">En Curso</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pt-6 pb-12 snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 scroll-smooth">
                        {[...todasLasSemanas].sort((a, b) => a.numeroSemana - b.numeroSemana).map((semana) => {
                            // Calcular progreso real de la semana
                            const diasConEj = semana.diasSesion.filter(d => d.ejercicios.length > 0);
                            const completados = diasConEj.filter(d => d.sesionesReales && d.sesionesReales.some(sr => sr.completada === true)).length;
                            const estaCompletada = diasConEj.length > 0 && completados === diasConEj.length;
                            
                            // Determinamos cual es la semana focal (en curso)
                            const tieneDiasIncompletos = diasConEj.length > 0 && completados < diasConEj.length;
                            const esSemanaActual = tieneDiasIncompletos && semana.numeroSemana === [...todasLasSemanas].sort((a,b)=>a.numeroSemana-b.numeroSemana).find(s => {
                                const sDias = s.diasSesion.filter(d => d.ejercicios.length > 0);
                                const sCompletados = sDias.filter(d => d.sesionesReales && d.sesionesReales.some(sr => sr.completada === true)).length;
                                return sDias.length > 0 && sCompletados < sDias.length;
                            })?.numeroSemana;
                            
                            const esSeleccionadaId = semana.id === semanaSeleccionadaId;

                            return (
                                <button
                                    key={semana.id}
                                    onClick={() => setSemanaSeleccionadaId(semana.id)}
                                    className={`snap-center shrink-0 w-16 group relative flex flex-col items-center transition-all duration-300 ${esSeleccionadaId ? 'scale-110' : 'hover:scale-105'}`}
                                >
                                    {/* Indicador de Selección Superior */}
                                    <div className={`text-[0.5rem] font-black uppercase tracking-tighter mb-2 transition-all duration-300 ${esSeleccionadaId ? 'text-naranja opacity-100' : 'text-gris opacity-0 group-hover:opacity-100'}`}>
                                        {esSeleccionadaId ? 'Viendo' : 'Ver'}
                                    </div>

                                    {/* Círculo de la Semana */}
                                    <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-500 overflow-hidden ${
                                        esSemanaActual 
                                        ? 'bg-marino-3 border-naranja shadow-[0_0_20px_rgba(255,107,0,0.2)]' 
                                        : estaCompletada 
                                            ? 'bg-marino-2/40 border-verde/30 shadow-none' 
                                            : esSeleccionadaId
                                                ? 'bg-marino-3 border-blanco/40'
                                                : 'bg-marino-2 border-marino-4/40 group-hover:border-marino-4'
                                    }`}>
                                        <span className={`text-lg font-barlow-condensed font-black leading-none tracking-tighter transition-colors ${
                                            esSemanaActual ? 'text-naranja' : estaCompletada ? 'text-verde/60' : 'text-blanco/60'
                                        }`}>
                                            {semana.numeroSemana}
                                        </span>
                                        
                                        {/* Progreso Radial Sutil (Borde inferior) */}
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {diasConEj.map((_, i) => (
                                                <div key={i} className={`w-1 h-1 rounded-full ${i < completados ? (estaCompletada ? 'bg-verde/40' : 'bg-naranja') : 'bg-marino-4/50'}`}></div>
                                            ))}
                                        </div>

                                        {/* Overlay para Fase Deload */}
                                        {semana.esFaseDeload && (
                                            <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>
                                        )}
                                    </div>

                                    {/* Mini Badge de Estado */}
                                    <div className="mt-3 flex flex-col items-center gap-1">
                                         {estaCompletada ? (
                                             <CheckCircle2 size={10} className="text-verde/50" />
                                         ) : esSemanaActual ? (
                                             <div className="w-1 h-1 rounded-full bg-naranja animate-ping"></div>
                                         ) : (
                                             <div className="w-1 h-1 rounded-full bg-marino-4"></div>
                                         )}
                                         
                                         <span className={`text-[0.45rem] font-bold uppercase tracking-widest ${esSemanaActual ? 'text-naranja' : estaCompletada ? 'text-verde/40' : 'text-gris/30'}`}>
                                             {semana.esFaseDeload ? 'Dld' : `W${semana.numeroSemana}`}
                                         </span>
                                    </div>

                                    {/* Marcador de "Siguiente" */}
                                    {esSemanaActual && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-naranja border-2 border-marino-1 rounded-full shadow-[0_0_8px_#FF6B00]"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>
             )}
        </div>
    );
}
