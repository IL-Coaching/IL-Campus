import { buscarEjercicios } from "@/nucleo/acciones/ejercicio.accion";
import BibliotecaEjercicios from "./BibliotecaEjercicios";
import BotonImportador from "./BotonImportador";
import BotonAltaEjercicio from "./BotonAltaEjercicio";

export default async function BibliotecaPage() {
    // Carga inicial de datos (ejercicios no archivados)
    const ejerciciosIniciales = await buscarEjercicios("");

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-bold text-naranja uppercase tracking-widest">
                            Arsenal Técnico
                        </span>
                    </div>
                    <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tight text-blanco leading-none">
                        Biblioteca <span className="text-naranja">IL-Campus</span>
                    </h1>
                    <p className="text-gris font-medium text-sm mt-1 max-w-xl">
                        Gestión profesional de ejercicios, vídeos de técnica biomecánica y perfiles de estimulo.
                    </p>
                </div>
                <div className="flex gap-3">
                    <BotonImportador />
                    <BotonAltaEjercicio />
                </div>
            </div>

            {/* Panel Principal de la Biblioteca */}
            <BibliotecaEjercicios iniciales={ejerciciosIniciales} />
        </div>
    );
}
