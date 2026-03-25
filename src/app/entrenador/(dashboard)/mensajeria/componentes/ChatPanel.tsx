"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { Search, Send, Paperclip, User, MessageCircle, Radio } from 'lucide-react';
import { obtenerConversaciones, obtenerMensajesCliente, enviarMensaje, enviarMensajeConMedia } from '@/nucleo/acciones/mensajeria.accion';
import { useChatRealtime, useConversacionesRealtime, type MensajeRealtime } from '@/compartido/infraestructura/useChatRealtime';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface Conversacion {
    clienteId: string;
    nombre: string;
    email: string;
    ultimoMensaje: { contenido: string; emisor: string; creadoEn: Date; tipo: string } | null;
    noLeidos: number;
}

interface MensajeChat {
    id: string;
    emisor: string;
    contenido: string;
    tipo: string;
    mediaUrl: string | null;
    creadoEn: Date;
    leido: boolean;
}

interface ChatPanelProps {
    clienteIdInicial?: string | null;
}

export default function ChatPanel({ clienteIdInicial }: ChatPanelProps) {
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [clienteActivo, setClienteActivo] = useState<string | null>(null);
    const [nombreActivo, setNombreActivo] = useState('');
    const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
    const [textoMensaje, setTextoMensaje] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNuevoMensaje = useCallback((mensaje: MensajeRealtime) => {
        if (mensaje.clienteId === clienteActivo) {
            setMensajes(prev => [...prev, {
                id: mensaje.id,
                emisor: mensaje.emisor,
                contenido: mensaje.contenido,
                tipo: mensaje.tipo,
                mediaUrl: mensaje.mediaUrl,
                creadoEn: mensaje.creadoEn,
                leido: mensaje.leido
            }]);
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        }
        cargarConversaciones();
    }, [clienteActivo]);

    const handleNuevaActividad = useCallback(() => {
        cargarConversaciones();
    }, []);

    useChatRealtime(clienteActivo, handleNuevoMensaje);
    useConversacionesRealtime('entrenador', handleNuevaActividad);

    useEffect(() => {
        cargarConversaciones();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes]);

    useEffect(() => {
        if (clienteIdInicial) {
            const conv = conversaciones.find(c => c.clienteId === clienteIdInicial);
            if (conv) {
                seleccionarCliente(conv.clienteId, conv.nombre);
            }
        }
    }, [clienteIdInicial, conversaciones]);

    async function cargarConversaciones() {
        const res = await obtenerConversaciones();
        if (res.exito) setConversaciones(res.conversaciones);
    }

    function seleccionarCliente(clienteId: string, nombre: string) {
        setClienteActivo(clienteId);
        setNombreActivo(nombre);
        startTransition(async () => {
            const res = await obtenerMensajesCliente(clienteId);
            if (res.exito && res.mensajes) {
                setMensajes(res.mensajes as MensajeChat[]);
            }
            await cargarConversaciones();
        });
    }

    function handleEnviar() {
        if (!clienteActivo || !textoMensaje.trim()) return;
        const texto = textoMensaje;
        setTextoMensaje('');
        startTransition(async () => {
            await enviarMensaje(clienteActivo!, texto);
            const res = await obtenerMensajesCliente(clienteActivo!);
            if (res.exito && res.mensajes) setMensajes(res.mensajes as MensajeChat[]);
            await cargarConversaciones();
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !clienteActivo) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            startTransition(async () => {
                await enviarMensajeConMedia(clienteActivo!, base64, file.type);
                const res = await obtenerMensajesCliente(clienteActivo!);
                if (res.exito && res.mensajes) setMensajes(res.mensajes as MensajeChat[]);
                await cargarConversaciones();
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    const conversacionesFiltradas = busqueda
        ? conversaciones.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        : conversaciones;

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-xl h-[600px] flex overflow-hidden shadow-lg">
            {/* Sidebar conversaciones */}
            <div className="w-80 border-r border-marino-4 bg-marino-3/20 flex flex-col">
                {/* Buscador */}
                <div className="p-3 border-b border-marino-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar alumno..."
                            className="w-full bg-marino border border-marino-4 rounded-lg py-2 pl-9 pr-3 text-xs text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50"
                        />
                    </div>
                </div>

                {/* Lista de conversaciones */}
                <div className="flex-1 overflow-y-auto">
                    {conversacionesFiltradas.map((conv) => (
                        <button
                            key={conv.clienteId}
                            onClick={() => seleccionarCliente(conv.clienteId, conv.nombre)}
                            className={`w-full text-left p-3 border-b border-marino-4/50 transition-colors hover:bg-marino-3/50 ${clienteActivo === conv.clienteId ? 'bg-naranja/5 border-l-2 border-l-naranja' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-marino-4 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-gris" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-blanco truncate">{conv.nombre}</p>
                                        {conv.noLeidos > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-naranja text-marino text-[0.5rem] font-black flex items-center justify-center flex-shrink-0">
                                                {conv.noLeidos}
                                            </span>
                                        )}
                                    </div>
                                    {conv.ultimoMensaje && (
                                        <p className="text-[0.6rem] text-gris truncate mt-0.5">
                                            {conv.ultimoMensaje.emisor === 'entrenador' ? 'Tú: ' : ''}
                                            {conv.ultimoMensaje.tipo !== 'texto' ? `📎 ${conv.ultimoMensaje.tipo}` : conv.ultimoMensaje.contenido}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}

                    {conversacionesFiltradas.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-gris italic text-xs">No hay conversaciones</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Área de chat */}
            <div className="flex-1 flex flex-col">
                {!clienteActivo ? (
                    /* Sin conversación seleccionada */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-marino-3 rounded-2xl flex items-center justify-center mb-4 border border-marino-4">
                            <MessageCircle size={32} className="text-naranja" />
                        </div>
                        <h3 className="text-xl font-barlow-condensed font-black text-blanco uppercase tracking-tighter mb-2">
                            Central de Mensajería
                        </h3>
                        <p className="text-gris text-sm max-w-sm">
                            Seleccioná un alumno del panel izquierdo para iniciar o continuar una conversación.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header del chat */}
                        <div className="p-4 border-b border-marino-4 bg-marino-3/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-naranja/10 flex items-center justify-center">
                                    <User size={16} className="text-naranja" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-blanco uppercase tracking-tight">{nombreActivo}</p>
                                    <div className="flex items-center gap-1.5">
                                        <Radio size={8} className="text-green-400 animate-pulse" />
                                        <p className="text-[0.55rem] text-green-400 uppercase tracking-widest font-bold">En vivo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                            {mensajes.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gris italic text-sm">Inicio de conversación con {nombreActivo}</p>
                                </div>
                            ) : (
                                mensajes.map((msg) => {
                                    const esEntrenador = msg.emisor === 'entrenador';
                                    return (
                                        <div key={msg.id} className={`flex ${esEntrenador ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl p-3 ${esEntrenador
                                                ? 'bg-naranja/10 border border-naranja/20 rounded-br-md'
                                                : 'bg-marino-3 border border-marino-4 rounded-bl-md'
                                                }`}>
                                                {/* Media */}
                                                {msg.mediaUrl && msg.tipo === 'imagen' && (
                                                    <div className="relative mb-2 rounded-xl overflow-hidden w-64 h-64">
                                                        <Image src={msg.mediaUrl} alt="Imagen compartida en el chat" fill className="object-cover" />
                                                    </div>
                                                )}
                                                {msg.mediaUrl && msg.tipo === 'video' && (
                                                    <div className="mb-2 rounded-xl overflow-hidden">
                                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-64 rounded-xl" aria-label="Video de referencia enviado en el chat" />
                                                    </div>
                                                )}

                                                {msg.contenido && (
                                                    <p className="text-sm text-blanco leading-relaxed">{msg.contenido}</p>
                                                )}
                                                <p className="text-[0.5rem] text-gris mt-1 uppercase tracking-widest font-bold">
                                                    {format(new Date(msg.creadoEn), "dd MMM HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-marino-4 bg-marino-3/30">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 rounded-xl bg-marino-4 flex items-center justify-center text-gris hover:text-naranja transition-colors flex-shrink-0"
                                    title="Adjuntar archivo"
                                >
                                    <Paperclip size={16} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <input
                                    type="text"
                                    value={textoMensaje}
                                    onChange={(e) => setTextoMensaje(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribí un mensaje..."
                                    className="flex-1 bg-marino-2 border border-marino-4 rounded-xl py-2.5 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-all"
                                    disabled={isPending}
                                />
                                <button
                                    onClick={handleEnviar}
                                    disabled={isPending || !textoMensaje.trim()}
                                    className="w-10 h-10 rounded-xl bg-naranja flex items-center justify-center text-marino hover:bg-naranja/80 transition-colors disabled:opacity-30 flex-shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
