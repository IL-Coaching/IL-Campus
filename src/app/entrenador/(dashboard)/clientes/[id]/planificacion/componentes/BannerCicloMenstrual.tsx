"use client"

interface BannerCicloProps {
    fase: 'Menstrual' | 'Folicular' | 'Ovulación' | 'Lútea';
}

export default function BannerCicloMenstrual({ fase }: BannerCicloProps) {
    const config = {
        Menstrual: { color: 'border-gris', text: '● Fase Menstrual · Autoregulación total sugerida', sub: 'Reducir volumen un 20-30% si hay dolor/fatiga extrema.' },
        Folicular: { color: 'border-[#22C55E]', text: '● Fase Folicular · Alta energía esperada', sub: 'Aprovechar para subir intensidad o añadir +1 serie por ejercicio.' },
        Ovulación: { color: 'border-[#FF6B00]', text: '● Pico de Ovulación · Intensidad Máxima', sub: 'Máxima fuerza reportada. Excelente momento para buscar RIR 0-1.' },
        Lútea: { color: 'border-[#EAB308]', text: '● Fase Lútea · Energía sostinguda, caloría alta', sub: 'Sostener cargas, evitar fatiga residual acumulada excesiva.' }
    };

    const c = config[fase];

    return (
        <div className={`bg-marino-2 border-l-4 ${c.color} border-y-marino-4 border-r-marino-4 border p-4 rounded-r-lg shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
            <div>
                <span className="text-xs font-bold text-blanco uppercase tracking-widest block">{c.text}</span>
                <p className="text-[0.65rem] text-gris font-medium mt-0.5">{c.sub}</p>
            </div>
            <div className="flex -space-x-2">
                <div className={`w-3 h-3 rounded-full ${c.color.replace('border-', 'bg-')} animate-ping opacity-75`}></div>
            </div>
        </div>
    );
}
