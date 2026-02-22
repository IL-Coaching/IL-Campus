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
                router.push('/alumno/dashboard');
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
            router.push('/alumno/dashboard');
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
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco tracking-tight">Campus Virtual</h1>
                    <p className="text-gris text-sm font-medium mt-2 max-w-[280px]">Ingresá para acceder a tu planificación y seguimiento personalizado</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-marino-2 p-10 rounded-3xl border border-marino-4 shadow-2xl relative overflow-hidden">
                    {/* Glow efecto sutil en el borde superior */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-naranja/40 to-transparent"></div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {!faseActivacion ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Email / Usuario</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium placeholder:text-gris/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Código de Activación / Contraseña</label>
                                    <Link href="/recuperar" className="text-[0.6rem] text-gris hover:text-naranja uppercase font-bold tracking-tighter transition-colors">¿Problemas?</Link>
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium placeholder:text-gris/20"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-naranja/10 border border-naranja/30 p-4 rounded-xl mb-4">
                                <h3 className="text-naranja font-black uppercase tracking-widest text-xs mb-1">¡Cuenta Encontrada!</h3>
                                <p className="text-gris text-sm">Por seguridad, debés crear tu contraseña definitiva para continuar a tu panel.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Nueva Contraseña</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium placeholder:text-gris/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Repetí la Contraseña</label>
                                <input
                                    name="password_confirm"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium placeholder:text-gris/20"
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 transition-all text-marino font-black py-4.5 rounded-xl uppercase tracking-widest font-barlow-condensed text-xl shadow-xl shadow-naranja/10 active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                faseActivacion ? "Guardar y Entrar" : <><ArrowRight size={20} /> Entrar al Campus</>
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex flex-col items-center gap-6 pt-4">
                    <Link href="/ingresar" className="text-[0.65rem] text-gris hover:text-blanco transition-colors font-bold uppercase tracking-[0.2em] border-b border-gris/20 pb-1">
                        ← Ver otras opciones de acceso
                    </Link>
                    <p className="text-[0.6rem] text-gris/30 font-bold uppercase tracking-[0.3em] italic">Potenciado por IL-Coaching Platform</p>
                </div>
            </div>
        </main>
    );
}
