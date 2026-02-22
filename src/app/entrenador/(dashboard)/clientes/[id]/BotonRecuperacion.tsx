"use client";

import { useState } from 'react';
import { ShieldAlert, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { generarLinkRecuperacionManual } from '@/nucleo/acciones/password.accion';

export default function BotonRecuperacion({ clienteId }: { clienteId: string }) {
    const [generandoLink, setGenerandoLink] = useState(false);
    const [linkRecuperacion, setLinkRecuperacion] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);

    const handleGenerarLink = async () => {
        setGenerandoLink(true);
        const result = await generarLinkRecuperacionManual(clienteId);
        setGenerandoLink(false);

        if (result.success && result.link) {
            setLinkRecuperacion(result.link);
        } else {
            alert(result.error || "Ocurrió un error al generar el link.");
        }
    };

    const copiarLink = () => {
        if (!linkRecuperacion) return;
        navigator.clipboard.writeText(linkRecuperacion);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3000);
    };

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6">
            <h4 className="flex items-center gap-2 text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-4">
                <ShieldAlert size={14} /> Acceso y Seguridad
            </h4>
            <p className="text-[0.7rem] text-gris leading-relaxed font-medium mb-4">
                Si el cliente olvidó su contraseña o nunca la generó, podés crear un link de único uso válido por 24 horas y enviárselo manualmente.
            </p>

            {!linkRecuperacion ? (
                <button
                    onClick={handleGenerarLink}
                    disabled={generandoLink}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-marino-3 border border-marino-4 hover:border-naranja/50 rounded-lg text-[0.65rem] font-bold text-blanco uppercase tracking-widest transition-all disabled:opacity-50 group"
                >
                    {generandoLink ? <Loader2 size={16} className="animate-spin text-naranja" /> : <ShieldAlert size={16} className="text-gris group-hover:text-naranja transition-colors" />}
                    Generar Link de Recuperación
                </button>
            ) : (
                <div className="bg-marino border border-naranja/50 rounded-xl p-4 flex flex-col items-center gap-2 relative group animate-in zoom-in-95">
                    <span className="text-[0.65rem] text-naranja font-black uppercase tracking-widest text-center">Link Generado Exitosamente</span>
                    <p className="text-[0.6rem] text-gris text-center italic break-all px-2">{linkRecuperacion}</p>

                    <button
                        onClick={copiarLink}
                        className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase font-black tracking-widest px-4 py-2.5 bg-naranja/10 text-naranja hover:bg-naranja hover:text-marino transition-colors rounded-lg w-full justify-center"
                    >
                        {copiado ? <><CheckCircle2 size={16} /> Link Copiado</> : <><Copy size={16} /> Copiar para WhatsApp</>}
                    </button>
                </div>
            )}
        </div>
    );
}
