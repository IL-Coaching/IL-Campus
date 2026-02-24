"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    Calendar,
    MessageCircle,
    Save,
    CheckCircle2
} from "lucide-react";
import { ClientePlanificacion } from "@/nucleo/tipos/planificacion.tipos";
import BotonRecuperacion from "../BotonRecuperacion";
import { actualizarNotasCliente } from "@/nucleo/acciones/cliente.accion";

interface Props {
    cliente: ClientePlanificacion;
}

export default function TabResumen({ cliente }: Props) {
    const [notas, setNotas] = useState(cliente.notas || "");
    const [isPending, startTransition] = useTransition();
    const [guardadoExitoy, setGuardadoExito] = useState(false);

    const handleGuardarNotas = () => {
        startTransition(async () => {
            const res = await actualizarNotasCliente(cliente.id, notas);
            if (res?.exito) {
                setGuardadoExito(true);
                setTimeout(() => setGuardadoExito(false), 2000);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up visible">
            {/* Columna Izquierda: Información y Estado */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-marino-4 mb-6">
                        <div className="w-24 h-24 bg-marino-3 rounded-full flex items-center justify-center border-2 border-naranja/30 mb-4 text-4xl font-barlow-condensed font-black text-naranja">
                            {cliente.nombre.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-blanco leading-none">{cliente.nombre}</h3>
                        <p className="text-gris text-sm mt-1">{cliente.email}</p>
                        <div className="mt-4 flex gap-2">
                            {cliente.activo ? (
                                <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                    Activo
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-rojo/10 text-rojo border border-rojo/20 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                    Inactivo
                                </span>
                            )}
                            <span className="px-3 py-1 bg-marino-3 text-gris border border-marino-4 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                {cliente.plan || "Sin Plan"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gris flex items-center gap-2"><Calendar size={14} /> Fecha Alta</span>
                            <span className="text-blanco font-medium">{new Date(cliente.fechaAlta).toLocaleDateString('es-AR')}</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <Link
                            href={`/entrenador/clientes/${cliente.id}/planificacion`}
                            className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-3 rounded-xl uppercase tracking-widest font-barlow-condensed text-sm transition-all shadow-lg shadow-naranja/10 text-center block"
                        >
                            Gestionar Planificación
                        </Link>
                        <Link
                            href={`/entrenador/mensajes?receptor=${cliente.id}`}
                            className="w-full bg-marino-3 border border-marino-4 text-blanco font-bold py-3 rounded-xl uppercase tracking-widest font-barlow-condensed text-xs hover:bg-marino-4 transition-all flex items-center justify-center gap-2 text-center"
                        >
                            <MessageCircle size={14} /> Enviar Mensaje
                        </Link>
                    </div>
                </div>

                {/* Tarjeta de Seguridad y MFA */}
                <BotonRecuperacion clienteId={cliente.id} />
            </div>

            {/* Columna Derecha: Notas y Resumen */}
            <div className="lg:col-span-2 space-y-6">

                {/* Notas Rápidas / Auto-Guardables */}
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="flex-1 text-[0.6rem] font-black text-gris uppercase tracking-[0.2em]">Notas Internas (Privado)</h4>
                        {guardadoExitoy && (
                            <span className="flex items-center gap-1 text-[0.6rem] text-verde uppercase font-black tracking-widest">
                                <CheckCircle2 size={12} /> Guardado
                            </span>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            onBlur={handleGuardarNotas}
                            placeholder="Escribe aquí notas sobre el entrenado..."
                            className="w-full h-full min-h-[300px] bg-marino p-4 rounded-xl border border-marino-4 text-sm text-gris-claro leading-relaxed resize-none focus:outline-none focus:border-naranja/50 transition-colors"
                        />
                        <button
                            onClick={handleGuardarNotas}
                            disabled={isPending}
                            className={`absolute bottom-4 right-4 p-2 rounded-lg bg-naranja/10 text-naranja hover:bg-naranja hover:text-marino transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Guardar notas (Se guardan al salir de la caja)"
                        >
                            <Save size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
