"use client"
import { useState } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface Props {
    notasGrales: string;
    onChange: (value: string) => void;
}

export default function MetodologiaSesion({ notasGrales, onChange }: Props) {
    const [showNotes, setShowNotes] = useState(false);

    return (
        <div className="bg-marino-2 border border-marino-4/30 rounded-3xl shadow-xl overflow-hidden">
            <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-naranja/5 rounded-2xl text-naranja border border-naranja/10">
                        <Activity size={20} />
                    </div>
                    <span className="text-[0.75rem] font-black text-blanco uppercase tracking-[0.25em]">Notas y Activación / Movilidad</span>
                </div>
                {showNotes ? <ChevronUp size={20} className="text-naranja" /> : <ChevronDown size={20} className="text-gris/40" />}
            </button>

            {showNotes && (
                <div className="p-6 pt-0 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 space-y-3">
                        <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest pl-1">Instrucciones Generales y Bloque de Movilidad</label>
                        <textarea
                            value={notasGrales}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={"Ej: Arrancar cada ejercicio con 3 series de aproximación...\nBloque de movilidad y activación muscular..."}
                            className="w-full bg-marino-3/30 border border-marino-4/40 rounded-2xl px-5 py-4 text-sm text-blanco focus:outline-none focus:border-naranja/30 transition-all font-medium h-48 resize-none shadow-inner"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
