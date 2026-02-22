"use client"
import { useState } from "react";
import { Shield, Key, Smartphone, CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";
import { actualizarCredencialesAdmin, iniciarConfiguracionMFA, activarMFA, desactivarMFA } from "@/nucleo/acciones/admin.accion";

interface Props {
    entrenador: {
        id: string;
        email: string;
        mfaEnabled: boolean;
    }
}

export default function GestionSeguridadAdmin({ entrenador }: Props) {
    const [loading, setLoading] = useState(false);
    const [mfaConfig, setMfaConfig] = useState<{ qr: string, secreto: string } | null>(null);
    const [mfaToken, setMfaToken] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Manejo de cambio de Password
    const handleCambiarPassword = async () => {
        const nueva = prompt("Ingresa la nueva contraseña maestra:");
        if (!nueva || nueva.length < 8) return alert("Mínimo 8 caracteres.");

        setLoading(true);
        const res = await actualizarCredencialesAdmin({ password: nueva });
        setLoading(false);

        if (res.success) alert("Contraseña actualizada correctamente.");
        else alert("Error: " + res.error);
    };

    // Iniciar Configuración MFA
    const handleIniciarMFA = async () => {
        setLoading(true);
        const res = await iniciarConfiguracionMFA();
        setLoading(false);
        if (res.success && res.qr && res.secreto) {
            setMfaConfig({ qr: res.qr, secreto: res.secreto });
        } else {
            setError(res.error || "No se pudo iniciar MFA.");
        }
    };

    // Confirmar Activación MFA
    const handleConfirmarMFA = async () => {
        if (!mfaConfig || !mfaToken) return;
        setLoading(true);
        const res = await activarMFA(mfaToken, mfaConfig.secreto);
        setLoading(false);
        if (res.success) {
            setMfaConfig(null);
            setMfaToken("");
            alert("MFA Activado con éxito.");
        } else {
            alert(res.error);
        }
    };

    const handleDesactivarMFA = async () => {
        if (!confirm("¿Seguro que quieres eliminar la capa extra de seguridad?")) return;
        setLoading(true);
        await desactivarMFA();
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Tarjeta de Contraseña */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-marino border border-marino-4 hover:border-marino-3 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-naranja/10 rounded-xl text-naranja">
                        <Key size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blanco">Contraseña Maestra</p>
                        <p className="text-[0.65rem] text-gris uppercase tracking-widest font-medium">Cifrada con Protocolo Bcrypt v12</p>
                    </div>
                </div>
                <button
                    onClick={handleCambiarPassword}
                    disabled={loading}
                    className="text-[0.65rem] font-bold text-naranja border border-naranja/20 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-naranja hover:text-marino transition-all active:scale-95"
                >
                    Actualizar
                </button>
            </div>

            {/* Tarjeta de MFA */}
            <div className={`p-5 rounded-2xl border transition-all ${entrenador.mfaEnabled ? 'bg-verde/5 border-verde/20' : 'bg-marino border-marino-4'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${entrenador.mfaEnabled ? 'bg-verde/10 text-verde' : 'bg-gris/10 text-gris'}`}>
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-blanco">Autenticación de 2 Factores (MFA)</p>
                                {entrenador.mfaEnabled ? (
                                    <span className="flex items-center gap-1 text-[0.5rem] bg-verde/20 text-verde px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        <CheckCircle2 size={8} /> Activo
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[0.5rem] bg-rojo/20 text-rojo px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        <XCircle size={8} /> Vulnerable
                                    </span>
                                )}
                            </div>
                            <p className="text-[0.65rem] text-gris font-medium">Exige un código de Google Authenticator para entrar.</p>
                        </div>
                    </div>

                    {!entrenador.mfaEnabled ? (
                        <button
                            onClick={handleIniciarMFA}
                            disabled={loading || !!mfaConfig}
                            className="text-[0.65rem] font-bold text-blanco bg-marino-3 hover:bg-naranja hover:text-marino px-4 py-2 rounded-xl uppercase tracking-widest transition-all shadow-lg"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : "Configurar"}
                        </button>
                    ) : (
                        <button
                            onClick={handleDesactivarMFA}
                            disabled={loading}
                            className="text-[0.65rem] font-bold text-rojo/60 hover:text-rojo hover:bg-rojo/10 px-4 py-2 rounded-xl uppercase tracking-widest transition-all"
                        >
                            Desactivar
                        </button>
                    )}
                </div>

                {/* Flujo de Configuración MFA (QR) */}
                {mfaConfig && (
                    <div className="mt-6 p-6 bg-marino-3 rounded-2xl border border-naranja/20 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="bg-blanco p-2 rounded-xl shadow-2xl">
                                <img src={mfaConfig.qr} alt="MFA QR" className="w-32 h-32" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="text-xs text-blanco leading-relaxed">
                                    <span className="text-naranja font-bold">Paso 1:</span> Escanea este código con Google Authenticator o Authy.<br />
                                    <span className="text-naranja font-bold">Paso 2:</span> Ingresa el código de 6 dígitos que aparezca arriba.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000 000"
                                        value={mfaToken}
                                        onChange={(e) => setMfaToken(e.target.value)}
                                        className="bg-marino border border-marino-4 rounded-xl px-4 py-2 text-blanco text-center font-black tracking-[0.5em] w-32 focus:border-naranja outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleConfirmarMFA}
                                        disabled={loading || mfaToken.length < 6}
                                        className="bg-naranja text-marino font-black px-6 rounded-xl uppercase text-[0.7rem] tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        Validar y Activar
                                    </button>
                                    <button
                                        onClick={() => setMfaConfig(null)}
                                        className="text-gris text-[0.6rem] uppercase font-bold px-3"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
