import { obtenerResumenFinanciero } from "@/nucleo/acciones/finanzas.accion";
import TabFinanzasClient, { ResumenFinanciero } from "./TabFinanzasClient";

interface Props {
    clienteId: string;
    clienteNombre: string;
}

export default async function TabFinanzas({ clienteId, clienteNombre }: Props) {
    // SSR
    const data = await obtenerResumenFinanciero(clienteId);

    // Inject the result from server into client component
    return <TabFinanzasClient clienteId={clienteId} clienteNombre={clienteNombre} resumen={data as ResumenFinanciero | null} />;
}
