"use client"
import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import { actualizarAvatarAdmin } from "@/nucleo/acciones/admin.accion";

interface Props {
    avatarUrl?: string | null;
    nombre: string;
}

export default function GestionAvatarAdmin({ avatarUrl, nombre }: Props) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(avatarUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 2MB para avatar)
        if (file.size > 2 * 1024 * 1024) {
            alert("La imagen es muy pesada. Máximo 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setPreview(base64);

            setLoading(true);
            const res = await actualizarAvatarAdmin(base64);
            setLoading(false);

            if (!res.success) {
                alert(res.error);
                setPreview(avatarUrl || null);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
            <div className="relative group mx-auto md:mx-0">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 rounded-3xl bg-marino-3 border-2 border-dashed border-marino-4 flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner group-hover:border-naranja/50 transition-all duration-500 cursor-pointer relative"
                >
                    {preview ? (
                        <Image
                            src={preview}
                            alt={nombre}
                            fill
                            className="object-cover group-hover:opacity-40 transition-opacity"
                        />
                    ) : (
                        <>
                            <User size={40} className="text-gris/20 group-hover:text-naranja/50 transition-all" />
                            <span className="text-[0.55rem] font-black text-gris/40 uppercase tracking-[0.2em] group-hover:text-naranja">Sin Foto</span>
                        </>
                    )}

                    {/* Overlay de hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-marino/20">
                        <Camera size={24} className="text-naranja mb-1" />
                        <span className="text-[0.6rem] font-black text-blanco uppercase tracking-widest">Cambiar</span>
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-marino/60 backdrop-blur-sm flex items-center justify-center z-10 font-bold text-naranja">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                    )}
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-naranja rounded-xl flex items-center justify-center shadow-lg border-2 border-marino-2 cursor-pointer hover:scale-110 transition-transform"
                >
                    <Camera size={18} className="text-marino" />
                </div>
            </div>

            <div className="space-y-1 text-center md:text-left flex-1">
                <p className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em]">Marca Personal</p>
                <h2 className="text-2xl font-barlow-condensed font-black text-blanco uppercase italic">{nombre}</h2>
                <p className="text-xs text-gris leading-relaxed max-w-xs">
                    Tu avatar es lo que los clientes verán en su app. Se recomienda una imagen cuadrada y nítida.
                </p>
            </div>
        </div>
    );
}
