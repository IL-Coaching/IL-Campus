"use client";

import { useState, useEffect } from "react";
import { obtenerEjerciciosTesteo, registrarTesteoAlumno } from "@/nucleo/acciones/progreso-alumno.accion";
import { Loader2, PlusCircle, CheckCircle2, AlertCircle, Dumbbell } from "lucide-react";

interface EjercicioOpcion {
    id: string;
    nombre: string;
    musculoPrincipal: string;
}

export default function TesteoFuerzaAlumno() {
    const [ejercicios, setEjercicios] = useState<EjercicioOpcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'exito' | 'error', msg: string } | null>(null);

    useEffect(() => {
        async function fetchEjercicios() {
            const res = await obtenerEjerciciosTesteo();
            if (res.exito && res.ejercicios) {
                setEjercicios(res.ejercicios);
            }
            setLoading(false);
        }
        fetchEjercicios();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        const res = await registrarTesteoAlumno(new FormData(e.currentTarget));
        setSaving(false);

        if (res.error) {
            setStatus({ type: 'error', msg: res.error });
        } else {
            setStatus({ type: 'exito', msg: "¡Testeo y Cálculo RM registrados! Tu entrenador ya puede verlo." });
            (e.target as HTMLFormElement).reset();
        }
    };

    if (loading) {
        return (
            <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-naranja" />
            </div>
        );
    }

    return (
        <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-naranja/10 border border-naranja/20 rounded-xl">
                    <Dumbbell className="text-naranja" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-barlow-condensed font-black uppercase text-blanco leading-none">Registrar RM / Record Personal</h3>
                    <p className="text-[0.65rem] text-gris font-medium mt-1 uppercase tracking-widest">¿Hiciste un test de fuerza?</p>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-xl mb-4 border flex items-center gap-3 ${status.type === 'exito' ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                    {status.type === 'exito' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-xs font-bold uppercase tracking-wider">{status.msg}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Ejercicio</label>
                    <select
                        name="ejercicioId"
                        required
                        aria-label="Selector de ejercicio para testeo de fuerza"
                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:outline-none focus:border-naranja transition-all font-medium text-sm appearance-none"
                    >
                        <option value="">Selecciona un ejercicio...</option>
                        {ejercicios.map(e => (
                            <option key={e.id} value={e.id}>{e.nombre} ({e.musculoPrincipal})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Peso (KG)</label>
                        <input
                            type="number"
                            name="pesoKg"
                            step="0.5"
                            required
                            min="0"
                            placeholder="Ej: 100"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:outline-none focus:border-naranja transition-all font-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Repeticiones</label>
                        <input
                            type="number"
                            name="reps"
                            required
                            min="1"
                            max="30"
                            placeholder="Ej: 3"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:outline-none focus:border-naranja transition-all font-black"
                        />
                    </div>
                </div>

                <button disabled={saving} className="w-full mt-4 bg-marino-3 hover:bg-marino border border-naranja/50 hover:border-naranja text-naranja font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all group">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />} REGISTRAR TESTEO
                </button>
            </form>
            <p className="mt-4 text-[0.6rem] text-gris text-center italic">Calcularemos tu 1RM estimado en base a esta información.</p>
        </div>
    );
}
