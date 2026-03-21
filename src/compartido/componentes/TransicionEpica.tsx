"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface TransicionEpicaProps {
    duracion?: number;
    destino?: string;
}

export default function TransicionEpica({ duracion = 2500, destino = '/alumno/dashboard' }: TransicionEpicaProps) {
    const router = useRouter();
    const [fase, setFase] = useState<'logo' | 'slogan' | 'fade'>('logo');

    useEffect(() => {
        // Fase 1: Logo aparece (0-1s)
        const timer1 = setTimeout(() => setFase('slogan'), 1000);
        
        // Fase 2: Slogan aparece (1-2s)
        const timer2 = setTimeout(() => setFase('fade'), 2000);
        
        // Fase 3: Transición final y navegar (2.5s)
        const timer3 = setTimeout(() => router.push(destino), duracion);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [duracion, destino, router]);

    return (
        <div className="fixed inset-0 z-[9999] bg-marino flex flex-col items-center justify-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-naranja/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Logo container */}
            <div 
                className={`
                    relative z-10 transition-all duration-1000 ease-out
                    ${fase === 'logo' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                    ${fase === 'fade' ? 'scale-150 opacity-0 blur-lg' : 'scale-100 opacity-100 blur-0'}
                `}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-naranja/30 blur-3xl rounded-full scale-150 animate-pulse" />
                
                {/* Logo */}
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <Image
                        src="/icon.png"
                        alt="Logo de IL-Coaching - Plataforma de entrenamiento personalizado"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
            </div>

            {/* Slogan */}
            <div 
                className={`
                    absolute bottom-1/3 text-center px-6 transition-all duration-1000 ease-out
                    ${fase === 'slogan' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
            >
                <p className="text-naranja font-barlow-condensed font-black text-xl md:text-2xl uppercase tracking-[0.3em] animate-pulse">
                    Más que entrenar
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="w-8 h-px bg-naranja/50" />
                    <p className="text-blanco font-bold text-sm md:text-base tracking-widest">
                        ENTENDER, ADAPTAR, PROGRESAR
                    </p>
                    <span className="w-8 h-px bg-naranja/50" />
                </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-marino-3 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-naranja to-yellow-500 rounded-full transition-all duration-300"
                    style={{ 
                        width: fase === 'logo' ? '30%' : fase === 'slogan' ? '60%' : '100%',
                        transitionDuration: '500ms'
                    }}
                />
            </div>
        </div>
    );
}
