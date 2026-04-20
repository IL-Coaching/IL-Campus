"use client";

import { useState } from 'react';
import { Dumbbell, LayoutTemplate } from 'lucide-react';
import BibliotecaEjercicios from './BibliotecaEjercicios';
import BotonAltaEjercicio from './BotonAltaEjercicio';
import ConstructorBiblioteca from './ConstructorBiblioteca';
import type { Ejercicio } from '@prisma/client';

interface Props {
    ejerciciosIniciales: Ejercicio[];
}

type TabBiblioteca = 'ejercicios' | 'rutinas';

export default function BibliotecaConTabs({ ejerciciosIniciales }: Props) {
    const [tab, setTab] = useState<TabBiblioteca>('ejercicios');

    return (
        <div className="space-y-6">
            {/* Tabs + Acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab('ejercicios')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.65rem] uppercase tracking-widest font-black transition-all ${tab === 'ejercicios'
                            ? 'bg-naranja text-marino shadow-lg shadow-naranja/20'
                            : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco hover:border-gris'
                            }`}
                    >
                        <Dumbbell size={14} /> Ejercicios
                    </button>
                    <button
                        onClick={() => setTab('rutinas')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.65rem] uppercase tracking-widest font-black transition-all ${tab === 'rutinas'
                            ? 'bg-naranja text-marino shadow-lg shadow-naranja/20'
                            : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco hover:border-gris'
                            }`}
                    >
                        <LayoutTemplate size={14} /> Rutinas
                    </button>
                </div>

                {/* Acciones contextuales */}
                {tab === 'ejercicios' && (
                    <div className="flex gap-3">
                        <BotonAltaEjercicio />
                    </div>
                )}
            </div>

            {/* Contenido */}
            {tab === 'ejercicios' ? (
                <BibliotecaEjercicios iniciales={ejerciciosIniciales} />
            ) : (
                <ConstructorBiblioteca />
            )}
        </div>
    );
}
