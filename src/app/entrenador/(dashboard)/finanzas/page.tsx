export const dynamic = 'force-dynamic';

/** Módulo de Finanzas — IL-Campus */
import { CreditCard } from "lucide-react";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import { CobroServicio } from "@/nucleo/servicios/cobro.servicio";
import StatsFinanzas from "./StatsFinanzas";
import ListaVencimientos, { Vencimiento } from "./ListaVencimientos";

export default async function FinanzasPage() {
    const entrenador = await getEntrenadorSesion();

    // Obtener data en paralelo para optimizar (Best Practice: ArchSecure AI)
    const [stats, vencimientos] = await Promise.all([
        CobroServicio.obtenerEstadisticasMensuales(entrenador.id),
        CobroServicio.obtenerVencimientos(entrenador.id)
    ]);

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Finanzas & Cobros
                </h1>
                <p className="text-gris font-medium text-sm">
                    Control de ingresos, renovaciones y flujo de caja mensual.
                </p>
            </div>

            {/* Stats Cards */}
            <StatsFinanzas stats={stats} />

            {/* Planilla de Control */}
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                        <CreditCard size={16} className="text-naranja" />
                        Control de Próximas Renovaciones
                    </h3>
                </div>

                <ListaVencimientos vencimientos={vencimientos as unknown as Vencimiento[]} />
            </div>

            {/* Sección Informativa - Auditoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="p-6 border border-dashed border-marino-4 rounded-xl bg-marino-3/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-naranja mb-2">Seguridad Auditoría</p>
                    <p className="text-xs text-gris-claro leading-relaxed">
                        Toda la información financiera está encriptada y protegida bajo el estándar **ArchSecure AI**.
                        Los cobros registrados generan una huella digital vinculada a tu cuenta de entrenador.
                    </p>
                </div>
            </div>
        </div>
    );
}
