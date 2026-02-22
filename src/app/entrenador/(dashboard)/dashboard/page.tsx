import { Users, TrendingUp, CalendarSearch, BellRing, ChevronRight, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { obtenerMetricasDashboard } from "@/nucleo/acciones/dashboard.accion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
    const data = await obtenerMetricasDashboard();

    if (!data) {
        return <div className="p-8 text-center text-rojo">Error cargando el dashboard. Asegúrate de tener conexión.</div>;
    }

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Dashboard Central
                </h1>
                <p className="text-gris font-medium text-sm">
                    Métricas en tiempo real y flujo de operaciones
                </p>
            </div>

            {/* Resumen Principal (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Clientes Activos */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <Users size={18} className="text-naranja" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Atletas en Sistema</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">{data.totalActivos}</p>
                    <p className="text-xs text-[#22C55E] font-medium mt-1">↑ +{data.nuevosMes} altas este mes</p>
                </div>

                {/* KPI 2: Ingresos Mes */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <TrendingUp size={18} className="text-naranja" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Caja del Mes</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">
                        <span className="text-lg text-gris">$</span>
                        {data.ingresosMes.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-gris font-medium mt-1">Ingresos fiscales registrados</p>
                </div>

                {/* KPI 3: Check-ins */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <CalendarSearch size={18} className="text-[#EAB308]" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Evaluaciones Fin Sem.</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">{data.checkinsPendientes}</p>
                    <p className="text-xs text-gris font-medium mt-1">Nuevos check-ins cargados</p>
                </div>

                {/* KPI 4: Alertas */}
                <div className={`bg-marino-2 border p-5 rounded-xl shadow-lg ${data.alertasOperativas > 0 ? 'border-l-4 border-l-[#EF4444] border-t-marino-4 border-r-marino-4 border-b-marino-4' : 'border-marino-4 hover:border-naranja/50 transition-colors'}`}>
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <BellRing size={18} className={data.alertasOperativas > 0 ? 'text-[#EF4444] animate-pulse' : 'text-gris'} />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Tareas Operativas</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">{data.alertasOperativas}</p>
                    <p className="text-xs text-gris font-medium mt-1">{data.alertasOperativas > 0 ? 'Requieren tu atención' : 'Mesa limpia'}</p>
                </div>
            </div>

            {/* Grid Secundario de Vistas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alertas Detalle */}
                <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-96 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                            <AlertCircle size={14} className="text-naranja" /> Radar Operativo
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {data.alertasOperativas === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                                <p className="text-gris italic text-sm">No tenés tareas urgentes pendientes.</p>
                                <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mt-2">Punto de equilibrio</p>
                            </div>
                        ) : (
                            <>
                                {data.detallesAlertas.sinPlan.map((c) => (
                                    <div key={c.id} className="bg-marino-3/50 border border-marino-4 p-3 rounded-lg flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-bold text-blanco">{c.nombre}</p>
                                            <p className="text-[10px] text-[#EF4444] font-black uppercase tracking-wider">Esperando Asignación de Plan</p>
                                        </div>
                                        <Link href={`/entrenador/clientes`} className="w-8 h-8 rounded-full bg-marino-4 flex items-center justify-center text-gris group-hover:bg-naranja group-hover:text-marino transition-colors">
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                ))}

                                {data.detallesAlertas.vencidos.map((p) => (
                                    <div key={p.id} className="bg-marino-3/50 border border-marino-4 p-3 rounded-lg flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-bold text-blanco">{p.cliente.nombre}</p>
                                            <p className="text-[10px] text-[#EAB308] font-black uppercase tracking-wider">Membresía Vencida</p>
                                        </div>
                                        <Link href={`/entrenador/finanzas`} className="w-8 h-8 rounded-full bg-marino-4 flex items-center justify-center text-gris group-hover:bg-naranja group-hover:text-marino transition-colors">
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-96 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                            <Clock size={14} className="text-naranja" /> Bitácora de Sistema
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {data.actividadReciente.length === 0 ? (
                            <div className="flex gap-4 items-start opacity-50">
                                <div className="text-xs text-gris font-medium whitespace-nowrap w-16 pt-0.5">Hoy</div>
                                <div className="relative">
                                    <div className="w-2 h-2 bg-marino-4 rounded-full mt-1 z-10 relative"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blanco italic">Sistema en reposo, esperando interacciones.</p>
                                </div>
                            </div>
                        ) : (
                            data.actividadReciente.map((act, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="text-[10px] text-gris font-bold uppercase tracking-wider whitespace-nowrap w-20 pt-1 text-right">
                                        {format(act.fecha, "dd MMM HH:mm", { locale: es })}
                                    </div>
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full mt-1 z-10 relative 
                                            ${act.tipo === 'cobro' ? 'bg-[#22C55E]' :
                                                act.tipo === 'alerta' ? 'bg-[#EF4444]' :
                                                    'bg-[#EAB308]'
                                            }`}></div>
                                        {i !== data.actividadReciente.length - 1 && (
                                            <div className="w-px h-full bg-marino-4 absolute top-4 bottom-0"></div>
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-xs font-medium text-blanco mt-0.5 leading-snug">{act.texto}</p>
                                        <span className="text-[9px] uppercase font-black tracking-widest text-gris">{act.tipo}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
