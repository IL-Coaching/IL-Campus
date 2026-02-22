import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    MessageCircle,
    ChevronLeft
} from "lucide-react";
import DetallesFormulario from "./DetallesFormulario";

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
                    <p className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em]">Expediente de Atleta</p>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco">
                        {cliente.nombre}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Información y Estado */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 shadow-xl">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-marino-4 mb-6">
                            <div className="w-24 h-24 bg-marino-3 rounded-full flex items-center justify-center border-2 border-naranja/30 mb-4 text-4xl font-barlow-condensed font-black text-naranja">
                                {cliente.nombre.charAt(0)}
                            </div>
                            <h3 className="text-xl font-bold text-blanco leading-none">{cliente.nombre}</h3>
                            <p className="text-gris text-sm mt-1">{cliente.email}</p>
                            <div className="mt-4 flex gap-2">
                                {cliente.activo && (
                                    <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                        Activo
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-marino-3 text-gris border border-marino-4 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                    {cliente.plan || "Sin Plan"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gris flex items-center gap-2"><Calendar size={14} /> Fecha Alta</span>
                                <span className="text-blanco font-medium">{new Date(cliente.fechaAlta).toLocaleDateString('es-AR')}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <Link
                                href={`/entrenador/clientes/${cliente.id}/planificacion`}
                                className="w-full bg-naranja hover:bg-naranja-h text-marino font-black py-3 rounded-xl uppercase tracking-widest font-barlow-condensed text-sm transition-all shadow-lg shadow-naranja/10 text-center block"
                            >
                                Asignar Nueva Rutina
                            </Link>
                            <Link
                                href="/entrenador/mensajes"
                                className="w-full bg-marino-3 border border-marino-4 text-blanco font-bold py-3 rounded-xl uppercase tracking-widest font-barlow-condensed text-xs hover:bg-marino-4 transition-all flex items-center justify-center gap-2 text-center"
                            >
                                <MessageCircle size={14} /> Enviar Mensaje
                            </Link>
                        </div>
                    </div>

                    {/* Notas Rápidas */}
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6">
                        <h4 className="text-[0.6rem] font-black text-gris uppercase tracking-[0.2em] mb-4">Notas Internas</h4>
                        <div className="bg-marino p-4 rounded-xl border border-marino-4 text-sm text-gris-claro leading-relaxed italic">
                            {cliente.notas || "Sin notas adicionales del entrenador."}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Detalles del Formulario */}
                <div className="lg:col-span-2 space-y-6">
                    <DetallesFormulario cliente={cliente} />
                </div>
            </div>
        </div>
    );
}
