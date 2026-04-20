"use client"
import { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Activity, Scale } from 'lucide-react';

interface Props {
    condiciones: string[];
}

export default function BannerClinico({ condiciones }: Props) {
    const [showClinical, setShowClinical] = useState(true);

    if (condiciones.length === 0) return null;

    return (
        <div className="bg-marino-2 border border-rojo/20 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-rojo/5 transition-colors"
                onClick={() => setShowClinical(!showClinical)}
            >
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-rojo/10 rounded-2xl text-rojo">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-blanco uppercase tracking-[0.2em]">Protocolo de Seguridad Clínica</h4>
                        <p className="text-[0.65rem] font-bold text-rojo/80 uppercase tracking-tighter">Condiciones médicas activas detectadas ({condiciones.length})</p>
                    </div>
                </div>
                {showClinical ? <ChevronUp className="text-rojo" /> : <ChevronDown className="text-rojo" />}
            </div>

            {showClinical && (
                <div className="px-6 pb-6 pt-2 space-y-6 bg-rojo/[0.02]">
                    <div className="flex flex-wrap gap-2 py-2">
                        {condiciones.map(c => (
                            <span key={c} className="bg-rojo/10 text-rojo px-4 py-1.5 rounded-xl text-[0.65rem] font-black uppercase border border-rojo/20 shadow-sm">{c}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                        <div className="space-y-3">
                            <h5 className="text-[0.65rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-rojo" /> Directrices ACSM
                            </h5>
                            <p className="text-[0.75rem] text-gris leading-relaxed font-medium">
                                Monitorizar fatiga subjetiva y descartar maniobras hipopresivas extremas. Control riguroso de la hemodinámica durante la sesión.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h5 className="text-[0.65rem] font-black text-blanco uppercase tracking-widest flex items-center gap-2">
                                <Scale size={14} className="text-rojo" /> Variables de Control
                            </h5>
                            <ul className="text-[0.75rem] text-gris list-disc pl-5 space-y-1.5 font-medium">
                                <li>Carga interna (RPE) ≤ 8/10.</li>
                                <li>Recuperación completa entre series metabólicas.</li>
                                <li>Hidratación prioritaria ante clima extremo.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
