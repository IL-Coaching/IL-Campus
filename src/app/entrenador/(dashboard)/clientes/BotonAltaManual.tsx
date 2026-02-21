"use client"
import { useState } from "react";
import { Plus } from "lucide-react";
import FormularioAlta from "./FormularioAlta";

export default function BotonAltaManual() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-naranja hover:bg-naranja-h transition-colors text-marino font-bold px-4 py-2.5 rounded shadow-lg shadow-naranja/10 text-sm tracking-wide uppercase"
            >
                <Plus size={18} />
                <span className="font-barlow-condensed font-bold">Alta Manual</span>
            </button>

            {isOpen && (
                <FormularioAlta onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}
