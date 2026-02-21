"use client"
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { altaManualCliente } from "@/nucleo/acciones/cliente.accion";

interface FormularioAltaProps {
    onClose: () => void;
}

export default function FormularioAlta({ onClose }: FormularioAltaProps) {
    const [loading, setLoading] = useState(false);
    const [errorMsj, setErrorMsj] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsj(null);

        const formData = new FormData(e.currentTarget);
        const result = await altaManualCliente(formData);

        setLoading(false);

        if (result.error) {
            setErrorMsj(result.error);
        } else if (result.exito) {
            // Éxito: Se agregó en la base de datos.
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marino/80 backdrop-blur-sm">
            <div className="bg-marino-2 border border-marino-4 rounded-xl shadow-2xl w-full max-w-md overflow-hidden fade-up visible">

                {/* Header Modal */}
                <div className="p-4 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <div>
                        <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block">Nuevo Cliente</span>
                        <h3 className="text-xl font-barlow-condensed font-black uppercase text-blanco leading-none">Alta Manual del Entrenado</h3>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {errorMsj && (
                        <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-sm p-3 rounded">
                            {errorMsj}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gris uppercase tracking-wide mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            className="w-full bg-marino border border-marino-4 rounded px-3 py-2 text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                            placeholder="Ej. Lucas Rossi"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gris uppercase tracking-wide mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-marino border border-marino-4 rounded px-3 py-2 text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                            placeholder="lucas@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gris uppercase tracking-wide mb-1">Teléfono / WhatsApp</label>
                        <input
                            type="tel"
                            name="telefono"
                            className="w-full bg-marino border border-marino-4 rounded px-3 py-2 text-blanco focus:outline-none focus:border-naranja/50 transition-colors"
                            placeholder="+54 9 342..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gris uppercase tracking-wide mb-1">Plan Pagado Inicialmente</label>
                        <select
                            name="plan"
                            required
                            className="w-full bg-marino border border-marino-4 rounded px-3 py-2 text-blanco focus:outline-none focus:border-naranja/50 transition-colors appearance-none"
                        >
                            <option value="Start">Nivel 1 - Start</option>
                            <option value="GymRat">Nivel 2 - GymRat</option>
                            <option value="Elite">Nivel 3 - Elite</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-marino-4 mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-naranja hover:bg-naranja-h transition-colors text-marino font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-barlow-condensed tracking-wide uppercase text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Creando Cliente...</>
                            ) : (
                                "Crear Cuenta & Enviar Cuestionario"
                            )}
                        </button>
                        <p className="text-xs text-gris mt-3 text-center leading-relaxed">
                            El formulario PDF (Cuestionario) se solicitará al cliente una vez termine su Onboarding dentro de la aplicación.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
