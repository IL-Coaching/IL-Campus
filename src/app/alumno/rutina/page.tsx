import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { Dumbbell, Construction } from "lucide-react";

export default function RutinaPage() {
    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-naranja/10 text-naranja border-2 border-naranja/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <Dumbbell size={48} />
            </div>

            <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tight italic">Módulo de Rutina</h1>
            <p className="text-gris text-sm font-bold uppercase tracking-[0.2em] mt-4 max-w-xs">
                Estamos terminando de calibrar tu motor de entrenamiento.
            </p>

            <div className="mt-12 p-6 bg-marino-2 border border-marino-4 rounded-3xl flex items-center gap-4 max-w-sm">
                <div className="w-12 h-12 bg-naranja/5 text-naranja rounded-2xl flex items-center justify-center border border-naranja/10 shrink-0">
                    <Construction size={24} />
                </div>
                <div className="text-left">
                    <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">Estado del Módulo</p>
                    <p className="text-xs text-gris-claro font-medium mt-1 leading-relaxed">Próximamente verás acá tus ejercicios, series y cronómetros integrados.</p>
                </div>
            </div>

            <AlumnoNav />
        </div>
    );
}
