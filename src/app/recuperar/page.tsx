"use client"
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Key, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    // Si no hay token, el flujo es para SOLICITAR el recovery email
    if (!token) {
        return <SolicitarRecuperacion />;
    }

    // Si HAY token, el flujo es ESTABLECER nueva clave
    return <EstablecerNuevaClave token={token} />;
}

// ----------------------------------------------------
// FLUJO 1: Solicitar link al mail
// ----------------------------------------------------
function SolicitarRecuperacion() {
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        // LLAMAR A LA ACCION SERVER
        const { solicitarReseteoPassword } = await import('@/nucleo/acciones/password.accion');
        const r = await solicitarReseteoPassword(formData);

        setLoading(false);
        if (r?.error) {
            setError(r.error);
        } else {
            setExito(true);
        }
    };

    if (exito) {
        return (
            <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative">
                <div className="bg-marino-2 p-10 rounded-3xl border border-naranja/50 shadow-2xl max-w-md w-full text-center">
                    <CheckCircle size={48} className="text-naranja mx-auto mb-4" />
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase text-blanco mb-2">Email Enviado</h2>
                    <p className="text-gris text-sm mb-6">Si la cuenta existe en nuestra base de datos, te hemos mandado un link secreto válido por 30 minutos.</p>
                    <Link href="/alumno/login" className="text-xs text-blanco p-3 bg-marino-3 rounded-lg hover:bg-marino w-full inline-block uppercase font-bold tracking-widest border border-marino-4 transition-colors">Volver al Login</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative">
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-naranja/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md bg-marino-2 p-10 rounded-3xl border border-marino-4 shadow-2xl relative z-10">
                <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-2">Recuperar Acceso</h1>
                <p className="text-gris text-sm font-medium mb-8">Ingresá el email con el que estás registrado. Te enviaremos un link seguro para crear una nueva contraseña.</p>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Email de tu cuenta</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="ejemplo@email.com"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja transition-all font-medium"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 text-marino font-black py-4.5 rounded-xl uppercase tracking-widest font-barlow-condensed text-xl flex items-center justify-center gap-3 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : "Enviar Enlace Seguro"}
                    </button>
                    <div className="text-center mt-4">
                        <Link href="/alumno/login" className="text-xs text-gris uppercase hover:text-blanco transition-colors tracking-widest font-bold">← Cancelar y Volver</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}

// ----------------------------------------------------
// FLUJO 2: Establecer nueva clave con Token
// ----------------------------------------------------
function EstablecerNuevaClave({ token }: { token: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msjError, setMsjError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMsjError(null);

        const formData = new FormData(e.currentTarget);
        const p1 = formData.get("password") as string;
        const p2 = formData.get("password_confirm") as string;

        if (p1 !== p2) {
            setMsjError("Las contraseñas no coinciden mamerto.");
            setLoading(false);
            return;
        }

        if (p1.length < 6) {
            setMsjError("La contraseña debe tener al menos 6 caracteres.");
            setLoading(false);
            return;
        }

        const { completarForzarPassword } = await import('@/nucleo/acciones/auth.accion');
        const r = await completarForzarPassword(token, p1);

        if (r.success) {
            router.push('/alumno/dashboard');
        } else {
            setMsjError(r.error || "El token es inválido o ha expirado.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-marino-2 p-10 rounded-3xl border border-marino-4 shadow-2xl fade-up">
                <div className="w-16 h-16 bg-naranja/10 text-naranja rounded-2xl flex items-center justify-center mb-6 border border-naranja/20">
                    <Key size={32} />
                </div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-2">Nueva Contraseña</h1>
                <p className="text-gris text-sm font-medium mb-8">El link fue verificado exitosamente. Ahora elegí tu nueva contraseña de acceso.</p>

                {msjError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg mb-4">{msjError}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Creá una contraseña</label>
                        <input name="password" type="password" required className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-[0.25em] ml-1">Repetí tu contraseña</label>
                        <input name="password_confirm" type="password" required className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:outline-none focus:border-naranja" />
                    </div>

                    <div className="pt-4">
                        <button disabled={loading} className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 text-marino font-black py-4.5 rounded-xl uppercase tracking-widest font-barlow-condensed text-xl flex items-center justify-center">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Establecer y Entrar"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
