"use client";

import { Dumbbell, TrendingUp } from "lucide-react";

interface FuerzaRecord {
    id: string;
    modalidadTesteo: string;
    unRM: number;
    p80_7: number;
    p70_3: number;
    ejercicio: { nombre: string; musculoPrincipal: string };
}

interface Props {
    records: FuerzaRecord[];
}

export default function MetricasFuerzaClient({ records }: Props) {
    if (records.length === 0) {
        return (
            <div className="bg-marino-2 border border-marino-4 p-8 rounded-3xl text-center">
                <Dumbbell size={32} className="text-marino-4 mx-auto mb-3" />
                <h3 className="text-blanco font-barlow-condensed font-black uppercase text-lg">Sin Testeos de Fuerza</h3>
                <p className="text-gris text-xs mt-1">El cliente aún no ha registrado testeos de 1RM.</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 p-8 rounded-3xl mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-naranja/10 border border-naranja/20 rounded-2xl">
                    <TrendingUp className="text-naranja" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-barlow-condensed font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro leading-none">
                        Fuerza Máxima (1RM Estimado)
                    </h3>
                    <p className="text-xs text-gris font-medium mt-1">
                        Últimos registros de testeos directos e indirectos
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record) => (
                    <div key={record.id} className="bg-marino-3/50 border border-marino-4 rounded-2xl p-5 hover:border-naranja/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[0.6rem] font-bold text-naranja uppercase tracking-widest">{record.ejercicio.musculoPrincipal}</span>
                                <h4 className="text-sm font-black text-blanco uppercase leading-tight mt-1">{record.ejercicio.nombre}</h4>
                            </div>
                            <span className="px-2 py-1 bg-marino-4 text-[0.6rem] font-bold text-gris rounded-md uppercase tracking-widest">
                                {record.modalidadTesteo}
                            </span>
                        </div>

                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-barlow-condensed font-black text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro leading-none">
                                {Math.round(record.unRM)}
                            </span>
                            <span className="text-xs font-bold text-gris uppercase mb-1">KG</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-marino-4 flex justify-between text-[0.65rem] font-bold text-gris">
                            <span>80% = {Math.round(record.p80_7)}kg</span>
                            <span>70% = {Math.round(record.p70_3)}kg</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
