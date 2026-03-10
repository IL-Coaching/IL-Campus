"use client";

import { useState } from "react";
import { ClientePlanificacion } from "@/nucleo/tipos/planificacion.tipos";
import TabResumen from "./TabResumen";
import TabExpediente from "./TabExpediente";
import {
    LayoutDashboard,
    FileText,
    LineChart,
    Wallet
} from "lucide-react";

interface Props {
    cliente: ClientePlanificacion;
    tabMetricas: React.ReactNode;
    tabFinanzas: React.ReactNode;
}

export default function ClienteTabs({ cliente, tabMetricas, tabFinanzas }: Props) {
    const [tabActiva, setTabActiva] = useState<"resumen" | "expediente" | "metricas" | "finanzas">("resumen");

    const TABS = [
        { id: "resumen", label: "Resumen", icon: <LayoutDashboard size={16} /> },
        { id: "metricas", label: "Métricas", icon: <LineChart size={16} /> },
        { id: "expediente", label: "Expediente", icon: <FileText size={16} /> },
        { id: "finanzas", label: "Finanzas", icon: <Wallet size={16} /> }
    ] as const;

    return (
        <div className="space-y-6">
            {/* Nav Tabs — Navegación Táctica Scrollable */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-marino-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabActiva(tab.id)}
                        className={`flex-none flex items-center gap-2 px-6 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-300 ${tabActiva === tab.id
                            ? "bg-naranja text-marino shadow-[0_10px_20px_rgba(232,119,23,0.2)] scale-105"
                            : "text-gris-claro hover:text-blanco bg-marino-3/30 border border-marino-4/50"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido */}
            <div className="mt-6">
                {tabActiva === "resumen" && <TabResumen cliente={cliente} />}
                {tabActiva === "metricas" && tabMetricas}
                {tabActiva === "expediente" && <TabExpediente cliente={cliente} />}
                {tabActiva === "finanzas" && tabFinanzas}
            </div>
        </div>
    );
}
