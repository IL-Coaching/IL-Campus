/** Biblioteca Maestra de Ejercicios — IL-Campus */
import { Plus } from "lucide-react";
import { buscarEjercicios } from "@/nucleo/acciones/ejercicio.accion";
import BibliotecaEjercicios from "./BibliotecaEjercicios";
import BotonImportador from "./BotonImportador";

export default async function RutinasPage() {
    // Carga inicial de datos
    const ejerciciosIniciales = await buscarEjercicios("");

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Biblioteca Maestra
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Catálogo de movimientos biomecánicos y tutoriales técnicos.
                    </p>
                </div>
                <div className="flex gap-2">
                    {ejerciciosIniciales.length === 0 && (
                        <BotonImportador />
                    )}
                    <button className="bg-naranja hover:bg-naranja-h transition-all text-marino font-black px-6 py-2.5 rounded-lg uppercase tracking-widest font-barlow-condensed text-sm flex items-center gap-2 shadow-lg shadow-naranja/20">
                        <Plus size={18} /> Nuevo Ejercicio
                    </button>
                </div>
            </div>

            {/* Buscador Interactivo y Grid (Componente de Cliente) */}
            <BibliotecaEjercicios iniciales={ejerciciosIniciales} />
        </div>
    );
}
