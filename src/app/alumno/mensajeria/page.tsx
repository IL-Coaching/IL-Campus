"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import { Send, User, MessageCircle, Radio } from 'lucide-react';
import { obtenerConversacionConEntrenador, enviarMensajeAEntrenador } from '@/nucleo/acciones/mensajeria-cliente.accion';
import { useChatRealtime } from '@/compartido/infraestructura/useChatRealtime';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';

interface Mensaje {
    id: string;
    emisor: string;
    contenido: string;
    tipo: string;
    mediaUrl: string | null;
    creadoEn: Date;
    leido: boolean;
}

interface Entrenador {
    id: string;
    nombre: string;
    email: string;
}

export default function MensajeriaPage() {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [entrenador, setEntrenador] = useState<Entrenador | null>(null);
    const [textoMensaje, setTextoMensaje] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleNuevoMensaje = (mensaje: Mensaje) => {
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
    };

    useChatRealtime(null, handleNuevoMensaje);

    useEffect(() => {
        async function cargarConversacion() {
            const res = await obtenerConversacionConEntrenador();
            if (res.exito && res.conversacion) {
                setEntrenador(res.conversacion.entrenador);
                setMensajes(res.conversacion.mensajes as Mensaje[]);
            }
            setIsLoading(false);
        }
        cargarConversacion();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes]);

    function handleEnviar() {
        if (!textoMensaje.trim()) return;
        const texto = textoMensaje;
        setTextoMensaje('');
        startTransition(async () => {
            await enviarMensajeAEntrenador(texto);
            const res = await obtenerConversacionConEntrenador();
            if (res.exito && res.conversacion) {
                setMensajes(res.conversacion.mensajes as Mensaje[]);
            }
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-marino flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-naranja border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            <header className="p-4 pt-12 border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-naranja/10 rounded-full flex items-center justify-center">
                            <User size={20} className="text-naranja" />
                        </div>
                        <div>
                            <h1 className="text-xl font-barlow-condensed font-black uppercase tracking-tight">
                                {entrenador?.nombre || 'Tu Entrenador'}
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <Radio size={8} className="text-green-400 animate-pulse" />
                                <p className="text-[0.55rem] text-green-400 uppercase tracking-widest font-bold">En línea</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-180px)]">
                {mensajes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-marino-3 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-marino-4">
                            <MessageCircle size={32} className="text-naranja" />
                        </div>
                        <p className="text-gris italic">Aún no hay mensajes</p>
                        <p className="text-gris text-sm mt-2">¡Envía el primer mensaje a tu entrenador!</p>
                    </div>
                ) : (
                    mensajes.map((msg) => {
                        const esCliente = msg.emisor === 'cliente';
                        return (
                            <div key={msg.id} className={`flex ${esCliente ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 ${esCliente
                                    ? 'bg-naranja/10 border border-naranja/20 rounded-br-md'
                                    : 'bg-marino-3 border border-marino-4 rounded-bl-md'
                                    }`}>
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

            <div className="p-4 border-t border-marino-4 bg-marino-2/50">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={textoMensaje}
                        onChange={(e) => setTextoMensaje(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 bg-marino-2 border border-marino-4 rounded-xl py-3 px-4 text-sm text-blanco placeholder:text-gris focus:outline-none focus:border-naranja/50 transition-all"
                        disabled={isPending}
                    />
                    <button
                        onClick={handleEnviar}
                        disabled={isPending || !textoMensaje.trim()}
                        className="w-12 h-12 rounded-xl bg-naranja flex items-center justify-center text-marino hover:bg-naranja/80 transition-colors disabled:opacity-30 flex-shrink-0"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <AlumnoNav />
        </div>
    );
}
