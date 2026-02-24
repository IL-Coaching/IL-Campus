export const dynamic = 'force-dynamic';

import { obtenerPlanes } from "@/nucleo/acciones/plan.accion";
import GestionPlanes from "./componentes/GestionPlanes";
import { Dumbbell } from "lucide-react";

export default async function PlanesPage() {
    const res = await obtenerPlanes();

    if (!res.exito || !res.planes) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-rojo font-bold">Error al cargar los planes.</p>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planesData = res.planes as any[];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 fade-up visible">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-marino-4 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-bold text-naranja uppercase tracking-widest">
                            Catálogo y Suscripciones
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-barlow-condensed font-black uppercase tracking-tight text-blanco leading-none">
                        Gestión de <span className="text-naranja">Planes</span>
                    </h1>
                    <p className="text-gris font-medium text-sm mt-1 max-w-xl flex items-center gap-2">
                        <Dumbbell size={14} className="text-naranja" /> Control total sobre tu oferta de servicios
                    </p>
                </div>
            </div>

            {/* Panel Principal */}
            <GestionPlanes planesIniciales={planesData} />
        </div>
    );
}
