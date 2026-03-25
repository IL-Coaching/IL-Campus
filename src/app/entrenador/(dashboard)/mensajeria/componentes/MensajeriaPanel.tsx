"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, ClipboardCheck } from 'lucide-react';
import ChatPanel from './ChatPanel';
import CheckinsPanel from './CheckinsPanel';

type TabActivo = 'chat' | 'checkins';

export default function MensajeriaPanel() {
    const searchParams = useSearchParams();
    const clienteIdParam = searchParams.get('clienteId');
    const vistaParam = searchParams.get('vista');
    const [tab, setTab] = useState<TabActivo>('chat');
    const [clienteIdInicial, setClienteIdInicial] = useState<string | null>(null);

    useEffect(() => {
        if (vistaParam === 'checkins') {
            setTab('checkins');
        } else if (clienteIdParam) {
            setClienteIdInicial(clienteIdParam);
            setTab('chat');
        }
    }, [clienteIdParam, vistaParam]);

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab('chat')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.65rem] uppercase tracking-widest font-black transition-all ${tab === 'chat'
                        ? 'bg-naranja text-marino shadow-lg shadow-naranja/20'
                        : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco hover:border-gris'
                        }`}
                >
                    <MessageCircle size={14} /> Chat Directo
                </button>
                <button
                    onClick={() => setTab('checkins')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.65rem] uppercase tracking-widest font-black transition-all ${tab === 'checkins'
                        ? 'bg-naranja text-marino shadow-lg shadow-naranja/20'
                        : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco hover:border-gris'
                        }`}
                >
                    <ClipboardCheck size={14} /> Bandeja Check-ins
                </button>
            </div>

            {/* Contenido */}
            {tab === 'chat' ? <ChatPanel clienteIdInicial={clienteIdInicial} /> : <CheckinsPanel />}
        </div>
    );
}
