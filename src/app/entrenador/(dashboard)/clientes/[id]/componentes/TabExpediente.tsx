"use client";

import { ClientePlanificacion } from "@/nucleo/tipos/planificacion.tipos";
import DetallesFormulario from "../DetallesFormulario";
import { History, ShieldAlert } from "lucide-react";

interface Props {
    cliente: ClientePlanificacion;
}

export default function TabExpediente({ cliente }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up visible">
            {/* Columna Izquierda: Auditoría / History */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 border-b border-marino-4 pb-4">
                        <History size={20} className="text-naranja" />
                        <h3 className="text-sm font-black text-blanco uppercase tracking-widest">
                            Registro Biométrico
                        </h3>
                    </div>

                    <div className="p-4 bg-marino-3 border border-marino-4 rounded-xl text-center space-y-3">
                        <ShieldAlert size={24} className="mx-auto text-gris" />
                        <p className="text-xs text-gris font-medium">
                            El historial médico de los entrenados es inmutable por cuestiones de seguridad.
                        </p>
                        <p className="text-[0.6rem] text-rojo font-black uppercase tracking-widest bg-rojo/10 px-2 py-1 rounded">
                            Historial Próximamente
                        </p>
                    </div>

                    {/* Placeholder Auditoría */}
                    <div className="mt-8 relative pl-4 border-l-2 border-marino-4 space-y-6">
                        <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-naranja rounded-full border border-marino-4"></span>
                            <span className="text-[0.6rem] text-gris uppercase font-bold tracking-widest block mb-1">
                                {new Date(cliente.fechaAlta).toLocaleDateString()}
                            </span>
                            <p className="text-xs text-blanco font-medium">Alta Médica y Deportiva</p>
                            <p className="text-[0.6rem] text-gris mt-1">Formulario de registro cargado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Detalles Base */}
            <div className="lg:col-span-2 space-y-6">
                <DetallesFormulario cliente={cliente} />
            </div>
        </div>
    );
}
