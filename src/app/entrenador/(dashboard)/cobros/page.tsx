import { CreditCard, TrendingUp, DollarSign, History } from "lucide-react";
import { CobroServicio } from "@/nucleo/servicios/cobro.servicio";

export default async function CobrosPage() {
    const estadisticas = await CobroServicio.obtenerEstadisticasMensuales();
    const pendientes = await CobroServicio.obtenerPendientes();
    const ultimosCobros = await CobroServicio.obtenerUltimosCobros();

    const formatMoneda = (valor: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(valor);
    };

    return (
        <div className="space-y-8 fade-up visible">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Control de Cobros
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Seguimiento financiero de tus planes activos
                    </p>
                </div>
                <button className="bg-marino-3 hover:bg-marino-4 border border-marino-4 transition-all text-blanco font-bold px-6 py-2.5 rounded-lg uppercase tracking-widest font-barlow-condensed text-xs flex items-center gap-2">
                    <History size={14} /> Historial Completo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={60} />
                    </div>
                    <p className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-2">Total Recaudado Mes</p>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">
                        {formatMoneda(estadisticas.totalMes)}
                    </p>
                    <div className="flex items-center gap-1 text-gris text-[0.6rem] font-bold mt-2 uppercase tracking-widest">
                        {estadisticas.cantidadCobros} transacciones registradas
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-gris mb-3">
                        <CreditCard size={14} className="text-[#EAB308]" />
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest">Próximos Vencimientos</p>
                    </div>
                    <p className="text-3xl font-barlow-condensed font-black text-blanco">{pendientes.length}</p>
                    <p className="text-xs text-gris italic mt-1 font-medium">
                        {pendientes.length > 0
                            ? pendientes.map(p => p.clienteNombre).join(", ")
                            : "Al día con todos los planes"}
                    </p>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-gris mb-3">
                        <DollarSign size={14} className="text-[#22C55E]" />
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest">Ticket Promedio</p>
                    </div>
                    <p className="text-3xl font-barlow-condensed font-black text-blanco">
                        {formatMoneda(estadisticas.ticketPromedio)}
                    </p>
                </div>
            </div>

            <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-marino-4">
                    <h3 className="font-barlow-condensed font-black uppercase text-sm tracking-widest text-blanco flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-naranja"></div>
                        Últimos Registros
                    </h3>
                </div>
                {ultimosCobros.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <p className="text-gris font-medium text-sm italic">No se han registrado cobros recientemente.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-marino-3/50 text-[0.65rem] font-black uppercase tracking-widest text-gris">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Método</th>
                                    <th className="px-6 py-4">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-marino-4/50">
                                {ultimosCobros.map((cobro) => (
                                    <tr key={cobro.id} className="hover:bg-marino-3/30 transition-colors">
                                        <td className="px-6 py-4 text-xs text-gris-claro">
                                            {new Date(cobro.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-blanco">{cobro.cliente.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4 text-[0.65rem] font-black uppercase text-naranja">
                                            {cobro.metodo}
                                        </td>
                                        <td className="px-6 py-4 font-barlow-condensed font-black text-blanco">
                                            {formatMoneda(cobro.montoArs)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

