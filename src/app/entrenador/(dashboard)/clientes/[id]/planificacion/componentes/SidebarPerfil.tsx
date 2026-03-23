"use client"
import { useEffect, useState } from 'react';
import {
    User,
    Target,
    Calendar,
    Stethoscope,
    Heart,
    Zap,
    ChevronDown,
    ChevronUp,
    Info,
    Loader2,
    Microscope,
    Ruler,
    Scale
} from 'lucide-react';

import { ClientePlanificacion } from '@/nucleo/tipos/planificacion.tipos';
import { obtenerPorcentajesCalculados } from '@/nucleo/acciones/testeo.accion';
import { obtenerUltimoCheckin } from '@/nucleo/acciones/checkin.accion';

interface SidebarPerfilProps {
    cliente: ClientePlanificacion;
}

type SeccionId = 'datos' | 'objetivos' | 'disponibilidad' | 'salud' | 'ciclo' | 'metricas';

interface Seccion {
    id: SeccionId;
    icon: typeof User;
    label: string;
}

const SECCIONES: Seccion[] = [
    { id: 'datos', icon: User, label: 'Datos Básicos' },
    { id: 'objetivos', icon: Target, label: 'Objetivos' },
    { id: 'disponibilidad', icon: Calendar, label: 'Disponibilidad' },
    { id: 'salud', icon: Stethoscope, label: 'Salud y Limitaciones' },
    { id: 'ciclo', icon: Heart, label: 'Ciclo Menstrual' },
    { id: 'metricas', icon: Microscope, label: 'Métricas / Testeos' },
];

