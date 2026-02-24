"use client";

import { useState, useEffect, useTransition } from 'react';
import { Bell, Check, Eye, EyeOff, Trash2, MessageCircle, DollarSign, Clock, FileText, Activity } from 'lucide-react';
import { obtenerNotificaciones, toggleLeidaNotificacion, purgarNotificaciones } from '@/nucleo/acciones/notificacion.accion';

interface Notificacion {
    id: string;
    tipo: string;
    gravedad: 'INFO' | 'ALERTA' | 'CRITICO';
    titulo: string;
    cuerpo: string;
    leida: boolean;
    creadaEn: Date;
}

const ICONO_TIPO: Record<string, { icono: typeof Bell; color: string; bgColor: string }> = {
    MENSAJE_DIRECTO: { icono: MessageCircle, color: 'text-naranja', bgColor: 'bg-naranja/10' },
    FINANZA: { icono: DollarSign, color: 'text-[#22C55E]', bgColor: 'bg-[#22C55E]/10' },
    VENCIMIENTO_MEMBRESIA: { icono: Clock, color: 'text-[#EF4444]', bgColor: 'bg-[#EF4444]/10' },
    NUEVO_FORMULARIO: { icono: FileText, color: 'text-[#EAB308]', bgColor: 'bg-[#EAB308]/10' },
    CHECKIN: { icono: Activity, color: 'text-blue-400', bgColor: 'bg-blue-400/10' }
};

const BORDER_GRAVEDAD: Record<string, string> = {
    INFO: 'border-marino-4',
    ALERTA: 'border-naranja/40 shadow-[0_0_10px_rgba(255,152,0,0.1)]',
    CRITICO: 'border-rojo/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
};

export default function PanelNotificaciones() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [tab, setTab] = useState<'no_leidas' | 'todas'>('no_leidas');
    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    async function cargarNotificaciones() {
        const res = await obtenerNotificaciones();
        if (res.exito) {
            setNotificaciones(res.notificaciones as unknown as Notificacion[]);
        }
    }

    function handleToggleLeida(id: string) {
        startTransition(async () => {
            await toggleLeidaNotificacion(id);
            await cargarNotificaciones();
        });
    }

    function handlePurgar() {
        const ids = seleccionadas.size > 0 ? Array.from(seleccionadas) : [];
        startTransition(async () => {
            await purgarNotificaciones(ids);
            setSeleccionadas(new Set());
            await cargarNotificaciones();
        });
    }

    function toggleSeleccion(id: string) {
        setSeleccionadas(prev => {
            const nuevo = new Set(prev);
            if (nuevo.has(id)) nuevo.delete(id);
            else nuevo.add(id);
            return nuevo;
        });
    }

    const noLeidas = notificaciones.filter(n => !n.leida);
    const lista = tab === 'no_leidas' ? noLeidas : notificaciones;
    const hayLeidas = notificaciones.some(n => n.leida);

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-[480px] overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-marino-4 bg-naranja/5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-barlow-condensed font-black tracking-widest uppercase text-sm text-naranja flex items-center gap-2">
                        <Bell size={16} /> Notificaciones
                    </h3>
                    {(hayLeidas || seleccionadas.size > 0) && (
                        <button
                            onClick={handlePurgar}
                            disabled={isPending}
                            className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-widest font-black text-[#EF4444] hover:text-blanco transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={12} />
                            {seleccionadas.size > 0 ? `Eliminar (${seleccionadas.size})` : 'Purgar leídas'}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab('no_leidas')}
                        className={`px-3 py-1.5 rounded-lg text-[0.6rem] uppercase tracking-widest font-black transition-all ${tab === 'no_leidas'
                            ? 'bg-naranja text-marino'
                            : 'bg-marino-3 text-gris hover:text-blanco border border-marino-4'
                            }`}
                    >
                        No Leídas ({noLeidas.length})
                    </button>
                    <button
                        onClick={() => setTab('todas')}
                        className={`px-3 py-1.5 rounded-lg text-[0.6rem] uppercase tracking-widest font-black transition-all ${tab === 'todas'
                            ? 'bg-naranja text-marino'
                            : 'bg-marino-3 text-gris hover:text-blanco border border-marino-4'
                            }`}
                    >
                        Todas ({notificaciones.length})
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {lista.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Check size={32} className="text-marino-4 mb-3" />
                        <p className="text-gris italic text-sm">
                            {tab === 'no_leidas' ? 'No hay notificaciones nuevas.' : 'No hay notificaciones.'}
                        </p>
                    </div>
                ) : (
                    lista.map((notif) => {
                        const config = ICONO_TIPO[notif.tipo] || ICONO_TIPO.MENSAJE_DIRECTO;
                        const Icono = config.icono;
                        const isSelected = seleccionadas.has(notif.id);

                        return (
                            <div
                                key={notif.id}
                                className={`p-3 rounded-xl border transition-all ${notif.leida
                                    ? 'bg-marino-3/30 border-marino-4 opacity-60'
                                    : `bg-marino-3/50 ${BORDER_GRAVEDAD[notif.gravedad] || 'border-naranja/20'}`
                                    } ${isSelected ? 'ring-1 ring-naranja' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleSeleccion(notif.id)}
                                        className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected
                                            ? 'bg-naranja border-naranja text-marino'
                                            : 'border-marino-4 hover:border-gris'
                                            }`}
                                    >
                                        {isSelected && <Check size={10} />}
                                    </button>

                                    {/* Ícono tipo */}
                                    <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <Icono size={14} className={config.color} />
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-blanco leading-tight">{notif.titulo}</p>
                                        <p className="text-xs text-gris mt-0.5 line-clamp-2">{notif.cuerpo}</p>
                                    </div>

                                    {/* Acciones */}
                                    <button
                                        onClick={() => handleToggleLeida(notif.id)}
                                        disabled={isPending}
                                        className="flex-shrink-0 px-2 py-1.5 rounded-lg bg-naranja/10 hover:bg-naranja hover:text-marino text-naranja text-[0.55rem] uppercase tracking-widest font-black transition-all disabled:opacity-50"
                                        title={notif.leida ? 'Marcar como NO leído' : 'Marcar como leído'}
                                    >
                                        {notif.leida ? (
                                            <span className="flex items-center gap-1"><EyeOff size={10} /> No leído</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Eye size={10} /> Leído</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
