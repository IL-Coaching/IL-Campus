"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Video, Save } from "lucide-react";
import { actualizarEjercicio } from "@/nucleo/acciones/ejercicio.accion";
import {
    GrupoMuscular,
    TipoArticulacion,
    PatronMovimiento,
    Lateralidad
} from "@prisma/client";

interface ModalEditarEjercicioProps {
    ejercicio: {
        id: string;
        nombre: string;
        musculoPrincipal: GrupoMuscular;
        articulacion: TipoArticulacion;
        patron: PatronMovimiento;
        lateralidad: Lateralidad;
        urlVideo?: string | null;
        descripcion?: string | null;
    };
    onClose: () => void;
}

export default function ModalEditarEjercicio({ ejercicio, onClose }: ModalEditarEjercicioProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const res = await actualizarEjercicio(ejercicio.id, data);
        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            onClose();
            router.refresh();
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-marino-2 border border-marino-4 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <div>
                        <h3 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-1">Editar Movimiento</h3>
                        <p className="text-xs text-naranja font-black tracking-[0.2em] uppercase">Actualizar Arsenal Técnico</p>
                    </div>
                    <button onClick={onClose} className="bg-marino-4 p-3 rounded-2xl text-gris hover:text-blanco transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {error && (
                        <div className="bg-rojo/10 border border-rojo/20 text-rojo p-4 rounded-2xl text-xs font-bold uppercase text-center">
                            {error}
                        </div>
                    )}

                    {/* Campo: NOMBRE */}
                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Nombre Principal</label>
                        <input
                            name="nombre"
                            required
                            defaultValue={ejercicio.nombre}
                            className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco focus:border-naranja/50 outline-none transition-all font-bold"
                        />
                    </div>

                    {/* Grid: CLASIFICACIÓN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Grupo Muscular Principal</label>
                            <select name="musculoPrincipal" defaultValue={ejercicio.musculoPrincipal} required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                {Object.values(GrupoMuscular).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Patrón de Movimiento</label>
                            <select name="patronMovimiento" defaultValue={ejercicio.patron} required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                {Object.values(PatronMovimiento).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Complejidad Articular</label>
                            <select name="articulacion" defaultValue={ejercicio.articulacion} required className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                {Object.values(TipoArticulacion).map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest flex items-center gap-2">
                                <Video size={10} className="text-naranja" /> URL Video (YouTube)
                            </label>
                            <input
                                name="videoUrl"
                                defaultValue={ejercicio.urlVideo || ""}
                                className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs focus:border-naranja/50 outline-none transition-all font-medium"
                                placeholder="https://youtu.be/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Lateralidad</label>
                            <select name="lateralidad" defaultValue={ejercicio.lateralidad} className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-xs font-bold focus:border-naranja/50 outline-none appearance-none cursor-pointer">
                                <option value="BILATERAL">Bilateral</option>
                                <option value="UNILATERAL">Unilateral</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-gris uppercase tracking-widest">Notas Técnicas Breves</label>
                        <textarea
                            name="descripcion"
                            defaultValue={ejercicio.descripcion || ""}
                            rows={3}
                            className="w-full bg-marino-3 border border-marino-4 rounded-2xl px-5 py-4 text-blanco text-sm focus:border-naranja/50 outline-none transition-all font-medium resize-none"
                        ></textarea>
                    </div>

                    <div className="sticky bottom-0 pt-6 pb-2 bg-marino-2 flex gap-4 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-marino-4 hover:bg-marino-5 text-blanco font-black rounded-2xl uppercase tracking-widest text-[0.7rem] transition-all border border-marino-5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-naranja hover:bg-naranja-h text-marino font-black py-4 rounded-2xl text-[0.7rem] uppercase tracking-[0.2em] shadow-xl shadow-naranja/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Actualizando...</>
                            ) : (
                                <><Save size={18} /> Guardar Cambios</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