export default function SidebarPerfil({ cliente }: SidebarPerfilProps) {
    const [seccionExpandida, setSeccionExpandida] = useState<SeccionId | null>(null);

    const toggleSeccion = (seccionId: SeccionId) => {
        setSeccionExpandida(prev => prev === seccionId ? null : seccionId);
    };

    const toggleAll = () => {
        if (seccionExpandida) {
            setSeccionExpandida(null);
        }
    };

    interface CheckinData {
        pesoKg: number | null;
        fecha: Date;
        energia: number | null;
        sueno: number | null;
        adherencia: number | null;
        nota: string | null;
        ajustesEsperados: string | null;
    }

    interface PorcentajesData {
        unRM: number;
        fechaTesteo: string | Date;
        p100: number;
        p90_6: number;
        p85_6: number;
        p78_6: number;
        p74_4: number;
        p70_3: number;
    }

    const [checkin, setCheckin] = useState<CheckinData | null>(null);
    const [loadingCheckin, setLoadingCheckin] = useState(false);
    const [porcentajes, setPorcentajes] = useState<PorcentajesData | null>(null);
    const [loadingPct, setLoadingPct] = useState(false);

    useEffect(() => {
        const fetchCheckin = async () => {
            setLoadingCheckin(true);
            const res = await obtenerUltimoCheckin(cliente.id);
            if (res.exito && res.checkin) {
                setCheckin(res.checkin as CheckinData);
            }
            setLoadingCheckin(false);
        };
        fetchCheckin();
    }, [cliente.id]);

    const fetchPorcentajes = async (ejercicioId: string) => {
        setLoadingPct(true);
        const res = await obtenerPorcentajesCalculados(cliente.id, ejercicioId);
        if (res.exito && res.porcentajes) {
            setPorcentajes(res.porcentajes as PorcentajesData);
        }
        setLoadingPct(false);
    };

    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const calcularEdad = (nacimiento: string) => {
        if (!nacimiento) return null;
        const fechaNac = new Date(nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad;
    };

    const edad = cliente.formularioInscripcion?.datosPersonales?.nacimiento
        ? calcularEdad(cliente.formularioInscripcion.datosPersonales.nacimiento)
        : cliente.formularioInscripcion?.datosPersonales?.edad;

    return (
        <aside className="w-[300px] bg-marino-2 border-r border-marino-4 flex flex-col h-full">
            <div className="p-4 border-b border-marino-4 flex items-center justify-between">
                <h3 className="font-barlow-condensed font-bold uppercase text-xs tracking-widest text-gris">Perfil del Cliente</h3>
                <button
                    onClick={toggleAll}
                    className="text-[0.6rem] text-naranja hover:text-naranja-h font-bold uppercase tracking-wider"
                >
                    {seccionExpandida ? 'Cerrar todo' : 'Expandir todo'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {SECCIONES.map((seccion) => {
                    const isOpen = seccionExpandida === seccion.id;
                    const Icono = seccion.icon;

                    return (
                        <div key={seccion.id} className="border-b border-marino-4">
                            <button
                                onClick={() => toggleSeccion(seccion.id)}
                                className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                                    isOpen ? 'bg-marino-3' : 'hover:bg-marino-3/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icono size={18} strokeWidth={2} className="text-naranja" />
                                    <span className="text-xs font-black uppercase tracking-wider text-blanco">
                                        {seccion.label}
                                    </span>
                                </div>
                                {isOpen ? (
                                    <ChevronUp size={18} className="text-gris" />
                                ) : (
                                    <ChevronDown size={18} className="text-gris" />
                                )}
                            </button>

                            {isOpen && (
                                <div className="px-4 pb-4 pt-1 space-y-4 animate-in slide-in-from-top-2">
                                    {seccion.id === 'datos' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[0.7rem] text-gris uppercase tracking-wider">Nombre</span>
                                                <span className="text-sm font-bold text-blanco">{cliente.nombre}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Ruler size={14} className="text-naranja" />
                                                    <div>
                                                        <span className="text-[0.6rem] text-gris uppercase tracking-wider block">Edad</span>
                                                        <span className="text-xs font-bold text-blanco">{edad || '--'} años</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-naranja" />
                                                    <div>
                                                        <span className="text-[0.6rem] text-gris uppercase tracking-wider block">Género</span>
                                                        <span className="text-xs font-bold text-blanco">
                                                            {cliente.formularioInscripcion?.datosPersonales?.genero || '--'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Scale size={14} className="text-naranja" />
                                                    <div>
                                                        <span className="text-[0.6rem] text-gris uppercase tracking-wider block">Peso</span>
                                                        {loadingCheckin ? (
                                                            <Loader2 size={12} className="animate-spin text-gris" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-blanco">
                                                                {checkin?.pesoKg ? `${checkin.pesoKg} kg` : '--'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Ruler size={14} className="text-naranja" />
                                                    <div>
                                                        <span className="text-[0.6rem] text-gris uppercase tracking-wider block">Altura</span>
                                                        <span className="text-xs font-bold text-blanco">
                                                            {cliente.formularioInscripcion?.datosPersonales?.altura
                                                                ? `${cliente.formularioInscripcion.datosPersonales.altura} cm`
                                                                : '--'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {checkin && (
                                                <div className="pt-2 border-t border-marino-4">
                                                    <span className="text-[0.55rem] text-naranja font-bold uppercase tracking-widest block mb-2">
                                                        Último Check-in: {formatearFecha(checkin.fecha)}
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        <div className="bg-marino-3 p-2 rounded-lg">
                                                            <span className="text-[0.6rem] text-gris block">Energía</span>
                                                            <span className="text-xs font-black text-blanco">{checkin.energia ?? '-'}/10</span>
                                                        </div>
                                                        <div className="bg-marino-3 p-2 rounded-lg">
                                                            <span className="text-[0.6rem] text-gris block">Sueño</span>
                                                            <span className="text-xs font-black text-blanco">{checkin.sueno ?? '-'}/10</span>
                                                        </div>
                                                        <div className="bg-marino-3 p-2 rounded-lg">
                                                            <span className="text-[0.6rem] text-gris block">Adherencia</span>
                                                            <span className="text-xs font-black text-blanco">{checkin.adherencia ?? '-'}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {seccion.id === 'objetivos' && (
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                    Objetivo Principal
                                                </span>
                                                <p className="text-xs text-blanco font-medium">
                                                    {cliente?.formularioInscripcion?.objetivos?.principales?.join(', ') || 'No definido'}
                                                </p>
                                            </div>
                                            {cliente?.formularioInscripcion?.objetivos?.motivacion && (
                                                <div>
                                                    <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                        Motivación
                                                    </span>
                                                    <p className="text-xs text-gris-claro font-light italic leading-relaxed">
                                                        &quot;{cliente.formularioInscripcion.objetivos.motivacion}&quot;
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {seccion.id === 'disponibilidad' && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                        Sesiones/Semana
                                                    </span>
                                                    <p className="text-xs text-blanco font-bold">
                                                        {cliente?.formularioInscripcion?.disponibilidad?.sesionesSemanales || '--'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                        Duración
                                                    </span>
                                                    <p className="text-xs text-blanco font-bold">
                                                        {cliente?.formularioInscripcion?.disponibilidad?.tiempoSesion || '--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                    Lugar
                                                </span>
                                                <p className="text-xs text-blanco font-bold">
                                                    {cliente?.formularioInscripcion?.disponibilidad?.lugar || 'No especificado'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-2">
                                                    Equipamiento
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {cliente?.formularioInscripcion?.disponibilidad?.equipamiento?.length ? (
                                                        cliente.formularioInscripcion.disponibilidad.equipamiento.map((tag: string) => (
                                                            <span key={tag} className="px-2 py-1 bg-marino-3 border border-naranja/30 rounded text-[0.65rem] text-naranja font-medium">
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gris italic">Sin equipamiento específico</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {seccion.id === 'salud' && (
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                    Condiciones de Salud
                                                </span>
                                                <p className="text-xs text-gris-claro leading-relaxed">
                                                    {cliente?.formularioInscripcion?.saludMedica?.condiciones?.length
                                                        ? cliente.formularioInscripcion.saludMedica.condiciones.join(', ')
                                                        : 'Ninguna reportada'}
                                                </p>
                                            </div>
                                            {cliente?.formularioInscripcion?.saludMedica?.otrasCondiciones && (
                                                <div className="p-3 bg-rojo/5 border border-rojo/20 rounded-xl">
                                                    <span className="text-[0.55rem] font-bold text-rojo uppercase tracking-widest block mb-1">
                                                        Otras Observaciones
                                                    </span>
                                                    <p className="text-xs text-gris-claro italic leading-relaxed">
                                                        &quot;{cliente.formularioInscripcion.saludMedica.otrasCondiciones}&quot;
                                                    </p>
                                                </div>
                                            )}
                                            <div className="p-3 bg-marino-3 border border-marino-4 rounded-xl">
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                    Apto Médico
                                                </span>
                                                <p className="text-xs text-blanco font-bold uppercase">
                                                    {cliente?.formularioInscripcion?.saludMedica?.aptoMedico || 'No especificado'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-bold uppercase tracking-widest block mb-1">
                                                    Ejercicios a Evitar / Preferencias
                                                </span>
                                                <p className="text-xs text-gris-claro leading-relaxed">
                                                    {cliente?.formularioInscripcion?.personalizacion?.noGusta || 'Ninguna especificada'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {seccion.id === 'ciclo' && (
                                        <div className="space-y-3">
                                            {cliente?.cicloMenstrual?.activo ? (
                                                <>
                                                    <div className="p-4 bg-naranja/10 border border-naranja/20 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap size={16} className="text-naranja" />
                                                            <span className="text-[0.65rem] font-black text-naranja uppercase tracking-wider">
                                                                Ciclo Activo
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-blanco">
                                                            {cliente.cicloMenstrual.duracionCiclo} días de duración
                                                        </p>
                                                        <p className="text-[0.65rem] text-gris mt-1">
                                                            Inicio último ciclo: {formatearFecha(cliente.cicloMenstrual.fechaInicioUltimoCiclo)}
                                                        </p>
                                                    </div>
                                                    <p className="text-[0.6rem] text-gris leading-relaxed">
                                                        El sistema sincroniza las cargas según la fase del ciclo para optimizar rendimiento y recuperación.
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="p-4 bg-marino-3/50 border border-marino-4 border-dashed rounded-xl text-center">
                                                    <Info size={20} className="text-gris mx-auto mb-2 opacity-50" />
                                                    <p className="text-[0.65rem] text-gris font-medium">
                                                        Ciclo menstrual no activo<br />o no aplica.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {seccion.id === 'metricas' && (
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-[0.6rem] text-naranja font-black uppercase tracking-widest block mb-2">
                                                    Tabla de Porcentajes
                                                </span>
                                                <select
                                                    onChange={(e) => e.target.value && fetchPorcentajes(e.target.value)}
                                                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-3 py-2.5 text-xs font-bold text-blanco outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="">Seleccionar ejercicio...</option>
                                                    <option value="sentadilla">Sentadilla Libre</option>
                                                    <option value="pesoMuerto">Peso Muerto</option>
                                                    <option value="pressBanco">Press de Banca</option>
                                                    <option value="dominadas">Dominadas</option>
                                                </select>
                                            </div>

                                            {loadingPct ? (
                                                <div className="flex justify-center p-6">
                                                    <Loader2 className="animate-spin text-naranja" size={24} />
                                                </div>
                                            ) : porcentajes ? (
                                                <div className="space-y-3">
                                                    <div className="bg-naranja/10 border border-naranja/20 p-3 rounded-xl">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[0.6rem] font-black text-blanco uppercase">1RM</span>
                                                            <span className="text-lg font-black text-naranja">{porcentajes.unRM} kg</span>
                                                        </div>
                                                        <p className="text-[0.55rem] text-gris font-medium mt-1">
                                                            Testeo: {formatearFecha(porcentajes.fechaTesteo)}
                                                        </p>
                                                    </div>

                                                    <div className="bg-marino-3/50 border border-marino-4 rounded-xl overflow-hidden">
                                                        <table className="w-full text-[0.6rem]">
                                                            <thead className="bg-marino-4/50 text-gris border-b border-marino-4">
                                                                <tr>
                                                                    <th className="p-2 text-left font-bold">REP</th>
                                                                    <th className="p-2 text-center font-bold">%</th>
                                                                    <th className="p-2 text-right font-bold">KG</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-marino-4">
                                                                {[
                                                                    { r: 1, p: 100, v: porcentajes.p100 },
                                                                    { r: 3, p: 90.6, v: porcentajes.p90_6 },
                                                                    { r: 5, p: 85.6, v: porcentajes.p85_6 },
                                                                    { r: 8, p: 78.6, v: porcentajes.p78_6 },
                                                                    { r: 10, p: 74.4, v: porcentajes.p74_4 },
                                                                    { r: 12, p: 70.3, v: porcentajes.p70_3 },
                                                                ].map(row => (
                                                                    <tr key={row.r} className="hover:bg-marino-4/30">
                                                                        <td className="p-2 font-bold text-blanco">{row.r}</td>
                                                                        <td className="p-2 text-center text-gris">{row.p}%</td>
                                                                        <td className="p-2 text-right font-black text-blanco">{row.v}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-marino-3/50 border border-marino-4 border-dashed rounded-xl text-center">
                                                    <Info size={20} className="text-gris mx-auto mb-2 opacity-50" />
                                                    <p className="text-[0.6rem] text-gris font-medium">
                                                        Seleccioná un ejercicio para<br />ver los porcentajes.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
