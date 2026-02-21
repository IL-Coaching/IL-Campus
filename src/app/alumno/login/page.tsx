"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AlumnoLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulamos validación y redirección
        setTimeout(() => {
            router.push('/alumno/dashboard');
        }, 1200);
    };

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-naranja/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-naranja/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

            <div className="w-full max-w-sm space-y-8 relative z-10 fade-up visible">
                {/* Logo Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 mb-4">
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <span className="text-5xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-1">IL</span>
                        <div className="w-2.5 h-8 bg-gris-claro rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                    </div>
                    <h1 className="text-2xl font-barlow-condensed font-black uppercase text-blanco tracking-tight">Acceso Entrenados</h1>
                    <p className="text-gris text-sm font-medium mt-1">Ingresá con las credenciales entregadas por el Coach</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-marino-2 p-8 rounded-2xl border border-marino-4 shadow-2xl">
                    <div className="space-y-1.5">
                        <label className="text-[0.65rem] text-naranja font-bold uppercase tracking-[0.2em] ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alumno@ejemplo.com"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[0.65rem] text-naranja font-bold uppercase tracking-[0.2em] ml-1">Contraseña Temporal</label>
                        <input
                            type="password"
                            required
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-3 text-blanco focus:outline-none focus:border-naranja/50 transition-all font-medium"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full bg-naranja hover:bg-naranja-h disabled:opacity-50 transition-all text-marino font-black py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-lg shadow-lg shadow-naranja/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Entrar al Campus"}
                        </button>
                    </div>

                    <p className="text-center">
                        <button type="button" className="text-xs text-gris hover:text-blanco transition-colors font-medium">¿Olvidaste tus datos? Contactar soporte</button>
                    </p>
                </form>

                <div className="flex justify-center pt-8">
                    <p className="text-[0.6rem] text-gris/50 font-bold uppercase tracking-[0.3em]">IL-Coaching • Campus 2025</p>
                </div>
            </div>
        </main>
    );
}
