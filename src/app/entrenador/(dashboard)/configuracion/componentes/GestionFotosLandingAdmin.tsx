"use client"
import { useState, useRef } from "react";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { actualizarFotoLanding } from "@/nucleo/acciones/admin.accion";

interface Props {
    heroUrl?: string | null;
    bioUrl?: string | null;
}

export default function GestionFotosLandingAdmin({ heroUrl, bioUrl }: Props) {
    const [loadingHero, setLoadingHero] = useState(false);
    const [loadingBio, setLoadingBio] = useState(false);
    const [previewHero, setPreviewHero] = useState<string | null>(heroUrl || null);
    const [previewBio, setPreviewBio] = useState<string | null>(bioUrl || null);

    const heroInputRef = useRef<HTMLInputElement>(null);
    const bioInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'hero' | 'bio') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es muy pesada. Máximo 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            if (tipo === 'hero') {
                setPreviewHero(base64);
                setLoadingHero(true);
            } else {
                setPreviewBio(base64);
                setLoadingBio(true);
            }

            const res = await actualizarFotoLanding(base64, tipo);

            if (tipo === 'hero') setLoadingHero(false);
            else setLoadingBio(false);

            if (!res.success) {
                alert(res.error);
                if (tipo === 'hero') setPreviewHero(heroUrl || null);
                else setPreviewBio(bioUrl || null);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Foto Hero */}
            <div className="space-y-4">
                <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em] ml-1">Foto Principal (Hero)</label>
                <div
                    onClick={() => heroInputRef.current?.click()}
                    className="relative aspect-video w-full rounded-2xl bg-marino-3 border-2 border-dashed border-marino-4 flex flex-col items-center justify-center overflow-hidden cursor-pointer group hover:border-naranja/50 transition-all shadow-inner"
                >
                    <input
                        type="file"
                        ref={heroInputRef}
                        onChange={(e) => handleFileChange(e, 'hero')}
                        accept="image/*"
                        className="hidden"
                    />
                    {previewHero ? (
                        <Image src={previewHero} alt="Hero Preview" fill className="object-cover group-hover:opacity-40 transition-opacity" />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon size={32} className="text-gris/20" />
                            <span className="text-[0.55rem] font-black text-gris/40 uppercase tracking-widest">Subir Foto Hero</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-marino/20">
                        <Camera size={24} className="text-naranja mb-1" />
                        <span className="text-[0.6rem] font-black text-blanco uppercase tracking-widest">Cambiar Hero</span>
                    </div>
                    {loadingHero && (
                        <div className="absolute inset-0 bg-marino/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <Loader2 size={24} className="animate-spin text-naranja" />
                        </div>
                    )}
                </div>
                <p className="text-[0.6rem] text-gris italic">Se recomienda formato horizontal (16:9)</p>
            </div>

            {/* Foto Bio */}
            <div className="space-y-4">
                <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em] ml-1">Foto Biografía</label>
                <div
                    onClick={() => bioInputRef.current?.click()}
                    className="relative aspect-[3/4] w-full max-w-[240px] mx-auto rounded-2xl bg-marino-3 border-2 border-dashed border-marino-4 flex flex-col items-center justify-center overflow-hidden cursor-pointer group hover:border-naranja/50 transition-all shadow-inner"
                >
                    <input
                        type="file"
                        ref={bioInputRef}
                        onChange={(e) => handleFileChange(e, 'bio')}
                        accept="image/*"
                        className="hidden"
                    />
                    {previewBio ? (
                        <Image src={previewBio} alt="Bio Preview" fill className="object-cover group-hover:opacity-40 transition-opacity" />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon size={32} className="text-gris/20" />
                            <span className="text-[0.55rem] font-black text-gris/40 uppercase tracking-widest">Subir Foto Bio</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-marino/20">
                        <Camera size={24} className="text-naranja mb-1" />
                        <span className="text-[0.6rem] font-black text-blanco uppercase tracking-widest">Cambiar Bio</span>
                    </div>
                    {loadingBio && (
                        <div className="absolute inset-0 bg-marino/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <Loader2 size={24} className="animate-spin text-naranja" />
                        </div>
                    )}
                </div>
                <p className="text-[0.6rem] text-center text-gris italic">Se recomienda formato vertical (3:4)</p>
            </div>
        </div>
    );
}
