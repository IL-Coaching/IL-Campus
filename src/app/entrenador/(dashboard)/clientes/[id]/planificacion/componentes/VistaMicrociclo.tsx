"use client"
import { SemanaConDias, DiaConEjercicios } from "@/nucleo/tipos/planificacion.tipos";

interface VistaMicrocicloProps {
    semana: SemanaConDias;
    onSelectSesion: (dia: string) => void;
}

export default function VistaMicrociclo({ semana, onSelectSesion }: VistaMicrocicloProps) {
    const dias = semana.diasSesion.map((d: DiaConEjercicios) => ({
        id: d.id,
        dia: d.diaSemana,
        foco: d.focoMuscular,
        active: true,
        info: `${d.ejercicios.length} ej · ${d.ejercicios.reduce((acc, curr) => acc + curr.series, 0)} sets`,
        color: d.diaSemana === 'Lunes' ? "text-naranja" :
            d.diaSemana === 'Miércoles' ? "text-[#10B981]" :
                d.diaSemana === 'Viernes' ? "text-[#3B82F6]" : "text-[#8B5CF6]",
        dot: d.diaSemana === 'Lunes' ? "bg-naranja" :
            d.diaSemana === 'Miércoles' ? "bg-[#10B981]" :
                d.diaSemana === 'Viernes' ? "bg-[#3B82F6]" : "bg-[#8B5CF6]"
    }));

    // Rellenamos los días que faltan (Descanso)
    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const layout = diasSemana.map(nombre => {
        const existente = dias.find(d => d.dia === nombre);
        if (existente) return existente;
        return {
            id: nombre,
            dia: nombre,
            foco: "Descanso",
            active: false,
            info: "",
            color: "text-gris",
            dot: ""
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-marino-4 pb-6">
                <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                    Semana {semana.numeroSemana} — {semana.objetivoSemana}
                </h2>
                <p className="text-gris font-medium text-sm mt-2 uppercase tracking-widest">
                    RIR {semana.RIRobjetivo} · {dias.length} Sesiones Activas · Volumen Estimado: {semana.volumenEstimado}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {layout.map((d, i) => (
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
