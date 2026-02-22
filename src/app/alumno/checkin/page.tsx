import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { Calendar, Camera } from "lucide-react";

export default function CheckinPage() {
    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-naranja/10 text-naranja border-2 border-naranja/20 rounded-full flex items-center justify-center mb-8 animate-bounce transition-all duration-1000">
                <Calendar size={48} />
            </div>

            <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tight italic">Check-in Semanal</h1>
            <p className="text-gris text-sm font-bold uppercase tracking-[0.2em] mt-4 max-w-xs">
                Acá registrarás tu evolución física y mental cada semana.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-4 w-full max-w-xs">
                <div className="p-5 bg-marino-2 border border-marino-4 rounded-3xl flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 bg-blanco/5 text-gris rounded-xl flex items-center justify-center border border-blanco/10 shrink-0">
                        <Camera size={20} />
                    </div>
                    <p className="text-xs text-gris font-bold uppercase tracking-widest text-left">Fotos de Progreso</p>
                </div>
                <div className="p-5 bg-naranja/5 border border-naranja/20 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-naranja/10 text-naranja rounded-xl flex items-center justify-center border border-naranja/20 shrink-0">
                        <Calendar size={20} />
                    </div>
                    <div className="text-left">
                        <p className="text-[0.6rem] text-naranja font-black uppercase tracking-widest">Próximamente</p>
                        <p className="text-[0.65rem] text-gris-claro font-medium mt-0.5">Reporte de Sueño, Estrés y Fatiga.</p>
                    </div>
                </div>
            </div>

            <AlumnoNav />
        </div>
    );
}
