"use client"
import { useState } from "react";
import { X, Trash2, FileText, ExternalLink } from "lucide-react";
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

interface Props {
    clienteNombre: string;
    cobros: Cobro[];
    onClose: () => void;
}

export default function ModalCobrosHistorial({ clienteNombre, cobros, onClose }: Props) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-marino-2 border border-marino-4 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-marino-4 flex justify-between items-start bg-marino-3/50">
                    <div>
                        <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                            Historial de Pagos
                        </h2>
                        <p className="text-naranja text-[10px] font-black uppercase tracking-[0.2em]">
                            Atleta: {clienteNombre}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {cobros.length === 0 ? (
                        <p className="text-gris text-center italic text-sm py-8">No hay registros de cobros asociados a este plan en este ciclo.</p>
                    ) : (
                        cobros.map((cobro) => (
                            <div key={cobro.id} className="bg-marino border border-marino-4 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div>
                                    <h4 className="font-barlow-condensed font-black text-blanco text-xl">${cobro.montoArs.toLocaleString('es-AR')}</h4>
                                    <p className="text-xs text-gris mt-1 line-clamp-1"><span className="text-naranja uppercase font-bold text-[10px] tracking-widest">{cobro.metodo}</span> • {format(new Date(cobro.fecha), "dd MMM yyyy HH:mm", { locale: es })}</p>
                                    <p className="text-[10px] text-gris mt-0.5">Cubre: {format(new Date(cobro.periodoDesde), "dd/MM")} al {format(new Date(cobro.periodoHasta), "dd/MM")}</p>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    {cobro.comprobanteUrl ? (
                                        <a href={cobro.comprobanteUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-marino-3 hover:bg-marino-4 text-blanco px-4 py-2 rounded text-xs uppercase tracking-widest font-bold transition-all">
                                            <FileText size={14} className="text-[#3B82F6]" /> Ver Recibo <ExternalLink size={12} className="opacity-50" />
                                        </a>
                                    ) : (
                                        <span className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-marino border border-marino-4 text-gris px-4 py-2 rounded text-[10px] uppercase tracking-widest font-bold opacity-50 cursor-not-allowed">
                                            Sin Archivo
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleAnular(cobro.id)}
                                        disabled={isDeleting === cobro.id}
                                        className="bg-rojo/10 hover:bg-rojo text-rojo hover:text-blanco p-2 rounded transition-all"
                                        title="Anular y borrar pago"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
