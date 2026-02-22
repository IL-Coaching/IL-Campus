"use client";

import { useState } from 'react';
import {
    User,
    Shield,
    Zap,
    Save,
    Key,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Cliente, CicloMenstrual } from '@prisma/client';
import { actualizarPerfilAlumno, cambiarPasswordAlumno, guardarConfiguracionCiclo } from '@/nucleo/acciones/alumno.accion';

export default function PerfilContent({ alumno, ciclo }: { alumno: Cliente, ciclo?: CicloMenstrual | null }) {
    const [tab, setTab] = useState<'datos' | 'seguridad' | 'ciclo'>('datos');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'exito' | 'error', msg: string } | null>(null);

    const handleActualizarPerfil = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        const res = await actualizarPerfilAlumno(new FormData(e.currentTarget));
        setLoading(false);
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else setStatus({ type: 'exito', msg: "Perfil actualizado correctamente." });
    };

    const handleCambiarPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        const res = await cambiarPasswordAlumno(new FormData(e.currentTarget));
        setLoading(false);
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else {
            setStatus({ type: 'exito', msg: "Contraseña cambiada con éxito." });
            (e.target as HTMLFormElement).reset();
        }
    };

    const handleGuardarCiclo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        const res = await guardarConfiguracionCiclo(new FormData(e.currentTarget));
        setLoading(false);
        if (res.error) setStatus({ type: 'error', msg: res.error });
        else setStatus({ type: 'exito', msg: "Configuración de ciclo guardada." });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav interna */}
            <div className="flex bg-marino-2 p-1 rounded-2xl border border-marino-4 overflow-hidden">
                <button
                    onClick={() => { setTab('datos'); setStatus(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tab === 'datos' ? 'bg-marino-3 text-naranja border border-marino-4 shadow-xl' : 'text-gris hover:text-blanco'}`}
                >
                    <User size={16} /> <span className="hidden sm:inline">Datos</span>
                </button>
                <button
                    onClick={() => { setTab('seguridad'); setStatus(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tab === 'seguridad' ? 'bg-marino-3 text-naranja border border-marino-4 shadow-xl' : 'text-gris hover:text-blanco'}`}
                >
                    <Shield size={16} /> <span className="hidden sm:inline">Seguridad</span>
                </button>
                {alumno.genero === 'F' && (
                    <button
                        onClick={() => { setTab('ciclo'); setStatus(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tab === 'ciclo' ? 'bg-marino-3 text-naranja border border-marino-4 shadow-xl' : 'text-gris hover:text-blanco'}`}
                    >
                        <Zap size={16} /> <span className="hidden sm:inline">Ciclo Menstrual</span>
                    </button>
                )}
            </div>

            {/* Status Alert */}
            {status && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in zoom-in-95 ${status.type === 'exito' ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                    {status.type === 'exito' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-xs font-bold uppercase tracking-wider">{status.msg}</p>
                </div>
            )}

            {/* Tab: Datos */}
            {tab === 'datos' && (
                <form onSubmit={handleActualizarPerfil} className="bg-marino-2 border border-marino-4 rounded-3xl p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Nombre Completo</label>
                        <input name="nombre" defaultValue={alumno.nombre} required className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Email (No editable)</label>
                        <input value={alumno.email} disabled className="w-full bg-marino/50 border border-marino-4 rounded-2xl px-5 py-4 text-gris cursor-not-allowed font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">WhatsApp</label>
                        <input name="telefono" defaultValue={alumno.telefono || ''} placeholder="+54 9 342..." className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium" />
                    </div>
                    <button disabled={loading} className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 text-marino font-black py-4.5 rounded-2xl uppercase tracking-widest font-barlow-condensed text-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-naranja/20">
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Guardar Cambios
                    </button>
                </form>
            )}

            {/* Tab: Seguridad */}
            {tab === 'seguridad' && (
                <form onSubmit={handleCambiarPassword} className="bg-marino-2 border border-marino-4 rounded-3xl p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Contraseña Actual</label>
                        <input name="password_actual" type="password" required className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all" />
                    </div>
                    <div className="space-y-6 border-t border-marino-4 pt-6">
                        <div className="space-y-2">
                            <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Nueva Contraseña</label>
                            <input name="password_nueva" type="password" required className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Confirmar Nueva Contraseña</label>
                            <input name="password_confirma" type="password" required className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all" />
                        </div>
                    </div>
                    <button disabled={loading} className="w-full bg-marino-3 border border-marino-4 hover:border-naranja text-blanco hover:text-naranja font-black py-4.5 rounded-2xl uppercase tracking-widest font-barlow-condensed text-xl flex items-center justify-center gap-3 transition-all shadow-xl">
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Key size={24} />} Actualizar Seguridad
                    </button>
                </form>
            )}

            {/* Tab: Ciclo */}
            {tab === 'ciclo' && (
                <form onSubmit={handleGuardarCiclo} className="bg-marino-2 border border-marino-4 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-naranja/10 text-naranja rounded-2xl flex items-center justify-center border border-naranja/20">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h4 className="font-barlow-condensed font-black uppercase text-xl text-blanco leading-none">Control de Ciclo Menstrual</h4>
                            <p className="text-xs text-gris font-medium mt-1">El sistema adaptará tu volumen de entrenamiento.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Inicio de Último Ciclo</label>
                        <input
                            name="fechaInicio"
                            type="date"
                            required
                            defaultValue={ciclo?.fechaInicioUltimoCiclo ? new Date(ciclo.fechaInicioUltimoCiclo).toISOString().split('T')[0] : ''}
                            className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Duración Promedio (Días)</label>
                        <input
                            name="duracion"
                            type="number"
                            required
                            min="20"
                            max="45"
                            defaultValue={ciclo?.duracionCiclo || 28}
                            className="w-full bg-marino border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium"
                        />
                    </div>

                    <button disabled={loading} className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4.5 rounded-2xl uppercase tracking-widest font-barlow-condensed text-xl flex items-center justify-center gap-3 transition-all">
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Guardar Configuración
                    </button>

                    <div className="p-4 bg-marino-3/50 border border-marino-4 border-dashed rounded-2xl text-[0.7rem] text-gris leading-relaxed">
                        <p><strong>Nota:</strong> Al activar esto, en tu dashboard verás recomendaciones de intensidad adaptadas a tu fase (Folicular, Ovulatoria, Lútea).</p>
                    </div>
                </form>
            )}
        </div>
    );
}
