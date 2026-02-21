import { Dumbbell, Plus, Search, Filter } from "lucide-react";

export default function RutinasPage() {
    return (
        <div className="space-y-8 fade-up visible">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Biblioteca de Ejercicios
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Catálogo de movimientos y videos para tus rutinas
                    </p>
                </div>
                <button className="bg-naranja hover:bg-naranja-h transition-all text-marino font-black px-6 py-2.5 rounded-lg uppercase tracking-widest font-barlow-condensed text-sm flex items-center gap-2 shadow-lg shadow-naranja/20">
                    <Plus size={18} /> Nuevo Ejercicio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-marino-2 border border-marino-4 p-1.5 rounded-xl flex items-center gap-3">
                    <div className="bg-marino border border-marino-4 p-2.5 rounded-lg">
                        <Search size={18} className="text-gris" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="bg-transparent border-none text-blanco text-sm focus:outline-none w-full placeholder:text-gris/50"
                    />
                </div>
                <div className="bg-marino-2 border border-marino-4 p-1.5 rounded-xl flex items-center gap-3 cursor-pointer hover:border-naranja/30 transition-colors">
                    <div className="bg-marino border border-marino-4 p-2.5 rounded-lg">
                        <Filter size={18} className="text-gris" />
                    </div>
                    <span className="text-sm text-gris-claro font-medium">Todos los Músculos</span>
                </div>
                <div className="bg-marino-2 border border-marino-4 p-1.5 rounded-xl flex items-center gap-3 cursor-pointer hover:border-naranja/30 transition-colors">
                    <div className="bg-marino border border-marino-4 p-2.5 rounded-lg">
                        <Dumbbell size={18} className="text-gris" />
                    </div>
                    <span className="text-sm text-gris-claro font-medium">Cualquier Equipado</span>
                </div>
            </div>

            <div className="bg-marino-2 border border-marino-4 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-marino-3 rounded-full flex items-center justify-center mb-6 border border-marino-4">
                    <Dumbbell size={32} className="text-naranja" />
                </div>
                <h3 className="text-xl font-barlow-condensed font-bold text-blanco uppercase tracking-widest mb-2">Próximamente: Biblioteca Completa</h3>
                <p className="text-gris max-w-sm text-sm">Estamos conectando tu catálogo de videos personalizados para que puedas armar rutinas en segundos.</p>
            </div>
        </div>
    );
}
