"use client";

import { useState, useTransition, useRef } from "react";
import {
    LayoutTemplate, Settings, Users, MessageSquare, ArrowRight, ShieldAlert,
    Image as ImageIcon, Upload, Save, Eye, EyeOff, Plus, Trash2, User,
    AlertTriangle, X, Loader2
} from "lucide-react";
import {
    actualizarSeccionCMS,
    togglePlanVisibilidad,
    actualizarImagenCMS
} from "@/nucleo/acciones/cms.accion";
import Image from "next/image";

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
    precioPromocional: number | null;
    mesesPromocion: number | null;
}

interface Props {
    config: ConfigLanding;
    planes: PlanCMS[];
}

type TabCMS = 'hero' | 'bio' | 'planes' | 'testimonios' | 'faq' | 'footer' | 'config';

// ─── Modal de Confirmación Anti-Misclick ─────────────────────────────────────
interface ConfirmModalProps {
    open: boolean;
    titulo: string;
    descripcion: string;
    labelConfirm?: string;
    peligroso?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ModalConfirmacion({ open, titulo, descripcion, labelConfirm = "Confirmar", peligroso = false, onConfirm, onCancel }: ConfirmModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-marino/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`p-5 border-b border-marino-4 flex items-center gap-3 ${peligroso ? 'bg-rojo/10' : 'bg-naranja/10'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${peligroso ? 'bg-rojo/20' : 'bg-naranja/20'}`}>
                        <AlertTriangle size={20} className={peligroso ? 'text-rojo' : 'text-naranja'} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-barlow-condensed font-black uppercase text-blanco text-lg leading-none">{titulo}</h3>
                    </div>
                    <button onClick={onCancel} className="text-gris hover:text-blanco transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gris-claro leading-relaxed mb-6">{descripcion}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 bg-marino-3 border border-marino-4 rounded-xl text-xs font-black uppercase tracking-widest text-blanco hover:border-blanco/30 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${peligroso
                                ? 'bg-rojo hover:bg-rojo/80 text-blanco shadow-lg shadow-rojo/20'
                                : 'bg-naranja hover:bg-naranja/80 text-marino shadow-lg shadow-naranja/20'
                                }`}
                        >
                            {labelConfirm}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function CMSPanel({ config, planes }: Props) {
    const [tabActiva, setTabActiva] = useState<TabCMS>('hero');
    const [isPending, startTransition] = useTransition();
    const [guardadoOk, setGuardadoOk] = useState(false);

    // Estados de inputs
    const [heroTitulo, setHeroTitulo] = useState(config.heroTitulo || 'Más que\nentrenar:\nENTENDER,\nADAPTAR,\nPROGRESAR.');
    const [heroSubtitulo, setHeroSubtitulo] = useState(config.heroSubtitulo || 'Asesorías de entrenamiento 100% personalizadas basadas en ciencia.');
    const [bioTexto, setBioTexto] = useState(config.bioTexto || 'Transformo la salud, el rendimiento y la calidad de vida de las personas mediante sistemas de entrenamiento personalizados, basados en evidencia científica y adaptados a la vida real. Mi enfoque: procesos personalizados, cálidos, medibles y sostenibles.');
    const [footerTexto, setFooterTexto] = useState(config.footerTexto || 'IL-Campus © 2026. Todos los derechos reservados. Las asesorías no reemplazan el consejo de un profesional médico.');

    const defaultFaqs = [
        { q: "¿Cómo funciona el proceso de inscripción?", a: "Elegís el plan, nos contactamos por WhatsApp para coordinar el pago. Confirmado el pago, te envío acceso a IL-Campus donde completás tu formulario inicial para diseñar tu programa personalizado." },
        { q: "¿Necesito tener experiencia previa en el gimnasio?", a: "No. El programa se diseña completamente adaptado a tu nivel actual, desde cero o con años de entrenamiento." },
        { q: "¿Puedo entrenar en casa o necesito ir al gimnasio?", a: "Podés entrenar donde quieras. El programa se adapta al equipamiento disponible que informás en el formulario inicial." },
        { q: "¿En qué se diferencia el plan GymRat del Start?", a: "Todos los planes incluyen el mismo nivel de atención. La diferencia está en la profundidad de planificación: el Start es mensual, el GymRat incorpora periodización por mesociclo para una progresión más estructurada en 3 meses." },
        { q: "¿Cómo se realizan los pagos?", a: "Los pagos se coordinan directamente por WhatsApp. Podés transferir o usar el método que te resulte más cómodo." }
    ];

    const [testimonios, setTestimonios] = useState<{ nombre: string; texto: string; rating: number }[]>(
        Array.isArray(config.testimonios) && config.testimonios.length > 0 ? config.testimonios : []
    );
    const [faqs, setFaqs] = useState<{ pregunta: string; respuesta: string }[]>(
        Array.isArray(config.faqs) && config.faqs.length > 0 ? config.faqs : defaultFaqs.map(f => ({ pregunta: f.q, respuesta: f.a }))
    );

    const [modoMantenimiento, setModoMantenimiento] = useState(config.modoMantenimiento);

    const fileInputHero = useRef<HTMLInputElement>(null);
    const fileInputBio = useRef<HTMLInputElement>(null);

    // ── Estado del Modal Anti-Misclick ──────────────────────────────────────
    const [confirm, setConfirm] = useState<{
        open: boolean;
        titulo: string;
        descripcion: string;
        label?: string;
        peligroso?: boolean;
        accion: () => void;
    }>({ open: false, titulo: '', descripcion: '', accion: () => { } });

    function pedirConfirmacion(opts: { titulo: string; descripcion: string; label?: string; peligroso?: boolean; accion: () => void }) {
        setConfirm({ open: true, ...opts });
    }

    function confirmar() {
        confirm.accion();
        setConfirm(prev => ({ ...prev, open: false }));
    }

    // ── Acciones con feedback visual ────────────────────────────────────────
    function handleSaveGenerico(datos: Record<string, unknown>) {
        startTransition(async () => {
            await actualizarSeccionCMS(datos);
            setGuardadoOk(true);
            setTimeout(() => setGuardadoOk(false), 2500);
        });
    }

    function handleTogglePlan(id: string, actual: boolean) {
        pedirConfirmacion({
            titulo: actual ? "Ocultar Plan" : "Publicar Plan",
            descripcion: actual
                ? "Este plan dejará de ser visible en la landing pública. Los alumnos activos no se verán afectados."
                : "Este plan se mostrará públicamente en la landing. Asegurate de que el precio y la descripción estén actualizados.",
            label: actual ? "Sí, ocultarlo" : "Sí, publicarlo",
            peligroso: actual,
            accion: () => {
                startTransition(async () => {
                    await togglePlanVisibilidad(id, !actual);
                });
            }
        });
    }

    function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>, tipo: 'hero' | 'bio') {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            pedirConfirmacion({
                titulo: "Cambiar imagen",
                descripcion: `Se reemplazará la imagen de ${tipo === 'hero' ? 'la sección Hero' : 'la Biografía'} de la landing. Esta acción es inmediata.`,
                label: "Sí, cambiar imagen",
                accion: () => {
                    startTransition(async () => {
                        await actualizarImagenCMS(base64, tipo);
                    });
                }
            });
        };
        reader.readAsDataURL(file);
    }

    const TABS = [
        { id: 'hero' as TabCMS, icon: <LayoutTemplate size={16} />, label: 'Sección Hero' },
        { id: 'bio' as TabCMS, icon: <User size={16} />, label: 'Bio Entrenador' },
        { id: 'planes' as TabCMS, icon: <ArrowRight size={16} />, label: 'Visibilidad Planes' },
        { id: 'testimonios' as TabCMS, icon: <Users size={16} />, label: 'Testimonios' },
        { id: 'faq' as TabCMS, icon: <MessageSquare size={16} />, label: 'Preguntas Frecuentes' },
        { id: 'footer' as TabCMS, icon: <LayoutTemplate size={16} />, label: 'Pie de Página' },
        { id: 'config' as TabCMS, icon: <Settings size={16} />, label: 'Ajustes Globales' }
    ];

    // Botón de guardado con confirmación genérico
    const BtnGuardar = ({ label, datos }: { label: string; datos: Record<string, unknown> }) => (
        <button
            onClick={() => pedirConfirmacion({
                titulo: `Guardar ${label}`,
                descripcion: `Los cambios en ${label.toLowerCase()} se publicarán de inmediato en la landing pública.`,
                label: "Sí, guardar y publicar",
                accion: () => handleSaveGenerico(datos)
            })}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-naranja text-marino text-xs uppercase font-black tracking-widest rounded-xl hover:bg-naranja/80 transition-colors disabled:opacity-50"
        >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {guardadoOk ? '✓ Guardado' : `Guardar ${label}`}
        </button>
    );

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
                    <BtnGuardar label="Textos Hero" datos={{ heroTitulo, heroSubtitulo }} />
                </div>
            </div>

            <div className="pt-6 border-t border-marino-4">
                <h4 className="text-[0.6rem] text-gris uppercase tracking-widest font-bold mb-3">Imagen Hero</h4>
                {config.heroImagenUrl ? (
                    <div className="relative group w-full max-w-sm rounded-xl overflow-hidden border border-marino-4 aspect-video">
                        <Image src={config.heroImagenUrl} alt="Hero" fill className="object-cover" />
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
                    <BtnGuardar label="Bio" datos={{ bioTexto }} />
                </div>
            </div>

            <div className="pt-6 border-t border-marino-4">
                <h4 className="text-[0.6rem] text-gris uppercase tracking-widest font-bold mb-3">Foto Biografía</h4>
                {config.bioImagenUrl ? (
                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-marino-4">
                        <Image src={config.bioImagenUrl} alt="Bio" fill className="object-cover" />
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
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Planes visibles en Landing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planes.map(p => (
                    <div key={p.id} className="bg-marino-3/50 border border-marino-4 rounded-xl p-4 flex flex-col justify-between h-full min-h-[120px]">
                        <div>
                            <p className="font-bold text-blanco leading-tight">{p.nombre}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gris">${p.precio}</p>
                                {p.precioPromocional && (
                                    <span className="text-[0.6rem] bg-verde/10 text-verde px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                        Promo: ${p.precioPromocional}
                                    </span>
                                )}
                            </div>
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
                            onClick={() => pedirConfirmacion({
                                titulo: "Eliminar Testimonio",
                                descripcion: "Este testimonio se eliminará de la lista. La landing se actualizará cuando guardes los cambios.",
                                label: "Sí, eliminar",
                                peligroso: true,
                                accion: () => setTestimonios(testimonios.filter((_, idx) => idx !== i))
                            })}
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
                <BtnGuardar label="Testimonios" datos={{ testimonios }} />
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
                            onClick={() => pedirConfirmacion({
                                titulo: "Eliminar Pregunta",
                                descripcion: "Esta pregunta frecuente se eliminará. Los cambios se aplicarán al guardar.",
                                label: "Sí, eliminar",
                                peligroso: true,
                                accion: () => setFaqs(faqs.filter((_, idx) => idx !== i))
                            })}
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
                <BtnGuardar label="FAQs" datos={{ faqs }} />
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
                    <BtnGuardar label="Footer" datos={{ footerTexto }} />
                </div>
            </div>
        </div>
    );

    const renderConfig = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-barlow-condensed font-black text-blanco uppercase tracking-tighter">Ajustes Globales</h3>

            {/* Banner de estado actual */}
            {modoMantenimiento && (
                <div className="p-4 bg-rojo/10 border border-rojo/30 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="w-2 h-2 rounded-full bg-rojo animate-pulse" />
                    <p className="text-xs font-bold text-rojo uppercase tracking-widest">
                        La landing está actualmente en modo mantenimiento — los visitantes ven la pantalla de espera
                    </p>
                </div>
            )}

            <div className={`border rounded-xl p-6 ${modoMantenimiento ? 'bg-rojo/5 border-rojo/30' : 'bg-marino-3/50 border-marino-4'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert size={20} className={modoMantenimiento ? 'text-rojo' : 'text-gris'} />
                    <h4 className="font-bold text-blanco">Modo Mantenimiento</h4>
                    {modoMantenimiento && (
                        <span className="px-2 py-0.5 bg-rojo/20 border border-rojo/30 rounded text-[0.55rem] font-black text-rojo uppercase tracking-widest">Activo</span>
                    )}
                </div>
                <p className="text-xs text-gris mb-5 leading-relaxed">
                    Activar el modo mantenimiento reemplazará la landing pública con una pantalla elegante de{" "}
                    <em>&quot;Estamos mejorando tu experiencia&quot;</em> con un CTA de WhatsApp.
                    Solo los alumnos ya registrados podrán acceder al portal de login directamente.
                </p>
                <button
                    onClick={() => pedirConfirmacion({
                        titulo: modoMantenimiento ? "Desactivar Mantenimiento" : "Activar Mantenimiento",
                        descripcion: modoMantenimiento
                            ? "La landing volverá a estar accesible para el público en general de inmediato."
                            : "La landing pública será reemplazada por la pantalla de mantenimiento. Los clientes existentes todavía podrán acceder al portal.",
                        label: modoMantenimiento ? "Sí, volver al público" : "Sí, activar mantenimiento",
                        peligroso: !modoMantenimiento,
                        accion: () => {
                            const nuevo = !modoMantenimiento;
                            setModoMantenimiento(nuevo);
                            handleSaveGenerico({ modoMantenimiento: nuevo });
                        }
                    })}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs uppercase font-black tracking-widest transition-all ${modoMantenimiento
                        ? 'bg-verde/10 border border-verde/30 text-verde hover:bg-verde/20'
                        : 'bg-rojo/10 border border-rojo/20 text-rojo hover:bg-rojo hover:text-blanco'
                        }`}
                >
                    <ShieldAlert size={14} />
                    {modoMantenimiento ? '✓ Desactivar — Publicar Sitio' : 'Activar Modo Mantenimiento'}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Modal Anti-Misclick */}
            <ModalConfirmacion
                open={confirm.open}
                titulo={confirm.titulo}
                descripcion={confirm.descripcion}
                labelConfirm={confirm.label}
                peligroso={confirm.peligroso}
                onConfirm={confirmar}
                onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
            />

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
                            {t.id === 'config' && modoMantenimiento && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-rojo animate-pulse" />
                            )}
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
        </>
    );
}
