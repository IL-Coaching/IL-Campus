"use client"
import { useState } from "react";
import { X, Trash2, FileText, ExternalLink, CalendarDays, History, Hourglass } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { anularCobro } from "@/nucleo/acciones/cobro.accion";

interface Cobro {
    id: string;
    fecha: Date;
    montoArs: number;
    metodo: string;
    periodoDesde: Date;
    periodoHasta: Date;
    comprobanteUrl: string | null;
}

interface PlanAsignado {
    id: string;
    fechaInicio: Date;
    fechaVencimiento: Date;
    estado: string;
    plan: { nombre: string; };
}

interface Props {
    clienteNombre: string;
    planes: PlanAsignado[];
    cobros: Cobro[];
    onClose: () => void;
}

export default function ModalCobrosHistorial({ clienteNombre, planes, cobros, onClose }: Props) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const hoy = new Date();

    const handleAnular = async (id: string) => {
        if (confirm("¿Estás seguro de anular y eliminar este cobro permentemente?")) {
            setIsDeleting(id);
            const res = await anularCobro(id);
            setIsDeleting(null);
            if (res.error) {
                alert(res.error);
            } else {
                onClose(); // Cerrar y refrescar
            }
        }
    };

    // Identificar el estado de cada plan en relación a hoy
    const clasificarPlan = (p: PlanAsignado) => {
        const inicio = new Date(p.fechaInicio);
        const fin = new Date(p.fechaVencimiento);

        if (inicio > hoy) return { tipo: "FUTURO", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/30", icon: <Hourglass size={14} /> };
        if (fin < hoy && p.estado !== "ACTIVO") return { tipo: "PASADO", color: "text-gris", bg: "bg-marino-3", border: "border-marino-4", icon: <History size={14} /> };
        return { tipo: "ACTUAL", color: "text-verde", bg: "bg-verde/10", border: "border-verde/30", icon: <CalendarDays size={14} /> };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-marino-4 flex justify-between items-start bg-marino-3/50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1 flex items-center gap-3">
                            <FileText className="text-naranja" /> Estado de Cuenta
                        </h2>
                        <p className="text-naranja text-xs font-black uppercase tracking-[0.2em]">
                            Cliente: {clienteNombre}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco bg-marino-4/30 hover:bg-rojo/20 rounded-full transition-colors p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

                        {/* Columna Izquierda: Linea de Tiempo de Suscripciones */}
                        <div className="space-y-4 flex flex-col">
                            <h3 className="text-[0.65rem] font-black text-gris uppercase tracking-[0.2em] border-b border-marino-4 pb-2">Línea de Tiempo de Suscripciones</h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                {planes.length === 0 ? (
                                    <p className="text-gris text-center italic text-sm py-8">No hay planes registrados.</p>
                                ) : (
                                    planes.map((plan) => {
                                        const clase = clasificarPlan(plan);
                                        return (
                                            <div key={plan.id} className={`flex gap-4 p-4 rounded-2xl border ${clase.bg} ${clase.border} transition-all`}>
                                                <div className={`mt-1 ${clase.color}`}>
                                                    {clase.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${clase.color}`}>{clase.tipo}</span>
                                                            <h4 className="font-barlow-condensed font-black text-blanco tracking-wide text-lg leading-tight uppercase italic">{plan.plan.nombre}</h4>
                                                        </div>
                                                        <span className="text-[10px] text-gris bg-marino-4/50 px-2 py-1 rounded font-bold uppercase">{plan.estado}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-4 text-[10px] text-gris/80 uppercase font-black tracking-widest">
                                                        <div className="flex flex-col">
                                                            <span>Inicio</span>
                                                            <span className="text-blanco">{format(new Date(plan.fechaInicio), "dd MMM yyyy", { locale: es })}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span>Fin / Renueva</span>
                                                            <span className="text-blanco">{format(new Date(plan.fechaVencimiento), "dd MMM yyyy", { locale: es })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha: Historial Físico de Pagos */}
                        <div className="space-y-4 flex flex-col">
                            <h3 className="text-[0.65rem] font-black text-gris uppercase tracking-[0.2em] border-b border-marino-4 pb-2">Historial de Pagos Efectuados</h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {cobros.length === 0 ? (
                                    <p className="text-gris text-center italic text-sm py-8 border border-dashed border-marino-4 rounded-2xl">Aún no hay registros de cobros efectuados.</p>
                                ) : (
                                    cobros.map((cobro) => (
                                        <div key={cobro.id} className="bg-marino border border-marino-4 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-marino-4/80 transition-all group">
                                            <div>
                                                <h4 className="font-barlow-condensed font-black text-verde text-2xl tracking-tight">+ ${cobro.montoArs.toLocaleString('es-AR')}</h4>
                                                <p className="text-xs text-gris mt-0.5"><span className="text-naranja uppercase font-black tracking-widest text-[9px] bg-naranja/10 px-1.5 py-0.5 rounded mr-1.5">{cobro.metodo}</span> {format(new Date(cobro.fecha), "dd MMM yyyy HH:mm", { locale: es })}</p>
                                                <p className="text-[10px] text-gris/60 mt-1 font-medium">Cubre del {format(new Date(cobro.periodoDesde), "dd/MM/yyyy")} al {format(new Date(cobro.periodoHasta), "dd/MM/yyyy")}</p>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                {cobro.comprobanteUrl ? (
                                                    <a href={cobro.comprobanteUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-marino-3 hover:bg-marino-4 text-blanco px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all">
                                                        <FileText size={12} className="text-[#3B82F6]" /> Recibo <ExternalLink size={10} className="opacity-50" />
                                                    </a>
                                                ) : (
                                                    <span className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-marino border border-marino-4 text-gris/50 px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black cursor-not-allowed">
                                                        Sin Archivo
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleAnular(cobro.id)}
                                                    disabled={isDeleting === cobro.id}
                                                    className="bg-rojo/5 hover:bg-rojo/20 text-rojo p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Anular y borrar pago"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
