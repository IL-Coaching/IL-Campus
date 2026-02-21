import { Settings, Shield, Bell, User, Camera } from "lucide-react";

export default function ConfiguracionPage() {
    return (
        <div className="space-y-8 fade-up visible">
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Configuración
                </h1>
                <p className="text-gris font-medium text-sm">
                    Ajustes de tu perfil y cuenta de administrador
                </p>
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Sección Perfil */}
                <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-marino-4 bg-marino-3/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User size={18} className="text-naranja" />
                            <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Perfil Profesional</h3>
                        </div>
                        <button className="text-[0.6rem] font-black text-naranja uppercase tracking-widest hover:underline transition-all">Editar Información</button>
                    </div>
                    <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-marino-3 border-2 border-dashed border-marino-4 flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner group-hover:border-naranja/50 transition-colors">
                                <Camera size={24} className="text-gris group-hover:text-naranja transition-colors" />
                                <span className="text-[0.5rem] font-bold text-gris uppercase">Subir Foto</span>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-bold text-gris-claro uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <div className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-2.5 text-blanco font-medium text-sm">Iñaki Legarreta</div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-bold text-gris-claro uppercase tracking-widest ml-1">Email Profesional</label>
                                    <div className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-2.5 text-blanco font-medium text-sm">legarretatraining@gmail.com</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección Seguridad */}
                <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-marino-4 bg-marino-3/30 flex items-center gap-3">
                        <Shield size={18} className="text-[#22C55E]" />
                        <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Seguridad y Acceso</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-marino border border-marino-4">
                            <div>
                                <p className="text-sm font-bold text-blanco">Contraseña de Administrador</p>
                                <p className="text-xs text-gris">Último cambio: Hace 3 meses</p>
                            </div>
                            <button className="text-[0.6rem] font-bold text-naranja border border-naranja/30 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-naranja/5 transition-all">Cambiar clave</button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-marino border border-marino-4">
                            <div>
                                <p className="text-sm font-bold text-blanco">Autenticación de 2 Factores</p>
                                <p className="text-xs text-[#EF4444] font-bold">Desactivado</p>
                            </div>
                            <button className="text-[0.6rem] font-bold text-gris border border-marino-4 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-marino-2 transition-all">Activar 2FA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
