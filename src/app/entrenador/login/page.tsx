"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { loginEntrenador } from '@/nucleo/acciones/auth.accion';

export default function EntrenadorLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await loginEntrenador(formData);

        if (result.success) {
            router.push('/entrenador/dashboard');
        } else {
            setError(result.error || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-naranja/5 rounded-full blur-[140px] -translate-y-1/2 -translate-x-1/2"></div>

            <div className="w-full max-w-md space-y-8 relative z-10 fade-up visible">
                {/* Logo Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 mb-4">
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <span className="text-5xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-1">IL</span>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                    </div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco tracking-tight">Panel de Control</h1>
                    <p className="text-gris text-sm font-medium mt-1">Acceso exclusivo para Iñaki Legarreta</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-marino-2 p-10 rounded-2xl border border-marino-4 shadow-2xl relative overflow-hidden">
                    {/* Subtle accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-naranja to-transparent opacity-50"></div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-bold uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Mail size={12} /> Email de Administrador
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            defaultValue="legarretatraining@gmail.com"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3.5 text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium placeholder:text-gris/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-bold uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Lock size={12} /> Contraseña Maestra
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••••••"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3.5 text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium placeholder:text-gris/30"
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            className="group w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 disabled:cursor-not-allowed transition-all text-marino font-black py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-xl shadow-lg shadow-naranja/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Iniciar Sesión <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex justify-center flex-col items-center gap-4 pt-4">
                    <Link href="/ingresar" className="text-xs text-gris hover:text-naranja transition-colors font-bold uppercase tracking-widest border-b border-transparent hover:border-naranja pb-1">
                        ← Volver a opciones de acceso
                    </Link>
                    <p className="text-[0.6rem] text-gris/40 font-bold uppercase tracking-[0.4em]">IL-COACHING • ADMIN CORE</p>
                </div>
            </div>
        </main>
    );
}
