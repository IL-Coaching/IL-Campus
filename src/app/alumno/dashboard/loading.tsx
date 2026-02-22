import { Loader2 } from "lucide-react";

export default function AlumnoLoading() {
    return (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-marino-4 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-naranja border-t-transparent rounded-full animate-spin"></div>
            </div>

            <h2 className="text-blanco font-barlow-condensed text-xl uppercase tracking-widest font-black">Cargando Módulo...</h2>
            <p className="text-gris text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Descargando tu plan
            </p>
        </div>
    );
}
