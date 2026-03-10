import { obtenerResumenMetricasCliente, obtenerFuerzaMaximaCliente } from "@/nucleo/acciones/metricas.accion";
import TabMetricasClient, { ResumenMetricasData, FuerzaRecord } from "./TabMetricasClient";
import { Zap } from "lucide-react";

interface Props {
    clienteId: string;
}

export default async function TabMetricas({ clienteId }: Props) {
    // Fetch paralelo en el servidor de todas las métricas. SSR total.
    const [resMetricas, resFuerza] = await Promise.all([
        obtenerResumenMetricasCliente(clienteId),
        obtenerFuerzaMaximaCliente(clienteId)
    ]);

    if (!resMetricas.exito || !resMetricas.datos) {
        return (
            <div className="bg-marino-2 border border-marino-4 p-12 rounded-3xl text-center">
                <Zap size={40} className="text-marino-4 mx-auto mb-4" />
                <h3 className="text-blanco font-barlow-condensed font-black uppercase text-xl mb-2">Sin datos suficientes</h3>
                <p className="text-gris text-sm max-w-sm mx-auto">No se pudieron recuperar las métricas del cliente.</p>
            </div>
        );
    }

    const datos = resMetricas.datos as ResumenMetricasData;
    const registrosFuerza = (resFuerza.exito && resFuerza.datos) ? (resFuerza.datos as FuerzaRecord[]) : [];

    return <TabMetricasClient datos={datos} registrosFuerza={registrosFuerza} />;
}
