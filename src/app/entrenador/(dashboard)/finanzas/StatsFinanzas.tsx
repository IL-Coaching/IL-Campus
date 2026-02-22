"use client"
import { TrendingUp, CreditCard, PieChart } from "lucide-react";

interface Props {
    stats: {
        totalMes: number;
        cantidadCobros: number;
    }
}

export default function StatsFinanzas({ stats }: Props) {
    const ticketPromedio = stats.cantidadCobros > 0 ? stats.totalMes / stats.cantidadCobros : 0;

    const cards = [
        {
            label: "Ingresos del Mes",
            value: `$${stats.totalMes.toLocaleString()}`,
            icon: <TrendingUp className="text-verde" />,
            desc: "Facturación total bruta"
        },
        {
            label: "Ticket Promedio",
            value: `$${ticketPromedio.toLocaleString()}`,
            icon: <PieChart className="text-naranja" />,
            desc: "Ingreso medio por atleta"
        },
        {
            label: "Cobros Realizados",
            value: stats.cantidadCobros,
            icon: <CreditCard className="text-blanco" />,
            desc: "Transacciones en el mes"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-xl hover:border-marino-3 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-marino-3 p-3 rounded-xl border border-marino-4 group-hover:bg-marino-4 transition-colors">
                            {card.icon}
                        </div>
                        <span className="text-gris text-[10px] uppercase font-bold tracking-widest">{card.desc}</span>
                    </div>
                    <p className="text-gris-claro text-xs font-bold uppercase tracking-widest mb-1">{card.label}</p>
                    <h3 className="text-3xl font-barlow-condensed font-black text-blanco tracking-tight">
                        {card.value}
                    </h3>
                </div>
            ))}
        </div>
    );
}
