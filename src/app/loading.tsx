import { Loader2 } from "lucide-react";

export default function GenericoLoading() {
    return (
        <div className="fixed inset-0 z-[9999] bg-marino flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-300">
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-marino-4 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-naranja border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div className="flex items-center gap-1 mb-2">
                <div className="w-1.5 h-4 bg-gris-claro rounded-sm opacity-50"></div>
                <div className="w-2.5 h-6 bg-gris-claro rounded-sm opacity-80"></div>
                <span className="text-2xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-1 animate-pulse">IL</span>
                <div className="w-2.5 h-6 bg-gris-claro rounded-sm opacity-80"></div>
                <div className="w-1.5 h-4 bg-gris-claro rounded-sm opacity-50"></div>
            </div>

            <h2 className="text-blanco font-barlow-condensed text-xl uppercase tracking-widest font-black">Cargando Módulo</h2>
            <p className="text-gris text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Procesando datos de alta latencia
            </p>
        </div>
    );
}
