import { obtenerBitacoraCliente } from "@/nucleo/acciones/bitacora.accion";
import TabBitacoraClient from "./TabBitacoraClient";
import { Archive } from "lucide-react";

interface Props {
    clienteId: string;
}

export default async function TabBitacora({ clienteId }: Props) {
    // Fetch desde servidor de la bitácora completa
    const res = await obtenerBitacoraCliente(clienteId);

    if (!res.exito || !res.macrociclos) {
        return (
            <div className="bg-marino-2 border border-marino-4 p-12 rounded-3xl text-center fade-in duration-500">
                <Archive size={40} className="text-marino-4 mx-auto mb-4 opacity-50" />
                <h3 className="text-blanco font-barlow-condensed font-black uppercase text-xl mb-2">Sin Historial Disponible</h3>
                <p className="text-gris text-sm max-w-sm mx-auto">No se pudo recuperar la bitácora de entrenamientos de este cliente.</p>
            </div>
        );
    }

    return <TabBitacoraClient macrociclos={res.macrociclos} />;
}
