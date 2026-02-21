import { CheckSquare, Clock, Calendar } from "lucide-react";

export default function CheckinsPage() {
    return (
        <div className="space-y-8 fade-up visible">
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Check-ins
                </h1>
                <p className="text-gris font-medium text-sm">
                    Revisión de progresos y fotos de tus entrenados
                </p>
            </div>

            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                        <Clock size={16} className="text-naranja" />
                        Reportes Pendientes (0)
                    </h3>
                </div>

                <div className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-marino-3 rounded-full flex items-center justify-center mb-6 border border-marino-4">
                        <CheckSquare size={32} className="text-gris/30" />
                    </div>
                    <h3 className="text-lg font-barlow-condensed font-bold text-blanco uppercase tracking-widest mb-1">Todo al día</h3>
                    <p className="text-gris max-w-sm text-sm">No tenés reportes pendientes de revisión. Los alumnos suelen enviarlos los Domingos y Lunes.</p>
                </div>
            </div>
        </div>
    );
}
