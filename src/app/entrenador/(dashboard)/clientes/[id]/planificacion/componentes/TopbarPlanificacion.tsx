"use client"
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    nivel: 'macro' | 'meso' | 'micro' | 'sesion';
}

interface TopbarPlanificacionProps {
    items: BreadcrumbItem[];
    cliente: any;
    onNavigate: (nivel: 'macro' | 'meso' | 'micro' | 'sesion') => void;
    onVolver: () => void;
    canVolver: boolean;
}

export default function TopbarPlanificacion({ items, cliente, onNavigate, onVolver, canVolver }: TopbarPlanificacionProps) {
    return (
        <header className="h-[56px] border-b border-marino-4 bg-marino-2 flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-6">
                {/* Logo */}
                <span className="text-2xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter">IL</span>

                <div className="h-4 w-[1px] bg-marino-4"></div>

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm font-medium">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                            {idx > 0 && <span className="mx-2 text-gris font-light">/</span>}
                            <button
                                onClick={() => onNavigate(item.nivel)}
                                className={`transition-colors uppercase tracking-tight font-barlow-condensed font-bold ${idx === items.length - 1 ? 'text-blanco' : 'text-gris hover:text-naranja'
                                    }`}
                            >
                                {item.label}
                            </button>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-6">
                {canVolver && (
                    <button
                        onClick={onVolver}
                        className="flex items-center gap-2 text-gris hover:text-blanco transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} /> Volver
                    </button>
                )}

                {/* Info Cliente */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-blanco leading-none mb-1 uppercase tracking-tight">{cliente?.nombre || 'Cargando...'}</p>
                        <p className="text-[0.65rem] text-naranja font-black uppercase tracking-widest">{cliente?.plan || 'Plan GymRat'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full border border-naranja bg-marino-4 flex items-center justify-center text-naranja font-barlow-condensed font-black">
                        {cliente?.nombre?.substring(0, 2).toUpperCase() || 'IL'}
                    </div>
                </div>
            </div>
        </header>
    );
}
