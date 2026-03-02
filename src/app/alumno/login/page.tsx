"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { loginAlumno, completarForzarPassword } from '@/nucleo/acciones/auth.accion';

export default function AlumnoLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [faseActivacion, setFaseActivacion] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        if (faseActivacion && tempToken) {
            const password = formData.get("password") as string;
            const confirmacion = formData.get("password_confirm") as string;

            if (password !== confirmacion) {
                setError("Las contraseñas no coinciden.");
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                setLoading(false);
                return;
            }

            const result = await completarForzarPassword(tempToken, password);

            if (result.success) {
                router.push('/alumno/bienvenida');
            } else {
                setError(result.error || "Ocurrió un error inesperado al activar la cuenta.");
                setLoading(false);
            }
            return;
        }

        const result = await loginAlumno(formData);

        if (result.success && result.requiereCambioPassword && result.tempToken) {
            setFaseActivacion(true);
            setTempToken(result.tempToken);
            setLoading(false);
        } else if (result.success) {
            router.push('/alumno/bienvenida');
        } else {
            setError(result.error || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-naranja/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-naranja/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

            <div className="w-full max-w-md space-y-8 relative z-10 fade-up visible">
                {/* Logo Section */}
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
                        <div className="flex items-center gap-1 mb-6">
                            <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                            <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                            <span className="text-6xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-2">IL</span>
                            <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        </div>
                    </Link>

                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco">
                        Bienvenido<span className="text-naranja">.</span>
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Accedé a tu espacio de entrenamiento
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!faseActivacion ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gris uppercase tracking-widest mb-2">
                                    Código de activación
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-marino-2 border border-marino-4 rounded-xl py-3 px-4 text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-colors"
                                    placeholder="Ingresa tu email o código"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gris uppercase tracking-widest mb-2">
                                    Contraseña
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-marino-2 border border-marino-4 rounded-xl py-3 px-4 text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gris uppercase tracking-widest mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-marino-2 border border-marino-4 rounded-xl py-3 px-4 text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-colors"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gris uppercase tracking-widest mb-2">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    name="password_confirm"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-marino-2 border border-marino-4 rounded-xl py-3 px-4 text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-colors"
                                    placeholder="Repetí tu contraseña"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle size={16} className="text-red-400 shrink-0" />
                            <p className="text-red-400 text-xs font-bold">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest font-barlow-condensed text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Ingresando...</span>
                            </>
                        ) : (
                            <>
                                <span>{faseActivacion ? 'Activar Cuenta' : 'Ingresar'}</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="text-center space-y-2">
                    <Link href="/recuperar" className="block text-xs text-gris hover:text-naranja transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <Link href="/" className="block text-xs text-gris hover:text-naranja transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}
