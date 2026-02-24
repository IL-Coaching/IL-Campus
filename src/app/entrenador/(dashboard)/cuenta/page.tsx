export const dynamic = 'force-dynamic';

import { Shield, User, Mail, Phone } from "lucide-react";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";
import GestionSeguridadAdmin from "./componentes/GestionSeguridadAdmin";
import GestionAvatarAdmin from "./componentes/GestionAvatarAdmin";
export default async function ConfiguracionPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entrenador = await getEntrenadorSesion() as any;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-marino-4 pb-8">
                <div>
                    <h1 className="text-5xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Configuración <span className="text-naranja">Sistémica</span>
                    </h1>
                    <p className="text-gris font-medium text-sm flex items-center gap-2">
                        <Shield size={14} className="text-naranja" /> Control de identidad y protocolos de acceso para administradores
                    </p>
                </div>
            </div>

            <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Perfil */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sección Perfil Profesional */}
                    <div className="bg-marino-2 border border-marino-4 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-marino-4 bg-marino-3/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-marino-3 rounded-lg border border-marino-4">
                                    <User size={18} className="text-naranja" />
                                </div>
                                <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Perfil Profesional</h3>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col md:flex-row gap-10 items-start md:items-center">
                            <GestionAvatarAdmin
                                avatarUrl={entrenador.avatarUrl}
                                nombre={entrenador.nombre}
                            />
                            <div className="space-y-6 flex-1 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em] ml-1">Nombre Maestro</label>
                                        <div className="w-full bg-marino/50 border border-marino-4 rounded-2xl px-5 py-4 text-blanco font-bold text-sm shadow-inner">
                                            {entrenador.nombre}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em] ml-1">Vía de Contacto</label>
                                        <div className="w-full bg-marino/50 border border-marino-4 rounded-2xl px-5 py-4 text-blanco font-bold text-sm shadow-inner flex items-center gap-3">
                                            <Phone size={14} className="text-gris" /> {entrenador.telefono || 'No definido'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-naranja uppercase tracking-[0.3em] ml-1">Email de Acceso Primario</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Mail size={16} className="text-gris/50" />
                                        </div>
                                        <div className="w-full bg-marino/50 border border-marino-4 rounded-2xl pl-12 pr-5 py-4 text-blanco font-bold text-sm shadow-inner">
                                            {entrenador.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección Seguridad (Cliente Component) */}
                    <div className="bg-marino-2 border border-marino-4 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-marino-4 bg-marino-3/30 flex items-center gap-3">
                            <div className="p-2 bg-marino-3 rounded-lg border border-marino-4">
                                <Shield size={18} className="text-verde" />
                            </div>
                            <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco">Protocolos de Seguridad</h3>
                        </div>
                        <div className="p-8">
                            <GestionSeguridadAdmin entrenador={entrenador} />
                        </div>
                    </div>


                </div>

                {/* Columna Derecha: Info / Status */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-naranja/20 to-marino-3 border border-naranja/20 rounded-3xl p-8 space-y-4">
                        <div className="p-3 bg-naranja/20 rounded-2xl w-fit">
                            <Shield size={24} className="text-naranja" />
                        </div>
                        <h4 className="text-xl font-barlow-condensed font-black uppercase text-blanco">Estado de Blindaje</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs py-2 border-b border-blanco/5">
                                <span className="text-gris font-bold">Base de Datos</span>
                                <span className="text-verde font-black uppercase tracking-widest">Protegida</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-2 border-b border-blanco/5">
                                <span className="text-gris font-bold">Sesiones H.Only</span>
                                <span className="text-verde font-black uppercase tracking-widest">Activas</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-2">
                                <span className="text-gris font-bold">MFA Admin</span>
                                <span className={`${entrenador.mfaEnabled ? 'text-verde' : 'text-rojo'} font-black uppercase tracking-widest`}>
                                    {entrenador.mfaEnabled ? 'Fortificado' : 'Expuesto'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-marino-2 border border-marino-4 rounded-3xl p-6">
                        <p className="text-[0.6rem] text-gris font-black uppercase tracking-[0.2em] mb-4">Registro de Sistema</p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-naranja mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-[0.65rem] text-blanco font-bold">Hash Bcrypt consolidado en DB</p>
                                    <p className="text-[0.6rem] text-gris font-medium">Automatizado hoy a las 01:30hs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
