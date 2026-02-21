import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    Dumbbell,
    MessageCircle,
    CreditCard,
    ChevronLeft,
    TrendingUp,
    Clock,
    Activity
} from "lucide-react";

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
                                <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                    Activo
                                </span>
                                <span className="px-3 py-1 bg-marino-3 text-gris border border-marino-4 rounded text-[0.6rem] font-bold uppercase tracking-widest">
                                    Plan Elite
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gris flex items-center gap-2"><Calendar size={14} /> Fecha Alta</span>
                                <span className="text-blanco font-medium">{new Date(cliente.fechaAlta).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gris flex items-center gap-2"><CreditCard size={14} /> Último Pago</span>
                                <span className="text-[#22C55E] font-bold">Al día</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gris flex items-center gap-2"><Clock size={14} /> Próximo Venc.</span>
                                <span className="text-blanco font-medium">15 de Marzo</span>
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

                {/* Columna Derecha: Progresos y Planificación */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats de Rendimiento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-naranja/10 rounded-lg text-naranja">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-bold text-gris uppercase tracking-widest">Peso Actual</p>
                                <p className="text-2xl font-black text-blanco">-- <span className="text-xs font-normal">kg</span></p>
                            </div>
                        </div>
                        <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-[#EAB308]/10 rounded-lg text-[#EAB308]">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[0.6rem] font-bold text-gris uppercase tracking-widest">Cumplimiento</p>
                                <p className="text-2xl font-black text-blanco">0%</p>
                            </div>
                        </div>
                    </div>

                    {/* Rutina Actual */}
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                            <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                                <Dumbbell size={16} className="text-naranja" />
                                Planificación Actual
                            </h3>
                            <Link href={`/entrenador/clientes/${cliente.id}/planificacion`} className="text-[0.6rem] font-black text-naranja uppercase tracking-widest hover:underline">Gestionar Entrenamiento</Link>
                        </div>
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <Dumbbell size={48} className="text-marino-4 mb-4" />
                            <p className="text-gris italic text-sm">Este atleta aún no tiene rutinas asignadas para el ciclo actual.</p>
                            <Link
                                href={`/entrenador/clientes/${cliente.id}/planificacion`}
                                className="mt-6 text-xs text-naranja border border-naranja/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-naranja/5 transition-all text-center"
                            >
                                Crear primer Microciclo
                            </Link>
                        </div>
                    </div>

                    {/* Historial de Check-ins */}
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                            <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                                <Activity size={16} className="text-[#22C55E]" />
                                Historial de Reportes
                            </h3>
                        </div>
                        <div className="p-8 text-center text-gris italic text-sm">
                            No hay check-ins registrados todavía.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
