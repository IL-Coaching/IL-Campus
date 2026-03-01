"use client";

import { useGamificacionStore, LOGROS, type Logro, type LogroDesbloqueado } from '@/compartido/infraestructura/gamificacion.store';
import { Trophy, Flame, Star, Lock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PanelGamificacion() {
    const { 
        xp, 
        nivel, 
        rachas, 
        maxRacha, 
        logrosDesbloqueados,
        getProgresoNivel,
        getXPSiguienteNivel 
    } = useGamificacionStore();

    const [showUnlock, setShowUnlock] = useState(false);
    const [ultimoDesbloqueado, setUltimoDesbloqueado] = useState<Logro | null>(null);
    const progreso = getProgresoNivel();
    const xpSigNivel = getXPSiguienteNivel();

    useEffect(() => {
        if (logrosDesbloqueados.length > 0) {
            const ultimo = LOGROS.find((l: Logro) => l.id === logrosDesbloqueados[logrosDesbloqueados.length - 1].logroId);
            if (ultimo) {
                setUltimoDesbloqueado(ultimo);
                setShowUnlock(true);
                setTimeout(() => setShowUnlock(false), 4000);
            }
        }
    }, [logrosDesbloqueados]);

    const logrosPorDesbloquear = LOGROS.filter((l: Logro) => !logrosDesbloqueados.some((ld: LogroDesbloqueado) => ld.logroId === l.id));

    return (
        <>
            {/* Notificación de logro desbloqueado */}
            {showUnlock && ultimoDesbloqueado && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="text-3xl">{ultimoDesbloqueado.icono}</div>
                        <div>
                            <p className="text-xs text-white/80 font-bold uppercase tracking-wider">¡Logro Desbloqueado!</p>
                            <p className="text-white font-black">{ultimoDesbloqueado.titulo}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Header de nivel */}
                <div className="bg-gradient-to-br from-naranja/20 to-naranja/5 border border-naranja/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-naranja/20 rounded-xl flex items-center justify-center">
                                <Trophy size={24} className="text-naranja" />
                            </div>
                            <div>
                                <p className="text-xs text-naranja font-black uppercase tracking-wider">Nivel {nivel}</p>
                                <p className="text-2xl font-barlow-condensed font-black text-blanco">{xp} XP</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gris font-bold">SIGUIENTE</p>
                            <p className="text-sm font-bold text-blanco">{xpSigNivel} XP</p>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="h-3 bg-marino-4 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-naranja to-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Racha */}
                    <div className="bg-marino-2/60 border border-marino-4/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame size={16} className="text-orange-500" />
                            <p className="text-xs text-gris font-bold uppercase">Racha Actual</p>
                        </div>
                        <p className="text-3xl font-barlow-condensed font-black text-blanco">{rachas} <span className="text-sm text-gris font-normal">días</span></p>
                        <p className="text-[0.6rem] text-gris mt-1">Mejor: {maxRacha} días</p>
                    </div>

                    {/* Logros */}
                    <div className="bg-marino-2/60 border border-marino-4/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={16} className="text-yellow-500" />
                            <p className="text-xs text-gris font-bold uppercase">Logros</p>
                        </div>
                        <p className="text-3xl font-barlow-condensed font-black text-blanco">{logrosDesbloqueados.length} <span className="text-sm text-gris font-normal">/ {LOGROS.length}</span></p>
                        <p className="text-[0.6rem] text-gris mt-1">{logrosPorDesbloquear.length} restantes</p>
                    </div>
                </div>

                {/* Lista de logros */}
                <div className="bg-marino-2/60 border border-marino-4/50 rounded-2xl p-4">
                    <p className="text-xs text-naranja font-black uppercase tracking-wider mb-3">Progreso de Logros</p>
                    <div className="space-y-2">
                        {LOGROS.slice(0, 5).map((logro) => {
                            const desbloqueado = logrosDesbloqueados.some(l => l.logroId === logro.id);
                            return (
                                <div 
                                    key={logro.id}
                                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                                        desbloqueado 
                                            ? 'bg-naranja/10 border border-naranja/20' 
                                            : 'bg-marino-3/30 border border-marino-4/30'
                                    }`}
                                >
                                    <span className="text-xl">{desbloqueado ? logro.icono : <Lock size={16} className="text-gris" />}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${desbloqueado ? 'text-blanco' : 'text-gris'}`}>
                                            {logro.titulo}
                                        </p>
                                        <p className="text-[0.6rem] text-gris truncate">{logro.descripcion}</p>
                                    </div>
                                    {desbloqueado && (
                                        <Sparkles size={14} className="text-naranja shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
