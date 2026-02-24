"use client";

import { Info, Receipt, CreditCard } from "lucide-react";

interface Props {
    clienteId: string;
}

export default function TabFinanzas({ clienteId }: Props) {
    return (
        <div className="space-y-6 fade-up visible">
            <h3 className="text-xl font-barlow-condensed font-black uppercase text-blanco mb-6 tracking-tight">
                Estado de Cuenta & Finanzas
            </h3>

            {/* Aviso Temporal */}
            <div className="bg-naranja/10 border border-naranja/30 p-6 rounded-2xl flex items-start gap-4">
                <Info size={24} className="text-naranja flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-naranja mb-2">
                        Próximamente
                    </h4>
                    <p className="text-xs text-gris font-medium leading-relaxed max-w-2xl">
                        Este módulo listará tabularmente los recibos de cobro abonados por este usuario conectados directamente a su Plan Asignado actual, calculando las fechas de vencimiento.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl flex gap-4 shadow-lg">
                    <Receipt size={24} className="text-naranja" />
                    <div className="flex-1">
                        <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block">Cobros Realizados</span>
                        <div className="text-2xl font-barlow-condensed font-black text-blanco mt-1">0</div>
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl flex gap-4 shadow-lg">
                    <CreditCard size={24} className="text-verde" />
                    <div className="flex-1">
                        <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block">Último Pago</span>
                        <div className="text-2xl font-barlow-condensed font-black text-blanco mt-1">--</div>
                    </div>
                </div>
            </div>
            <span className="hidden">{clienteId}</span>
        </div>
    );
}
