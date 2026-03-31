import { obtenerResumenFinanciero } from "@/nucleo/acciones/finanzas.accion";
import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import TabFinanzasClient, { ResumenFinanciero } from "./TabFinanzasClient";

interface Props {
    clienteId: string;
    clienteNombre: string;
}

export default async function TabFinanzas({ clienteId, clienteNombre }: Props) {
    const [data, cliente] = await Promise.all([
        obtenerResumenFinanciero(clienteId),
        ClienteServicio.obtenerPorId(clienteId)
    ]);

    return <TabFinanzasClient clienteId={clienteId} clienteNombre={clienteNombre} resumen={data as ResumenFinanciero | null} esVIP={cliente?.esVIP || false} />;
}
