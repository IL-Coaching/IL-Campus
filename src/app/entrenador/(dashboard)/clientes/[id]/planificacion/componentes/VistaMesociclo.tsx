import { Layers, ChevronRight, Activity, Flame, MoveUp, Save, Loader2, FlaskConical, Target, Copy } from "lucide-react";
import { useState } from 'react';
import { BloqueConSemanas, SemanaConDias, DiaConEjercicios } from "@/nucleo/tipos/planificacion.tipos";
import { actualizarMesociclo, actualizarSemana, clonarContenidoSemana } from '@/nucleo/acciones/planificacion.accion';
import { TIPOS_CARGA_MESOCICLO } from '@/nucleo/planificacion/zonas.constantes';
import { useRouter } from 'next/navigation';
import { TipoCarga } from "@prisma/client";

interface VistaMesocicloProps {
    bloque: BloqueConSemanas;
    mes: number;
    limiteSemanas: number;
    onSelectSemana: (semana: number) => void;
}

export default function VistaMesociclo({ bloque, mes, limiteSemanas, onSelectSemana }: VistaMesocicloProps) {
    const [objetivo, setObjetivo] = useState(bloque.objetivo);
    const [metodo, setMetodo] = useState(bloque.metodo || '');
    const [rango, setRango] = useState(bloque.rangoReferencia || '');
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleGuardar = async () => {
        setSaving(true);
        const res = await actualizarMesociclo(bloque.id, {
            objetivo,
            metodo,
            rangoReferencia: rango
        });
        if (res.exito) {
            router.refresh();
            alert("Mesociclo actualizado.");
        } else {
            alert("Error: " + res.error);
        }
        setSaving(false);
    };

    const semanas = bloque.semanas.map((s: SemanaConDias) => ({
        id: s.id,
        n: s.numeroSemana,
        tipo: s.esFaseDeload ? "Deload" : (s.esSemanaTesteo ? "Testeo" : "Trabajo"),
        tipoCarga: s.tipoCarga || '',
        rir: s.RIRobjetivo || "3-4",
        vol: s.volumenEstimado || "8 sets",
        dias: s.diasSesion.map((d: DiaConEjercicios) => d.focoMuscular)
    }));

    const handleCambiarTipoCarga = async (semanaId: string, tipo: TipoCarga) => {
        let rir = 3;
        let vol = "100% Base";

        if (tipo === 'INTRODUCTORIA') { rir = 5; vol = "40-60% Base"; }
        if (tipo === 'BASE') { rir = 3; vol = "100% Base"; }
        if (tipo === 'CHOQUE') { rir = 1; vol = "70-80% Base"; }
        if (tipo === 'DESCARGA_TEST') { rir = 5; vol = "50-60% Base"; }

        const res = await actualizarSemana(semanaId, {
            tipoCarga: tipo,
            RIRobjetivo: rir,
            volumenEstimado: vol,
            esFaseDeload: tipo === 'DESCARGA_TEST',
            esSemanaTesteo: tipo === 'DESCARGA_TEST'
        });

        if (res.exito) {
            router.refresh();
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header Mesociclo Professional */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-marino-4 pb-8">
                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-naranja/10 border border-naranja/20 rounded-2xl shrink-0">
                        <Layers size={28} className="text-naranja" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] block">Configuración de Mesociclo</span>
                            <span className="px-2 py-0.5 bg-marino-3 border border-marino-4 rounded text-[0.55rem] font-bold text-gris uppercase tracking-widest">Mes {mes}</span>
                        </div>
                        <input
                            value={objetivo}
                            onChange={(e) => setObjetivo(e.target.value)}
                            className="text-4xl md:text-5xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight bg-transparent border-none focus:ring-0 w-full p-0 placeholder:text-gris/20"
                            placeholder="Objetivo del Mesociclo"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                            <div className="bg-marino-3/30 p-3 rounded-xl border border-marino-4">
                                <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                                    <FlaskConical size={10} /> Método de Carga
                                </label>
                                <input
                                    value={metodo}
                                    onChange={(e) => setMetodo(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-blanco focus:ring-0 w-full placeholder:text-gris/20"
                                    placeholder="Ej: Leg/Push/Pull, Fullbody..."
                                />
                            </div>
                            <div className="bg-marino-3/30 p-3 rounded-xl border border-marino-4">
                                <label className="text-[0.55rem] font-black text-naranja uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                                    <Target size={10} /> Rango Referencia
                                </label>
                                <input
                                    value={rango}
                                    onChange={(e) => setRango(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-blanco focus:ring-0 w-full placeholder:text-gris/20"
                                    placeholder="Ej: 8-12 reps, 5-8 reps..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full xl:w-auto">
                    <div className="flex gap-4">
                        <div className="flex-1 xl:flex-none flex flex-col bg-marino-2 p-4 rounded-xl border border-marino-4 min-w-[140px]">
                            <span className="text-[0.55rem] font-black text-gris uppercase tracking-widest mb-1.5 opacity-60">Volumen Global</span>
                            <div className="flex items-center gap-2">
                                <Activity className="text-naranja" size={16} />
                                <span className="text-lg font-black text-blanco uppercase tracking-tight">{bloque.semanas[0]?.volumenEstimado || 'ESTÁNDAR'}</span>
                            </div>
                        </div>
                        <div className="flex-1 xl:flex-none flex flex-col bg-marino-2 p-4 rounded-xl border border-marino-4 min-w-[140px]">
                            <span className="text-[0.55rem] font-black text-gris uppercase tracking-widest mb-1.5 opacity-60">Intensidad Media</span>
                            <div className="flex items-center gap-2">
                                <Flame className="text-naranja" size={16} />
                                <span className="text-lg font-black text-blanco uppercase tracking-tight">RIR {bloque.semanas[0]?.RIRobjetivo || '3'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGuardar}
                        disabled={saving}
                        className="w-full bg-naranja hover:bg-naranja-h transition-all text-marino font-black py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-naranja/10"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>


            {/* Grid de Semanas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {semanas.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => onSelectSemana(s.n)}
                        className="group bg-marino-2 border border-marino-4 rounded-2xl p-6 cursor-pointer hover:border-naranja/50 hover:bg-marino-3 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                    >
                        {/* Glow decorativo según tipo */}
                        <div className={`absolute -top-4 -right-4 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${s.tipo === 'Trabajo' ? 'bg-[#22C55E]' : s.tipo === 'Deload' ? 'bg-[#EAB308]' : 'bg-[#A78BFA]'
                            }`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="relative group/tipo">
                                <select
                                    className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-[0.15em] border bg-marino-3 outline-none cursor-pointer ${s.tipoCarga === 'BASE' ? 'text-[#22C55E] border-[#22C55E]/30' :
                                        s.tipoCarga === 'CHOQUE' ? 'text-[#FF6B00] border-[#FF6B00]/30' :
                                            s.tipoCarga === 'DESCARGA_TEST' ? 'text-[#A78BFA] border-[#A78BFA]/30' :
                                                'text-gris border-marino-4'
                                        }`}
                                    value={s.tipoCarga || ''}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleCambiarTipoCarga(s.id, e.target.value as TipoCarga)}
                                >
                                    <option value="" disabled>TIPO CARGA</option>
                                    {Object.entries(TIPOS_CARGA_MESOCICLO).map(([key, value]) => (
                                        <option key={key} value={key}>{value.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-marino-4/50 flex items-center justify-center text-gris group-hover:text-blanco transition-colors shadow-inner">
                                <span className="font-black text-sm">#{s.n}</span>
                            </div>
                            {s.n > 1 && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const anteriorId = bloque.semanas.find(sem => sem.numeroSemana === s.n - 1)?.id;
                                        if (anteriorId) {
                                            const res = await clonarContenidoSemana(anteriorId, s.id);
                                            if (res.exito) router.refresh();
                                        }
                                    }}
                                    className="p-2 hover:text-naranja transition-colors text-gris"
                                    title="Clonar de semana anterior"
                                >
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>

                        <div className="mb-8">
                            <h4 className="text-4xl font-barlow-condensed font-black text-blanco mb-2 group-hover:text-naranja transition-colors uppercase leading-none">Semana {s.n}</h4>
                            <div className="flex items-center gap-2 text-[0.65rem] text-gris font-bold uppercase tracking-widest">
                                <Activity size={12} />
                                <span>{s.dias.length} días de entrenamiento</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-2 px-3 bg-marino-3/50 rounded-lg border border-marino-4/50">
                                <span className="text-[0.6rem] text-gris-claro uppercase font-black tracking-widest">Carga</span>
                                <span className="text-xs font-black text-naranja uppercase tracking-tighter">RIR {s.rir}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-marino-3/50 rounded-lg border border-marino-4/50">
                                <span className="text-[0.6rem] text-gris-claro uppercase font-black tracking-widest">Volumen</span>
                                <span className="text-xs font-black text-blanco italic uppercase tracking-tighter">{s.vol}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-marino-4 flex justify-between items-center">
                            <div className="flex -space-x-1.5">
                                {s.dias.map((d: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border border-marino-2 ${d.toLowerCase().includes('push') ? 'bg-naranja' :
                                            d.toLowerCase().includes('pull') ? 'bg-[#22C55E]' :
                                                d.toLowerCase().includes('piern') ? 'bg-[#60A5FA]' : 'bg-[#A78BFA]'
                                            }`}
                                        title={d}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                <span className="text-[0.6rem] font-black text-naranja uppercase tracking-widest">Micro</span>
                                <ChevronRight size={14} className="text-naranja" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slot para agregar semana si faltan */}
                {((mes - 1) * 4) + semanas.length < limiteSemanas && semanas.length < 4 && (
                    <div className="border-2 border-dashed border-marino-4 rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-naranja/40 hover:bg-naranja/[0.02] transition-all cursor-pointer opacity-30 hover:opacity-100">
                        <div className="p-4 bg-marino-3 rounded-full mb-4">
                            <MoveUp size={24} className="text-gris group-hover:text-naranja animate-bounce" />
                        </div>
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gris text-center">Configurar Microciclo</span>
                    </div>
                )}
            </div>
        </div>
    );
}
