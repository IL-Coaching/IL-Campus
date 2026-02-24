import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ClienteTabs from "./componentes/ClienteTabs";

export default async function PerfilClientePage({ params }: { params: { id: string } }) {
    const cliente = await ClienteServicio.obtenerPorId(params.id);

    if (!cliente) {
        notFound();
    }

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link
                    href="/entrenador/clientes"
                    className="p-2 bg-marino-2 border border-marino-4 rounded-lg text-gris hover:text-blanco transition-colors"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <p className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em]">Expediente de Entrenado</p>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco">
                        {cliente.nombre}
                    </h1>
                </div>
            </div>

            {/* Administrador de Pestañas (ArchSecure UI) */}
            <ClienteTabs cliente={cliente} />
        </div>
    );
}
