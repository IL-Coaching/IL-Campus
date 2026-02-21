"use client"
import { useEffect } from "react";
import { useModal } from "./ModalProvider";
import { sitioConfig } from "../../../config/sitio.config";

export default function ModalWhatsapp() {
    const { isOpen, planData, closeModal } = useModal();

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    if (!isOpen || !planData) return null;

    const msg = encodeURIComponent(
        `¡Hola Iñaki! Me interesa el ${planData.name} (${planData.price} · ${planData.duration}). ¿Podemos coordinar?`
    );
    // Usamos el número de la configuración
    const numero = sitioConfig.whatsapp || "5493425555607";
    const url = `https://wa.me/${numero}?text=${msg}`;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <div
                className="absolute inset-0 bg-marino/90 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-marino-2 border border-marino-4 rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden fade-up visible">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gris hover:text-blanco transition-colors text-2xl leading-none"
                >
                    &times;
                </button>

                <span className="text-naranja font-barlow-condensed font-bold tracking-widest text-xs uppercase block mb-1">
                    Estás a un paso
                </span>
                <h3 className="text-3xl font-barlow-condensed font-black uppercase text-blanco mb-2 leading-tight tracking-tight">
                    Contratar plan
                </h3>
                <p className="text-gris text-sm font-light mb-6">
                    Te vamos a redirigir a WhatsApp con tu selección pre-cargada para coordinar el inicio.
                </p>

                <div className="bg-marino-3 rounded-lg border border-marino-4 p-4 mb-6">
                    <p className="text-blanco font-semibold text-lg">{planData.name}</p>
                    <p className="text-naranja font-bold text-xl">{planData.price}</p>
                </div>

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#1ebd5a] transition-colors text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    onClick={closeModal}
                >
                    <span className="text-xl">💬</span> Contactar por WhatsApp
                </a>
            </div>
        </div>
    );
}
