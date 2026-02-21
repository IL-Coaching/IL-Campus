"use client"

interface VistaMicrocicloProps {
    semana: number;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const dias = [
        { dia: "Lunes", foco: "Push (Pecho/Hombro)", color: "text-naranja", dot: "bg-[#22C55E]", active: true, info: "8 ej · 24 sets" },
        { dia: "Martes", foco: "Pull (Espalda/Bíceps)", color: "text-[#22C55E]", dot: "bg-[#22C55E]", active: true, info: "7 ej · 21 sets" },
        { dia: "Miércoles", foco: "Descanso", color: "text-gris", dot: "", active: false, info: "" },
        { dia: "Jueves", foco: "Piernas (Empuje/Tracción)", color: "text-[#60A5FA]", dot: "bg-[#22C55E]", active: true, info: "6 ej · 22 sets" },
        { dia: "Viernes", foco: "FB (Funcional / HIIT)", color: "text-[#A78BFA]", dot: "bg-[#EAB308]", active: true, info: "10 ej · 15 sets" },
        { dia: "Sábado", foco: "Descanso", color: "text-gris", dot: "", active: false, info: "" },
        { dia: "Domingo", foco: "Descanso", color: "text-gris", dot: "", active: false, info: "" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-marino-4 pb-6">
                <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                    Semana {semana} — Objetivo: Acumulación Metabólica
                </h2>
                <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest">
                    RIR 3 · 4 Sesiones Activas · Volumen Estimado: 85 sets
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {dias.map((d, i) => (
                    <div
                        key={i}
                        onClick={() => d.active && onSelectSesion(d.dia)}
                        className={`relative bg-marino-2 border border-marino-4 rounded-xl p-5 min-h-[160px] flex flex-col transition-all duration-300 ${d.active ? 'cursor-pointer hover:border-naranja/50 hover:bg-marino-3' : 'opacity-40 cursor-default'
                            }`}
                    >
                        {d.active && d.dot && (
                            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${d.dot}`} title="Estado de la sesión"></div>
                        )}

                        <span className="text-[0.65rem] text-gris font-bold uppercase tracking-widest mb-1">{d.dia}</span>
                        <h4 className={`text-xl font-barlow-condensed font-black uppercase leading-[1.1] mb-auto ${d.color}`}>
                            {d.foco}
                        </h4>

                        {d.active && (
                            <div className="mt-4 pt-4 border-t border-marino-4">
                                <p className="text-[0.7rem] text-gris-claro font-bold tracking-tight uppercase leading-none">
                                    {d.info}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
