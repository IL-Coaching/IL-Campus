"use client";

import { useState, useTransition, useRef } from "react";
import {
    LayoutTemplate, Settings, Users, MessageSquare, ArrowRight, ShieldAlert,
    Image as ImageIcon, Upload, Save, Eye, EyeOff, Plus, Trash2, User
} from "lucide-react";
import {
    actualizarSeccionCMS,
    togglePlanVisibilidad,
    actualizarImagenCMS
} from "@/nucleo/acciones/cms.accion";

interface ConfigLanding {
    id: string;
    heroTitulo: string | null;
    heroSubtitulo: string | null;
    heroImagenUrl: string | null;
    bioTexto: string | null;
    bioImagenUrl: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testimonios: any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faqs: any | null;
    footerTexto: string | null;
    modoMantenimiento: boolean;
}

interface PlanCMS {
    id: string;
    nombre: string;
    visible: boolean;
    precio: number;
}

interface Props {
    config: ConfigLanding;
    planes: PlanCMS[];
}

type TabCMS = 'hero' | 'bio' | 'planes' | 'testimonios' | 'faq' | 'footer' | 'config';

export default function CMSPanel({ config, planes }: Props) {
    const [tabActiva, setTabActiva] = useState<TabCMS>('hero');
    const [isPending, startTransition] = useTransition();

    // Estados para inputs libres
    const [heroTitulo, setHeroTitulo] = useState(config.heroTitulo || '');
    const [heroSubtitulo, setHeroSubtitulo] = useState(config.heroSubtitulo || '');
    const [bioTexto, setBioTexto] = useState(config.bioTexto || '');
    const [footerTexto, setFooterTexto] = useState(config.footerTexto || '');

    // Estados para JSON arrays
    const [testimonios, setTestimonios] = useState<{ nombre: string; texto: string; rating: number }[]>(
        Array.isArray(config.testimonios) ? config.testimonios : []
    );
    const [faqs, setFaqs] = useState<{ pregunta: string; respuesta: string }[]>(
        Array.isArray(config.faqs) ? config.faqs : []
    );

    const [modoMantenimiento, setModoMantenimiento] = useState(config.modoMantenimiento);

    const fileInputHero = useRef<HTMLInputElement>(null);
    const fileInputBio = useRef<HTMLInputElement>(null);

    const TABS = [
        { id: 'hero' as TabCMS, icon: <LayoutTemplate size={16} />, label: 'Sección Hero' },
        { id: 'bio' as TabCMS, icon: <User size={16} />, label: 'Bio Entrenador' },
        { id: 'planes' as TabCMS, icon: <ArrowRight size={16} />, label: 'Visibilidad Planes' },
        { id: 'testimonios' as TabCMS, icon: <Users size={16} />, label: 'Testimonios' },
        { id: 'faq' as TabCMS, icon: <MessageSquare size={16} />, label: 'Preguntas Frecuentes' },
        { id: 'footer' as TabCMS, icon: <LayoutTemplate size={16} />, label: 'Pie de Página' },
        { id: 'config' as TabCMS, icon: <Settings size={16} />, label: 'Ajustes Globales' }
    ];

    function handleSaveGenerico(datos: Record<string, unknown>) {
        startTransition(async () => {
            await actualizarSeccionCMS(datos);
        });
    }

    function handleTogglePlan(id: string, actual: boolean) {
        startTransition(async () => {
            await togglePlanVisibilidad(id, !actual);
        });
    }

    function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>, tipo: 'hero' | 'bio') {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            startTransition(async () => {
                await actualizarImagenCMS(base64, tipo);
            });
        };
        reader.readAsDataURL(file);
    }

    // --- Renders por Tab --- //

    const renderHero = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Sección Hero (Principal)</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Título Principal</label>
                    <input type="text" value={heroTitulo} onChange={(e) => setHeroTitulo(e.target.value)} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-4 text-sm text-blanco focus:border-naranja/50 focus:outline-none" />
                </div>
                <div>
                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Subtítulo</label>
                    <textarea value={heroSubtitulo} onChange={(e) => setHeroSubtitulo(e.target.value)} rows={3} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-4 text-sm text-blanco focus:border-naranja/50 focus:outline-none" />
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => handleSaveGenerico({ heroTitulo, heroSubtitulo })}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors"
                    >
                        <Save size={14} /> Guardar Textos
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-marino-4">
                <h4 className="text-[0.6rem] text-gris uppercase tracking-widest font-bold mb-3">Imagen Hero</h4>
                {config.heroImagenUrl ? (
                    <div className="relative group w-full max-w-sm rounded-xl overflow-hidden border border-marino-4 aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.heroImagenUrl} alt="Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-marino/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => fileInputHero.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blanco text-marino text-xs uppercase font-black tracking-widest rounded-xl">
                                <Upload size={14} /> Cambiar Imagen
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => fileInputHero.current?.click()} className="flex flex-col items-center justify-center w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-marino-4 text-gris hover:border-naranja hover:text-naranja transition-colors">
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Subir Imagen Hero</span>
                    </button>
                )}
                <input type="file" ref={fileInputHero} className="hidden" accept="image/*" onChange={(e) => handleSubirImagen(e, 'hero')} />
            </div>
        </div>
    );

    const renderBio = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Biografía del Entrenador</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Texto descriptivo</label>
                    <textarea value={bioTexto} onChange={(e) => setBioTexto(e.target.value)} rows={6} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-4 text-sm text-blanco focus:border-naranja/50 focus:outline-none" />
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => handleSaveGenerico({ bioTexto })}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors"
                    >
                        <Save size={14} /> Guardar Bio
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-marino-4">
                <h4 className="text-[0.6rem] text-gris uppercase tracking-widest font-bold mb-3">Foto Biografía</h4>
                {config.bioImagenUrl ? (
                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-marino-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.bioImagenUrl} alt="Bio" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-marino/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => fileInputBio.current?.click()} className="p-2 bg-blanco text-marino rounded-full">
                                <Upload size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => fileInputBio.current?.click()} className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-marino-4 text-gris hover:border-naranja hover:text-naranja transition-colors">
                        <ImageIcon size={20} className="mb-1" />
                    </button>
                )}
                <input type="file" ref={fileInputBio} className="hidden" accept="image/*" onChange={(e) => handleSubirImagen(e, 'bio')} />
            </div>
        </div>
    );

    const renderPlanes = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Planos visibles en Landing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planes.map(p => (
                    <div key={p.id} className="bg-marino-3/50 border border-marino-4 rounded-xl p-4 flex flex-col justify-between h-full min-h-[120px]">
                        <div>
                            <p className="font-bold text-blanco">{p.nombre}</p>
                            <p className="text-xs text-gris mt-1">${p.precio} ARS</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleTogglePlan(p.id, p.visible)}
                                disabled={isPending}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${p.visible
                                    ? 'bg-verde/10 text-verde hover:bg-rojo/10 hover:text-rojo'
                                    : 'bg-marino border border-marino-4 text-gris hover:text-blanco'
                                    }`}
                            >
                                {p.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                {p.visible ? 'Público' : 'Oculto'}
                            </button>
                        </div>
                    </div>
                ))}
                {planes.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gris italic text-sm">
                        No hay planes creados en el sistema.
                    </div>
                )}
            </div>
        </div>
    );

    const renderTestimonios = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Testimonios</h3>
                <button
                    onClick={() => setTestimonios([{ nombre: '', texto: '', rating: 5 }, ...testimonios])}
                    className="flex items-center gap-2 text-[0.6rem] uppercase tracking-widest font-black text-naranja bg-naranja/10 px-3 py-1.5 rounded-lg hover:bg-naranja hover:text-marino transition-all"
                >
                    <Plus size={12} /> Agregar
                </button>
            </div>
            <div className="space-y-4">
                {testimonios.map((t, i) => (
                    <div key={i} className="bg-marino-3/30 border border-marino-4 rounded-xl p-4 space-y-3 relative group">
                        <button
                            onClick={() => setTestimonios(testimonios.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-1.5 text-gris hover:text-rojo opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-4 mr-8">
                            <div>
                                <label className="text-[0.5rem] text-gris uppercase font-bold block mb-1">Nombre</label>
                                <input type="text" value={t.nombre} onChange={(e) => {
                                    const nm = [...testimonios]; nm[i].nombre = e.target.value; setTestimonios(nm);
                                }} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-3 text-xs text-blanco focus:border-naranja/50 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[0.5rem] text-gris uppercase font-bold block mb-1">Rating (1-5)</label>
                                <input type="number" min="1" max="5" value={t.rating} onChange={(e) => {
                                    const nm = [...testimonios]; nm[i].rating = parseInt(e.target.value) || 5; setTestimonios(nm);
                                }} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-3 text-xs text-blanco focus:border-naranja/50 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[0.5rem] text-gris uppercase font-bold block mb-1">Testimonio</label>
                            <textarea value={t.texto} rows={2} onChange={(e) => {
                                const nm = [...testimonios]; nm[i].texto = e.target.value; setTestimonios(nm);
                            }} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-3 text-xs text-blanco focus:border-naranja/50 focus:outline-none" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t border-marino-4">
                <button
                    onClick={() => handleSaveGenerico({ testimonios })}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors"
                >
                    <Save size={14} /> Guardar Testimonios
                </button>
            </div>
        </div>
    );

    const renderFAQ = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Preguntas Frecuentes</h3>
                <button
                    onClick={() => setFaqs([...faqs, { pregunta: '', respuesta: '' }])}
                    className="flex items-center gap-2 text-[0.6rem] uppercase tracking-widest font-black text-naranja bg-naranja/10 px-3 py-1.5 rounded-lg hover:bg-naranja hover:text-marino transition-all"
                >
                    <Plus size={12} /> Agregar
                </button>
            </div>
            <div className="space-y-4">
                {faqs.map((f, i) => (
                    <div key={i} className="bg-marino-3/30 border border-marino-4 rounded-xl p-4 space-y-3 relative group">
                        <button
                            onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-1.5 text-gris hover:text-rojo opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="mr-8 space-y-3">
                            <div>
                                <label className="text-[0.5rem] text-gris uppercase font-bold block mb-1">Pregunta</label>
                                <input type="text" value={f.pregunta} onChange={(e) => {
                                    const nm = [...faqs]; nm[i].pregunta = e.target.value; setFaqs(nm);
                                }} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-3 text-xs text-blanco focus:border-naranja/50 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[0.5rem] text-gris uppercase font-bold block mb-1">Respuesta</label>
                                <textarea value={f.respuesta} rows={2} onChange={(e) => {
                                    const nm = [...faqs]; nm[i].respuesta = e.target.value; setFaqs(nm);
                                }} className="w-full bg-marino border border-marino-4 rounded-lg py-1.5 px-3 text-xs text-blanco focus:border-naranja/50 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t border-marino-4">
                <button
                    onClick={() => handleSaveGenerico({ faqs })}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors"
                >
                    <Save size={14} /> Guardar FAQs
                </button>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Pie de Página (Footer)</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Texto o Disclaimer Financiero</label>
                    <textarea value={footerTexto} onChange={(e) => setFooterTexto(e.target.value)} rows={4} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-4 text-sm text-blanco focus:border-naranja/50 focus:outline-none" />
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => handleSaveGenerico({ footerTexto })}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors"
                    >
                        <Save size={14} /> Guardar Footer
                    </button>
                </div>
            </div>
        </div>
    );

    const renderConfig = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Ajustes Globales</h3>
            <div className="bg-rojo/5 border border-rojo/20 rounded-xl p-6">
                <div className="flex items-center gap-3 text-rojo mb-3">
                    <ShieldAlert size={20} />
                    <h4 className="font-bold">Modo Mantenimiento</h4>
                </div>
                <p className="text-xs text-gris mb-4">
                    Activar el modo mantenimiento ocultará la página pública detrás de un cartel de &quot;Volvemos pronto&quot;.
                    Solo los alumnos ya registrados podrán acceder al portal de login.
                </p>
                <button
                    onClick={() => {
                        const nuevo = !modoMantenimiento;
                        setModoMantenimiento(nuevo);
                        handleSaveGenerico({ modoMantenimiento: nuevo });
                    }}
                    disabled={isPending}
                    className={`px-4 py-2 rounded-xl text-xs uppercase font-black tracking-widest transition-colors ${modoMantenimiento
                        ? 'bg-rojo text-blanco hover:bg-rojo/80'
                        : 'bg-marino-3 border border-marino-4 text-blanco hover:border-rojo/50 hover:text-rojo'
                        }`}
                >
                    {modoMantenimiento ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar CMS */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTabActiva(t.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs uppercase tracking-widest font-black text-left ${tabActiva === t.id
                            ? 'bg-naranja text-marino shadow-lg shadow-naranja/10'
                            : 'text-gris hover:bg-marino-3/50 hover:text-blanco'
                            }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Panel Principal */}
            <div className="flex-1 bg-marino-2 border border-marino-4 rounded-2xl p-6 md:p-8 min-h-[500px]">
                {tabActiva === 'hero' && renderHero()}
                {tabActiva === 'bio' && renderBio()}
                {tabActiva === 'planes' && renderPlanes()}
                {tabActiva === 'testimonios' && renderTestimonios()}
                {tabActiva === 'faq' && renderFAQ()}
                {tabActiva === 'footer' && renderFooter()}
                {tabActiva === 'config' && renderConfig()}
            </div>
        </div>
    );
}
