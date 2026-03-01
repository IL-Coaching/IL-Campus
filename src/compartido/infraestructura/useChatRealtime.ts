"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseCliente } from '@/compartido/infraestructura/supabase-cliente';

export interface MensajeRealtime {
    id: string;
    clienteId: string;
    emisor: 'entrenador' | 'cliente';
    contenido: string;
    tipo: 'texto' | 'imagen' | 'video';
    mediaUrl: string | null;
    creadoEn: Date;
    leido: boolean;
}

type SuscripcionCallback = (mensaje: MensajeRealtime) => void;

export function useChatRealtime(clienteId: string | null, onNuevoMensaje?: SuscripcionCallback) {
    const [isConnected, setIsConnected] = useState(false);

    const subscribeToMessages = useCallback(() => {
        if (!clienteId) return;

        setIsConnected(true);

        const channel = supabaseCliente
            .channel(`chat:${clienteId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes',
                    filter: `clienteId=eq.${clienteId}`
                },
                (payload) => {
                    const nuevoMensaje = payload.new as MensajeRealtime;
                    if (onNuevoMensaje) {
                        onNuevoMensaje(nuevoMensaje);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'mensajes',
                    filter: `clienteId=eq.${clienteId}`
                },
                (payload) => {
                    console.log('Mensaje actualizado:', payload);
                }
            )
            .subscribe();

        return () => {
            supabaseCliente.removeChannel(channel);
            setIsConnected(false);
        };
    }, [clienteId, onNuevoMensaje]);

    useEffect(() => {
        const cleanup = subscribeToMessages();
        return () => {
            if (cleanup) cleanup();
        };
    }, [subscribeToMessages]);

    return { isConnected };
}

export function useConversacionesRealtime(entrenadorId: string, onNuevaActividad?: () => void) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!entrenadorId) return;

        setIsConnected(true);

        const channel = supabaseCliente
            .channel(`conversaciones:${entrenadorId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes'
                },
                async (payload) => {
                    const nuevoMensaje = payload.new as MensajeRealtime;
                    if (nuevoMensaje.emisor === 'cliente') {
                        if (onNuevaActividad) {
                            onNuevaActividad();
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseCliente.removeChannel(channel);
            setIsConnected(false);
        };
    }, [entrenadorId, onNuevaActividad]);

    return { isConnected };
}
