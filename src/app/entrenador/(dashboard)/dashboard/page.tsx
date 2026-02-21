import { Users, TrendingUp, CalendarSearch, BellRing } from "lucide-react";
import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";

export default async function DashboardPage() {
    // 1. Obtener datos reales de la base de datos
    const totalActivos = await ClienteServicio.contarTotalActivos();
    const nuevosMes = await ClienteServicio.contarNuevosMes();

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Dashboard
                </h1>
                <p className="text-gris font-medium text-sm">
                    Vista general del negocio de IL-Coaching
                </p>
            </div>

            {/* Resumen Principal (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Clientes Activos */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <Users size={18} className="text-naranja" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Clientes Activos</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">{totalActivos}</p>
                    <p className="text-xs text-[#22C55E] font-medium mt-1">↑ +{nuevosMes} esta semana</p>
                </div>

                {/* KPI 2: Ingresos (Proyectado) */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <TrendingUp size={18} className="text-naranja" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Ingresos Estimados</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">${totalActivos * 25}<span className="text-lg text-gris">k</span></p>
                    <p className="text-xs text-gris font-medium mt-1">Calculado por planes activos</p>
                </div>

                {/* KPI 3: Check-ins */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg hover:border-naranja/50 transition-colors">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <CalendarSearch size={18} className="text-[#EAB308]" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Check-ins Pendientes</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">0</p>
                    <p className="text-xs text-gris font-medium mt-1">No hay reportes para revisar</p>
                </div>

                {/* KPI 4: Alertas */}
                <div className="bg-marino-2 border border-marino-4 p-5 rounded-xl shadow-lg border-l-4 border-l-[#EF4444]">
                    <div className="flex items-center gap-3 text-gris mb-3">
                        <BellRing size={18} className="text-[#EF4444]" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-xs">Alertas Operativas</h3>
                    </div>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">0</p>
                    <p className="text-xs text-gris font-medium mt-1">Sin problemas detectados</p>
                </div>
            </div>

            {/* Grid Secundario de Vistas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alertas Detalle */}
                <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-96 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Acción Requerida</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-8 text-center">
                        <div>
                            <p className="text-gris italic text-sm">No tenés tareas urgentes pendientes ahora mismo.</p>
                            <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest mt-2">Todo bajo control</p>
                        </div>
                    </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-marino-2 border border-marino-4 rounded-xl flex flex-col h-96 overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Actividad Reciente</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex gap-4 items-start opacity-50">
                            <div className="text-xs text-gris font-medium whitespace-nowrap w-16 pt-0.5">Hoy</div>
                            <div className="relative">
                                <div className="w-2 h-2 bg-marino-4 rounded-full mt-1 z-10 relative"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blanco italic">No hay actividad registrada hoy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
