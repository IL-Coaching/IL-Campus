"use client"
import { useState } from "react";
import { toast } from '@/compartido/hooks/useToast';
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { cargarBibliotecaOficial } from "@/nucleo/acciones/biblioteca.accion";

export default function BotonImportador() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleImportar = async () => {
        if (!confirm("¿Deseas cargar los ejercicios oficiales de IL-Coaching?")) return;
        setLoading(true);
        try {
            const res = await cargarBibliotecaOficial();
            if (res.exito) {
                toast.exito(`Se cargaron ${res.creados} ejercicios correctamente.`);
                router.refresh();
            } else {
                toast.error(res.error || "Ocurrió un error");
            }
        } catch {
            toast.error("Error inesperado al importar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleImportar}
            disabled={loading}
            className="bg-marino-3 hover:bg-marino-4 border border-marino-4 text-blanco font-bold px-6 py-2.5 rounded-lg uppercase tracking-widest font-barlow-condensed text-xs flex items-center gap-2 transition-all disabled:opacity-50"
        >
            <Database size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Provisionar Biblioteca"}
        </button>
    );
}
