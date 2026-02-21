import { CreditCard, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";

export default function CobrosPage() {
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
                    <DollarSign size={14} /> Historial Completo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-marino-2 to-marino-3 border border-marino-4 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={60} />
                    </div>
                    <p className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.2em] mb-2">Previsión Mes Actual</p>
                    <p className="text-4xl font-barlow-condensed font-black text-blanco">$580.000</p>
                    <div className="flex items-center gap-1 text-[#22C55E] text-xs font-bold mt-2">
                        <ArrowUpRight size={14} /> +12% vs Enero
                    </div>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-gris mb-3">
                        <CreditCard size={14} className="text-[#EAB308]" />
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest">Cobros Pendientes</p>
                    </div>
                    <p className="text-3xl font-barlow-condensed font-black text-blanco">2</p>
                    <p className="text-xs text-gris italic mt-1 font-medium">Laura G. y Martin V.</p>
                </div>

                <div className="bg-marino-2 border border-marino-4 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-gris mb-3">
                        <DollarSign size={14} className="text-[#22C55E]" />
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest">Ticket Promedio</p>
                    </div>
                    <p className="text-3xl font-barlow-condensed font-black text-blanco">$24.160</p>
                </div>
            </div>

            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-20 text-center flex flex-col items-center justify-center">
                    <p className="text-gris font-medium text-sm italic">Estamos configurando la pasarela de pagos automática.</p>
                </div>
            </div>
        </div>
    );
}
