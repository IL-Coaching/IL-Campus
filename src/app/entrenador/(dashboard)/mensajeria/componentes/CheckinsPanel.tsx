"use client";

import { useState, useEffect, useTransition } from 'react';
import { ClipboardCheck, Eye, Camera, Scale, Ruler, Dumbbell, ChevronRight, ArrowLeft, Calendar } from 'lucide-react';
import { obtenerCheckinsNoVistos, obtenerHistorialCheckins, marcarCheckinVisto } from '@/nucleo/acciones/checkin.accion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface CheckinItem {
    id: string;
    fecha: Date;
    fotosUrls: string[];
    pesoKg: number | null;
    alturaCm: number | null;
    nota: string | null;
    energia: number | null;
    sueno: number | null;
    adherencia: number | null;
    faseCiclo: string | null;
    fuerzaRelativa: string | null;
    ajustesEsperados: string | null;
    videoUrl: string | null;
    visto: boolean;
    clienteId: string;
    cliente?: { id: string; nombre: string; email?: string };
}

type Vista = 'lista' | 'detalle' | 'historial';

export default function CheckinsPanel() {
    const [checkins, setCheckins] = useState<CheckinItem[]>([]);
    const [historial, setHistorial] = useState<CheckinItem[]>([]);
    const [seleccionado, setSeleccionado] = useState<CheckinItem | null>(null);
    const [clienteHistorial, setClienteHistorial] = useState<{ id: string; nombre: string } | null>(null);
    const [vista, setVista] = useState<Vista>('lista');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        cargarCheckins();
    }, []);

    async function cargarCheckins() {
        const res = await obtenerCheckinsNoVistos();
        if (res.exito) setCheckins(res.checkins as CheckinItem[]);
    }

    function verDetalle(checkin: CheckinItem) {
        setSeleccionado(checkin);
        setVista('detalle');
    }

    function verHistorial(clienteId: string, nombre: string) {
        setClienteHistorial({ id: clienteId, nombre });
        startTransition(async () => {
            const res = await obtenerHistorialCheckins(clienteId);
            if (res.exito && res.checkins) {
                setHistorial(res.checkins as CheckinItem[]);
                setVista('historial');
            }
        });
    }

    function handleMarcarVisto(checkinId: string) {
        startTransition(async () => {
            await marcarCheckinVisto(checkinId);
            await cargarCheckins();
            setVista('lista');
            setSeleccionado(null);
        });
    }

    function volver() {
        setVista('lista');
        setSeleccionado(null);
        setClienteHistorial(null);
    }

    // ── Vista: Lista de check-ins pendientes ──
    if (vista === 'lista') {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-marino-4 bg-naranja/5">
                    <h3 className="font-barlow-condensed font-black tracking-widest uppercase text-sm text-naranja flex items-center gap-2">
                        <ClipboardCheck size={16} /> Check-ins pendientes de revisión
                    </h3>
                    <p className="text-[0.6rem] text-gris uppercase tracking-widest font-bold mt-1">
                        {checkins.length} pendiente{checkins.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="max-h-[500px] overflow-y-auto divide-y divide-marino-4/50">
                    {checkins.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardCheck size={32} className="mx-auto text-marino-4 mb-3" />
                            <p className="text-gris italic text-sm">No hay check-ins pendientes de revisión.</p>
                        </div>
                    ) : (
                        checkins.map((ci) => (
                            <div
                                key={ci.id}
                                className="p-4 hover:bg-marino-3/30 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                                        <Camera size={18} className="text-[#EF4444]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-blanco">{ci.cliente?.nombre}</p>
                                        <p className="text-[0.6rem] text-gris uppercase tracking-widest font-bold">
                                            {format(new Date(ci.fecha), "dd MMM yyyy · HH:mm", { locale: es })}
                                        </p>
                                        <div className="flex gap-3 mt-1">
                                            {ci.pesoKg && (
                                                <span className="text-[0.55rem] text-naranja font-black uppercase flex items-center gap-1">
                                                    <Scale size={10} /> {ci.pesoKg}kg
                                                </span>
                                            )}
                                            {ci.alturaCm && (
                                                <span className="text-[0.55rem] text-gris font-bold uppercase flex items-center gap-1">
                                                    <Ruler size={10} /> {ci.alturaCm}cm
                                                </span>
                                            )}
                                            {ci.fotosUrls.length > 0 && (
                                                <span className="text-[0.55rem] text-gris font-bold uppercase">
                                                    📸 {ci.fotosUrls.length} foto{ci.fotosUrls.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => verHistorial(ci.clienteId, ci.cliente?.nombre || '')}
                                        className="text-[0.55rem] uppercase tracking-widest font-black text-gris hover:text-naranja transition-colors px-2 py-1"
                                    >
                                        Historial
                                    </button>
                                    <button
                                        onClick={() => verDetalle(ci)}
                                        className="w-8 h-8 rounded-full bg-marino-4 flex items-center justify-center text-gris group-hover:bg-naranja group-hover:text-marino transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ── Vista: Detalle de un check-in ──
    if (vista === 'detalle' && seleccionado) {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-marino-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={volver} className="text-gris hover:text-blanco transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <p className="text-sm font-black text-blanco uppercase">{seleccionado.cliente?.nombre}</p>
                            <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold">
                                Check-in del {format(new Date(seleccionado.fecha), "dd/MM/yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleMarcarVisto(seleccionado.id)}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-naranja text-marino text-[0.6rem] uppercase tracking-widest font-black hover:bg-naranja/80 transition-colors disabled:opacity-50"
                    >
                        <Eye size={14} /> Marcar como visto
                    </button>
                </div>

                <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
                    {/* Fotos */}
                    {seleccionado.fotosUrls.length > 0 && (
                        <div>
                            <h4 className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mb-3">Fotos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {seleccionado.fotosUrls.map((url, i) => (
                                    <div key={i} className="relative rounded-xl overflow-hidden border border-marino-4 aspect-square">
                                        <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Video */}
                    {seleccionado.videoUrl && (
                        <div>
                            <h4 className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mb-3">Video</h4>
                            <video src={seleccionado.videoUrl} controls className="w-full rounded-xl border border-marino-4" />
                        </div>
                    )}

                    {/* Datos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {seleccionado.pesoKg && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold flex items-center gap-1"><Scale size={10} /> Peso</p>
                                <p className="text-xl font-black text-blanco mt-1">{seleccionado.pesoKg} <span className="text-sm text-gris">kg</span></p>
                            </div>
                        )}
                        {seleccionado.alturaCm && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold flex items-center gap-1"><Ruler size={10} /> Altura</p>
                                <p className="text-xl font-black text-blanco mt-1">{seleccionado.alturaCm} <span className="text-sm text-gris">cm</span></p>
                            </div>
                        )}
                        {seleccionado.energia !== null && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold">⚡ Energía</p>
                                <p className="text-xl font-black text-blanco mt-1">{seleccionado.energia}/10</p>
                            </div>
                        )}
                        {seleccionado.sueno !== null && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold">😴 Sueño</p>
                                <p className="text-xl font-black text-blanco mt-1">{seleccionado.sueno}/10</p>
                            </div>
                        )}
                        {seleccionado.adherencia !== null && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold flex items-center gap-1"><Dumbbell size={10} /> Adherencia</p>
                                <p className="text-xl font-black text-blanco mt-1">{seleccionado.adherencia}%</p>
                            </div>
                        )}
                        {seleccionado.faseCiclo && (
                            <div className="bg-marino-3/50 border border-marino-4 p-3 rounded-xl">
                                <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold">🔴 Fase Ciclo</p>
                                <p className="text-sm font-bold text-blanco mt-1">{seleccionado.faseCiclo}</p>
                            </div>
                        )}
                    </div>

                    {/* Campos opcionales de texto */}
                    {seleccionado.fuerzaRelativa && (
                        <div className="bg-marino-3/50 border border-marino-4 p-4 rounded-xl">
                            <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mb-2">Fuerza Relativa</p>
                            <p className="text-sm text-blanco">{seleccionado.fuerzaRelativa}</p>
                        </div>
                    )}

                    {seleccionado.ajustesEsperados && (
                        <div className="bg-marino-3/50 border border-marino-4 p-4 rounded-xl">
                            <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mb-2">Ajustes Esperados</p>
                            <p className="text-sm text-blanco">{seleccionado.ajustesEsperados}</p>
                        </div>
                    )}

                    {seleccionado.nota && (
                        <div className="bg-marino-3/50 border border-marino-4 p-4 rounded-xl">
                            <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mb-2">Notas del Alumno</p>
                            <p className="text-sm text-blanco leading-relaxed">{seleccionado.nota}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Vista: Historial de check-ins de un cliente ──
    if (vista === 'historial' && clienteHistorial) {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-marino-4 flex items-center gap-3">
                    <button onClick={volver} className="text-gris hover:text-blanco transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <p className="text-sm font-black text-blanco uppercase">Historial de {clienteHistorial.nombre}</p>
                        <p className="text-[0.55rem] text-gris uppercase tracking-widest font-bold">
                            {historial.length} check-in{historial.length !== 1 ? 's' : ''} registrado{historial.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                    {historial.map((ci) => (
                        <button
                            key={ci.id}
                            onClick={() => { setSeleccionado({ ...ci, cliente: clienteHistorial }); setVista('detalle'); }}
                            className="w-full text-left p-4 bg-marino-3/50 border border-marino-4 rounded-xl hover:border-naranja/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ci.visto ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'}`}>
                                        <Calendar size={14} className={ci.visto ? 'text-[#22C55E]' : 'text-[#EF4444]'} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blanco">
                                            {format(new Date(ci.fecha), "dd/MM/yyyy", { locale: es })}
                                        </p>
                                        <div className="flex gap-3 mt-0.5">
                                            {ci.pesoKg && <span className="text-[0.55rem] text-naranja font-black">{ci.pesoKg}kg</span>}
                                            {ci.fotosUrls.length > 0 && <span className="text-[0.55rem] text-gris font-bold">📸 {ci.fotosUrls.length}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[0.5rem] uppercase tracking-widest font-black px-2 py-1 rounded-lg ${ci.visto
                                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                                        : 'bg-[#EF4444]/10 text-[#EF4444]'
                                        }`}>
                                        {ci.visto ? 'Visto' : 'Pendiente'}
                                    </span>
                                    <ChevronRight size={14} className="text-gris" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
