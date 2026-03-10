export const dynamic = 'force-dynamic';

import {
    Users,
    TrendingUp,
    CalendarCheck,
    Clock,
    FileText,
    MessageCircle
} from "lucide-react";
import { obtenerMetricasDashboard } from "@/nucleo/acciones/dashboard.accion";
import PanelNotificaciones from "./componentes/PanelNotificaciones";
import PanelNotas from "./componentes/PanelNotas";

export default async function DashboardPage() {
    const data = await obtenerMetricasDashboard();

    if (!data) {
        return <div className="p-8 text-center text-rojo">Error cargando el dashboard. Asegúrate de tener conexión.</div>;
    }

    const kpis = [
        {
            label: "Checks-in en espera",
            valor: data.checkinsEnEspera,
            subtexto: "Pendientes de revisión",
            icono: CalendarCheck,
            colorIcono: "text-[#EAB308]"
        },
        {
            label: "Planes por vencer",
            valor: data.planesPorVencer,
            subtexto: "Próximos 7 días",
            icono: Clock,
            colorIcono: data.planesPorVencer > 0 ? "text-[#EF4444]" : "text-gris"
        },
        {
            label: "Clientes Activos",
            valor: data.totalActivos,
            subtexto: "Total en sistema",
            icono: Users,
            colorIcono: "text-naranja"
        },
        {
            label: "Flujo de Caja Mensual",
            valor: `$${data.flujoCajaMensual.toLocaleString('es-AR')}`,
            subtexto: "Ingresos del mes",
            icono: TrendingUp,
            colorIcono: "text-[#22C55E]"
        },
        {
            label: "Formularios en espera",
            valor: data.formulariosEnEspera,
            subtexto: "Nuevos prospectos",
            icono: FileText,
            colorIcono: "text-naranja"
        },
        {
            label: "Mensajes",
            valor: data.mensajesNoLeidos,
            subtexto: "No leídos",
            icono: MessageCircle,
            colorIcono: "text-naranja"
        }
    ];

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blanco to-gris-claro mb-1">
                    Dashboard Central
                </h1>
                <p className="text-gris font-medium text-sm">
                    Métricas en tiempo real y flujo de operaciones
                </p>
            </div>

            {/* KPIs Grid — 6 cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 p-5 rounded-2xl shadow-xl hover:-translate-y-1 hover:border-marino-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between"
                    >
                        <div className="flex items-center gap-2 text-gris mb-2">
                            <kpi.icono size={16} className={kpi.colorIcono} />
                            <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-[0.55rem] leading-tight">
                                {kpi.label}
                            </h3>
                        </div>
                        <p className="text-3xl font-barlow-condensed font-black text-blanco">{kpi.valor}</p>
                        <p className="text-[0.6rem] text-gris font-medium mt-1 uppercase tracking-wider">{kpi.subtexto}</p>
                    </div>
                ))}
            </div>

            {/* Paneles principales: Notificaciones + Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PanelNotificaciones />
                <PanelNotas />
            </div>
        </div>
    );
}
