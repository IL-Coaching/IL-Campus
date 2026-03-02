"use client";

import { useState } from 'react';
import { Send, ChevronLeft, Battery, Moon, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { enviarCheckin } from '@/nucleo/acciones/checkin.accion';
import { useRouter } from 'next/navigation';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';

export default function CheckinPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const [formData, setFormData] = useState({
        energia: 5,
        sueno: 5,
        adherencia: 50,
        problemaFisico: false,
        notaProblema: '',
        intensidad: 'media',
        nota: ''
    });

    const handleEnviar = async () => {
        setIsPending(true);
        try {
            const result = await enviarCheckin({
                energia: formData.energia,
                sueno: formData.sueno,
                adherencia: formData.adherencia,
                problemaFisico: formData.problemaFisico,
                notaProblema: formData.notaProblema,
                intensidad: formData.intensidad,
                nota: formData.nota
            });
            
            if (result.exito) {
                setEnviado(true);
                setTimeout(() => {
                    router.push('/alumno/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Error al enviar check-in:', error);
        } finally {
            setIsPending(false);
        }
    };

    if (enviado) {
        return (
            <div className="min-h-screen bg-marino pb-24 text-blanco flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-500/20 text-green-400 border-2 border-green-500/30 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tight">¡Listo!</h1>
                <p className="text-gris text-sm mt-4">Tu check-in fue enviado a tu entrenador.</p>
                <AlumnoNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            {/* Header */}
            <header className="p-6 pt-10 border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-marino-3 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-gris" />
                        </button>
                        <div>
                            <h1 className="text-xl font-barlow-condensed font-black uppercase">Check-in Semanal</h1>
                            <p className="text-[0.6rem] text-gris uppercase tracking-widest">Paso {step} de 2</p>
                        </div>
                    </div>
                    <div className="w-16 h-2 bg-marino-3 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-naranja rounded-full transition-all duration-300"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {step === 1 ? (
                    <>
                        {/* Energía */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                    <Battery size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blanco">¿Cómo te sentiste esta semana?</h3>
                                    <p className="text-[0.6rem] text-gris">Nivel de energía general</p>
                                </div>
                            </div>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setFormData({ ...formData, energia: num })}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            formData.energia >= num 
                                                ? 'bg-naranja text-marino' 
                                                : 'bg-marino-3 text-gris hover:bg-marino-4'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-[0.5rem] text-gris mt-2 uppercase tracking-widest">
                                <span>Sin energía</span>
                                <span>Max energía</span>
                            </div>
                        </section>

                        {/* Sueño */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <Moon size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blanco">¿Cómo dormiste?</h3>
                                    <p className="text-[0.6rem] text-gris">Calidad de sueño</p>
                                </div>
                            </div>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setFormData({ ...formData, sueno: num })}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            formData.sueno >= num 
                                                ? 'bg-blue-500 text-marino' 
                                                : 'bg-marino-3 text-gris hover:bg-marino-4'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-[0.5rem] text-gris mt-2 uppercase tracking-widest">
                                <span>Mal sueño</span>
                                <span>Perfecto</span>
                            </div>
                        </section>

                        {/* Adherencia */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <Activity size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blanco">¿Cumpliste tu rutina?</h3>
                                    <p className="text-[0.6rem] text-gris">% de ejercicios completados</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={formData.adherencia}
                                    onChange={(e) => setFormData({ ...formData, adherencia: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-marino-3 rounded-full appearance-none cursor-pointer accent-naranja"
                                />
                                <span className="text-2xl font-barlow-condensed font-black text-naranja w-16 text-center">
                                    {formData.adherencia}%
                                </span>
                            </div>
                        </section>

                        {/* Botón siguiente */}
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full bg-naranja text-marino font-black py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-lg transition-all hover:bg-naranja-h"
                        >
                            Siguiente
                        </button>
                    </>
                ) : (
                    <>
                        {/* Problema físico */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                    <AlertCircle size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blanco">¿Tuviste algún problema físico?</h3>
                                    <p className="text-[0.6rem] text-gris">Dolor, lesión, molestia</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFormData({ ...formData, problemaFisico: false })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                        !formData.problemaFisico 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-marino-3 text-gris border border-marino-4'
                                    }`}
                                >
                                    No, todo bien
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, problemaFisico: true })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                        formData.problemaFisico 
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                            : 'bg-marino-3 text-gris border border-marino-4'
                                    }`}
                                >
                                    Sí, detallo abajo
                                </button>
                            </div>
                            {formData.problemaFisico && (
                                <textarea
                                    value={formData.notaProblema}
                                    onChange={(e) => setFormData({ ...formData, notaProblema: e.target.value })}
                                    placeholder="Describe el problema..."
                                    className="w-full mt-4 bg-marino-3 border border-marino-4 rounded-xl p-3 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 resize-none"
                                    rows={3}
                                />
                            )}
                        </section>

                        {/* Intensidad */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-blanco mb-4">¿Cómo sentiste la intensidad?</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'baja', label: 'Muy fácil' },
                                    { value: 'media', label: 'Adecuada' },
                                    { value: 'alta', label: 'Muy difícil' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFormData({ ...formData, intensidad: opt.value })}
                                        className={`py-3 rounded-xl font-bold text-xs transition-all ${
                                            formData.intensidad === opt.value 
                                                ? 'bg-naranja text-marino' 
                                                : 'bg-marino-3 text-gris border border-marino-4'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Notas opcionales */}
                        <section className="bg-marino-2 border border-marino-4 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-blanco mb-2">Notas adicionales (opcional)</h3>
                            <textarea
                                value={formData.nota}
                                onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                                placeholder="Anything else you want to share..."
                                className="w-full bg-marino-3 border border-marino-4 rounded-xl p-3 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 resize-none"
                                rows={3}
                            />
                        </section>

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 bg-marino-3 text-blanco font-bold py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-sm transition-all border border-marino-4"
                            >
                                Atrás
                            </button>
                            <button 
                                onClick={handleEnviar}
                                disabled={isPending}
                                className="flex-1 bg-naranja text-marino font-black py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-lg transition-all hover:bg-naranja-h disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-marino border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} /> Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </main>

            <AlumnoNav />
        </div>
    );
}
