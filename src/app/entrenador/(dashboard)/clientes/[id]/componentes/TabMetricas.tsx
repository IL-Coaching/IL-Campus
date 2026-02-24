"use client";

import { Activity, Dumbbell, Calendar, Info } from "lucide-react";

interface Props {
    clienteId: string;
}

export default function TabMetricas({ clienteId }: Props) {
    return (
        <div className="space-y-6 fade-up visible">
            <h3 className="text-xl font-barlow-condensed font-black uppercase text-blanco mb-6 tracking-tight">
                Tablero de Métricas (Check-ins & Resumen)
            </h3>

            {/* Aviso Temporal */}
            <div className="bg-naranja/10 border border-naranja/30 p-6 rounded-2xl flex items-start gap-4">
                <Info size={24} className="text-naranja flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-naranja mb-2">
                        Módulo en Construcción
                    </h4>
                    <p className="text-xs text-gris font-medium leading-relaxed max-w-2xl">
                        Este apartado cruzará automáticamente el peso corporal, las respuestas de check-ins periódicos y las métricas de adherencia de todas las sesiones registradas por el entrenado para emitir gráficos de progresión.
                    </p>
                </div>
            </div>

            {/* Banners Ficticios para mostrar el Layout futuro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg relative overflow-hidden group">
                    <div className="w-12 h-12 bg-marino-3 border border-marino-4 rounded-full mx-auto flex items-center justify-center text-gris mb-4 group-hover:scale-110 transition-transform">
                        <Activity size={20} />
                    </div>
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Adherencia Global</span>
                    <span className="text-3xl font-barlow-condensed font-black text-blanco">--%</span>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg relative overflow-hidden group">
                    <div className="w-12 h-12 bg-marino-3 border border-marino-4 rounded-full mx-auto flex items-center justify-center text-gris mb-4 group-hover:scale-110 transition-transform">
                        <Dumbbell size={20} />
                    </div>
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Tonelaje Promedio</span>
                    <span className="text-3xl font-barlow-condensed font-black text-blanco">-- kg</span>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl text-center shadow-lg relative overflow-hidden group">
                    <div className="w-12 h-12 bg-marino-3 border border-marino-4 rounded-full mx-auto flex items-center justify-center text-gris mb-4 group-hover:scale-110 transition-transform">
                        <Calendar size={20} />
                    </div>
                    <span className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] block mb-2">Último Check-in</span>
                    <span className="text-xl font-barlow-condensed font-black text-blanco">Pendiente</span>
                </div>
            </div>
            {/* Ocultamos el clienteId sólo para evitar warning de no uso hasta que llamemos al servidor */}
            <span className="hidden">{clienteId}</span>
        </div>
    );
}
