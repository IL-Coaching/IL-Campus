"use client";

import { useState } from "react";
import { ClientePlanificacion } from "@/nucleo/tipos/planificacion.tipos";
import TabResumen from "./TabResumen";
import TabExpediente from "./TabExpediente";
import TabMetricas from "./TabMetricas";
import TabFinanzas from "./TabFinanzas";
import {
    LayoutDashboard,
    FileText,
    LineChart,
    Wallet
} from "lucide-react";

interface Props {
    cliente: ClientePlanificacion;
}

export default function ClienteTabs({ cliente }: Props) {
    const [tabActiva, setTabActiva] = useState<"resumen" | "expediente" | "metricas" | "finanzas">("resumen");

    const TABS = [
        { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={16} /> },
        { id: "metricas", label: "Métricas", icon: <LineChart size={16} /> },
        { id: "expediente", label: "Expediente", icon: <FileText size={16} /> },
        { id: "finanzas", label: "Finanzas", icon: <Wallet size={16} /> }
    ] as const;

    return (
        <div className="space-y-6">
            {/* Nav Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-marino-4 pb-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabActiva(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tabActiva === tab.id
                            ? "bg-naranja text-marino shadow-lg shadow-naranja/10"
                            : "text-gris hover:text-blanco hover:bg-marino-3/50"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido */}
            <div className="mt-6">
                {tabActiva === "resumen" && <TabResumen cliente={cliente} />}
                {tabActiva === "metricas" && <TabMetricas clienteId={cliente.id} />}
                {tabActiva === "expediente" && <TabExpediente cliente={cliente} />}
                {tabActiva === "finanzas" && <TabFinanzas clienteId={cliente.id} />}
            </div>
        </div>
    );
}
