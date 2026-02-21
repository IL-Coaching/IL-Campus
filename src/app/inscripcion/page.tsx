"use client"
import { useState } from 'react';
import {
    User,
    Heart,
    Dumbbell,
    Target,
    ClipboardCheck,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Clock,
    Zap,
    AlertTriangle,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import { enviarFormularioInscripcion } from '@/nucleo/acciones/inscripcion.accion';

export default function InscripcionPage() {
    const [step, setStep] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [estadoEnviado, setEstadoEnviado] = useState<'pendiente' | 'exito' | 'error'>('pendiente');

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        // Agrupamos el resto de las respuestas para el JSON
        respuestas: {
            datosPersonales: {
                nacimiento: '',
                edad: '',
                genero: '',
                peso: '',
                altura: '',
                ubicacion: ''
            },
            salud: {
                consentimiento: false,
                condiciones: [] as string[],
                aptoMedico: '',
            },
            estiloVida: {
                ocupacion: '',
                actividad: '',
                sueno: '',
                alimentacion: '',
            },
            experiencia: {
                entrenaActualmente: '',
                tiempoEntrenando: '',
            },
            objetivos: {
                principal: [] as string[],
                motivacion: ''
            },
            logistica: {
                sesionesSemana: '',
                tiempoSesion: '',
                dondeEntrena: '',
                equipamiento: [] as string[]
            },
            personalizacion: {
                noGusta: '',
                notasImportantes: '',
                declaracionFinal: false
            }
        }
    });

    const steps = [
        { title: "Bienvenida", icon: <Zap size={20} /> },
        { title: "Perfil Personal", icon: <User size={20} /> },
        { title: "Salud y Vida", icon: <Heart size={20} /> },
        { title: "Experiencia", icon: <Dumbbell size={20} /> },
        { title: "Objetivos", icon: <Target size={20} /> },
        { title: "Logística", icon: <ClipboardCheck size={20} /> },
        { title: "Finalizar", icon: <CheckCircle2 size={20} /> }
    ];

    const handleSubmit = async () => {
        setEnviando(true);
        const result = await enviarFormularioInscripcion({
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            respuestas: formData.respuestas
        });

        setEnviando(false);
        if (result.exito) {
            setEstadoEnviado('exito');
            setStep(steps.length - 1); // Ir al paso final
        } else {
            setEstadoEnviado('error');
            alert(result.error || "Error al enviar el formulario");
        }
    };

    const nextStep = () => {
        if (step === steps.length - 2) {
            handleSubmit();
        } else {
            setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    // Helpers para actualizar el estado anidado
    const updateNested = (path: string, value: any) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const toggleArray = (path: string, value: string) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            const arr = current[keys[keys.length - 1]] as string[];
            if (arr.includes(value)) {
                current[keys[keys.length - 1]] = arr.filter(v => v !== value);
            } else {
                current[keys[keys.length - 1]] = [...arr, value];
            }
            return newState;
        });
    };

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-naranja/5 rounded-full blur-[120px] -z-10 translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-naranja/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

            <div className="w-full max-w-3xl relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="flex items-center gap-1 mb-4 scale-75 md:scale-100">
                        <div className="w-1 h-5 bg-gris-claro rounded-sm"></div>
                        <div className="w-2 h-7 bg-gris-claro rounded-sm"></div>
                        <span className="text-4xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-2">IL</span>
                        <div className="w-2 h-7 bg-gris-claro rounded-sm"></div>
                        <div className="w-1 h-5 bg-gris-claro rounded-sm"></div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-barlow-condensed font-black uppercase text-blanco tracking-tight">Formulario de Inscripción</h1>
                    <p className="text-gris text-sm mt-2 max-w-lg italic font-medium">&quot;Más que entrenar: entender, adaptar, progresar&quot;</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12 flex justify-between items-center relative px-2">
                    <div className="absolute h-[2px] bg-marino-4 left-0 right-0 top-1/2 -translate-y-1/2 -z-10"></div>
                    <div
                        className="absolute h-[2px] bg-naranja left-0 top-1/2 -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i <= step ? 'bg-marino border-naranja text-naranja shadow-lg shadow-naranja/10' : 'bg-marino border-marino-4 text-gris'
                                }`}>
                                {i < step ? <CheckCircle2 size={18} /> : s.icon}
                            </div>
                            <span className={`hidden md:block absolute -bottom-8 text-[0.6rem] font-bold uppercase tracking-widest whitespace-nowrap ${i <= step ? 'text-blanco' : 'text-gris/40'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="bg-marino-2 border border-marino-4 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-naranja/30 to-transparent"></div>

                    {/* STEP 0: BIENVENIDA */}
                    {step === 0 && (
                        <div className="space-y-8 fade-up visible">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja">¡Bienvenido a IL Coaching!</h2>
                                <p className="text-gris-claro leading-relaxed font-medium">
                                    Este formulario es el primer paso para construir un proceso estructurado y adaptado a vos. Cada respuesta nos permite diseñar una estrategia precisa, alineada con tus objetivos y capacidades.
                                </p>
                                <div className="bg-marino-3 border-l-4 border-l-naranja p-5 rounded-r-xl">
                                    <p className="text-xs font-bold text-naranja uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Importante
                                    </p>
                                    <p className="text-sm text-blanco/80 italic">Tomate unos minutos para completarlo con atención. La calidad de este proceso define la calidad de tus resultados.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-marino-4 pt-8">
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-12 h-12 bg-naranja/10 rounded-full flex items-center justify-center text-naranja mb-3 shadow-inner">
                                        <Zap size={24} />
                                    </div>
                                    <p className="text-[0.65rem] font-black uppercase text-gris tracking-widest">Personalizado</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-12 h-12 bg-naranja/10 rounded-full flex items-center justify-center text-naranja mb-3 shadow-inner">
                                        <Heart size={24} />
                                    </div>
                                    <p className="text-[0.65rem] font-black uppercase text-gris tracking-widest">Basado en Ciencia</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-12 h-12 bg-naranja/10 rounded-full flex items-center justify-center text-naranja mb-3 shadow-inner">
                                        <Dumbbell size={24} />
                                    </div>
                                    <p className="text-[0.65rem] font-black uppercase tracking-widest">Resultados Reales</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: DATOS PERSONALES */}
                    {step === 1 && (
                        <div className="space-y-6 fade-up visible">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <User className="text-blanco" /> Datos Personales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Nombre y Apellido *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20"
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Fecha de Nacimiento *</label>
                                    <input
                                        type="date"
                                        value={formData.respuestas.datosPersonales.nacimiento}
                                        onChange={(e) => updateNested('respuestas.datosPersonales.nacimiento', e.target.value)}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Edad *</label>
                                        <input
                                            type="number"
                                            value={formData.respuestas.datosPersonales.edad}
                                            onChange={(e) => updateNested('respuestas.datosPersonales.edad', e.target.value)}
                                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Género *</label>
                                        <select
                                            value={formData.respuestas.datosPersonales.genero}
                                            onChange={(e) => updateNested('respuestas.datosPersonales.genero', e.target.value)}
                                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Peso (kg) *</label>
                                        <input
                                            type="number"
                                            value={formData.respuestas.datosPersonales.peso}
                                            onChange={(e) => updateNested('respuestas.datosPersonales.peso', e.target.value)}
                                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Altura (cm) *</label>
                                        <input
                                            type="number"
                                            value={formData.respuestas.datosPersonales.altura}
                                            onChange={(e) => updateNested('respuestas.datosPersonales.altura', e.target.value)}
                                            className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <MapPin size={12} /> Ubicación *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.respuestas.datosPersonales.ubicacion}
                                        onChange={(e) => updateNested('respuestas.datosPersonales.ubicacion', e.target.value)}
                                        placeholder="Ciudad, País"
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Phone size={12} /> WhatsApp *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20"
                                        placeholder="+54 9..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail size={12} /> Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SALUD Y VIDA */}
                    {step === 2 && (
                        <div className="space-y-8 fade-up visible">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <Heart className="text-blanco" /> Salud y Estilo de Vida
                            </h2>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Acta de Consentimiento *</label>
                                <div className="space-y-3 bg-marino border border-marino-4 p-5 rounded-xl">
                                    {[
                                        "Entiendo que el entrenamiento implica esfuerzo físico",
                                        "Comprendo los posibles riesgos asociados",
                                        "Me me comprometo a informar cualquier molestia o síntoma",
                                        "Autorizo el uso de mis datos para el diseño del programa"
                                    ].map((texto, i) => (
                                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.respuestas.salud.consentimiento}
                                                onChange={(e) => updateNested('respuestas.salud.consentimiento', e.target.checked)}
                                                className="mt-1 accent-naranja h-4 w-4 rounded border-marino-4"
                                            />
                                            <span className="text-xs text-gris-claro group-hover:text-blanco transition-colors">{texto}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Tenés o tuviste alguna de estas condiciones? *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Hipertensión", "Diabetes", "Prob. Cardíacos", "Asma", "Lesiones Musc.", "Pie Plano/Arqueado"].map((cond) => (
                                        <label key={cond} className="bg-marino border border-marino-4 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-naranja/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.respuestas.salud.condiciones.includes(cond)}
                                                onChange={() => toggleArray('respuestas.salud.condiciones', cond)}
                                                className="accent-naranja h-4 w-4"
                                            />
                                            <span className="text-xs text-blanco font-medium">{cond}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-marino-4">
                                <div className="space-y-4">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Actividad Diaria *</label>
                                    <div className="flex flex-col gap-2">
                                        {["Sedentario", "Activo", "Muy Variado"].map((opc) => (
                                            <label key={opc} className="flex items-center gap-3 p-3 bg-marino rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="actividad"
                                                    checked={formData.respuestas.estiloVida.actividad === opc}
                                                    onChange={() => updateNested('respuestas.estiloVida.actividad', opc)}
                                                    className="accent-naranja"
                                                />
                                                <span className="text-xs font-bold text-gris-claro">{opc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Horas de Sueño *</label>
                                    <div className="flex flex-col gap-2">
                                        {["1 a 4 hs", "5 a 6 hs", "7 a 8 hs", "Más de 8 hs"].map((opc) => (
                                            <label key={opc} className="flex items-center gap-3 p-3 bg-marino rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="sueno"
                                                    checked={formData.respuestas.estiloVida.sueno === opc}
                                                    onChange={() => updateNested('respuestas.estiloVida.sueno', opc)}
                                                    className="accent-naranja"
                                                />
                                                <span className="text-xs font-bold text-gris-claro">{opc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EXPERIENCIA Y OBJETIVOS */}
                    {step === 3 && (
                        <div className="space-y-8 fade-up visible">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <Dumbbell className="text-blanco" /> Experiencia y Objetivos
                            </h2>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Entrenás actualmente? *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Sí, frecuentemente", "Sí, a veces", "No, hace tiempo", "Nunca"].map((opc) => (
                                        <label key={opc} className="bg-marino border border-marino-4 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-naranja/50 transition-colors">
                                            <input
                                                type="radio"
                                                name="entrena"
                                                checked={formData.respuestas.experiencia.entrenaActualmente === opc}
                                                onChange={() => updateNested('respuestas.experiencia.entrenaActualmente', opc)}
                                                className="accent-naranja"
                                            />
                                            <span className="text-xs text-blanco font-bold">{opc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Objetivos Principales (Seleccioná varios) *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { l: "Fuerza", i: <Zap size={14} /> },
                                        { l: "Hipertrofia", i: <Dumbbell size={14} /> },
                                        { l: "Pérdida Grasa", i: <Zap size={14} /> },
                                        { l: "Salud", i: <Heart size={14} /> }
                                    ].map((obj) => (
                                        <label key={obj.l} className="flex flex-col items-center gap-2 p-4 bg-marino border border-marino-4 rounded-xl cursor-pointer hover:border-naranja transition-all group">
                                            <div className="text-gris group-hover:text-naranja transition-colors">{obj.i}</div>
                                            <input
                                                type="checkbox"
                                                checked={formData.respuestas.objetivos.principal.includes(obj.l)}
                                                onChange={() => toggleArray('respuestas.objetivos.principal', obj.l)}
                                                className="accent-naranja"
                                            />
                                            <span className="text-[0.6rem] font-black uppercase tracking-tighter text-gris-claro">{obj.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Qué te motiva realmente a empezar hoy? (Opcional)</label>
                                <textarea
                                    value={formData.respuestas.objetivos.motivacion}
                                    onChange={(e) => updateNested('respuestas.objetivos.motivacion', e.target.value)}
                                    className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all h-24 resize-none"
                                    placeholder="Contanos tu para qué..."
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: LOGÍSTICA Y EQUIPO */}
                    {step === 4 && (
                        <div className="space-y-8 fade-up visible">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <Clock className="text-blanco" /> Logística y Disponibilidad
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Sesiones por semana *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[2, 3, 4, 5, 6].map(num => (
                                            <label key={num} className="bg-marino border border-marino-4 p-3 rounded-lg flex items-center justify-center cursor-pointer hover:border-naranja">
                                                <input
                                                    type="radio"
                                                    name="sesiones"
                                                    checked={formData.respuestas.logistica.sesionesSemana === num.toString()}
                                                    onChange={() => updateNested('respuestas.logistica.sesionesSemana', num.toString())}
                                                    className="hidden peer"
                                                />
                                                <span className="text-sm font-black text-gris-claro peer-checked:text-naranja">{num}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Tiempo por sesión *</label>
                                    <select
                                        value={formData.respuestas.logistica.tiempoSesion}
                                        onChange={(e) => updateNested('respuestas.logistica.tiempoSesion', e.target.value)}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco outline-none"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="45min">45 min</option>
                                        <option value="60min">60 min (Ideal)</option>
                                        <option value="90min">90 min</option>
                                        <option value="+2hs">+2 hs</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Dónde vas a entrenar? *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["Gimnasio Comercial", "Home Gym / Casa", "Parque / Aire Libre"].map(lugar => (
                                        <label key={lugar} className="bg-marino border border-marino-4 p-4 rounded-xl flex flex-col items-center text-center gap-2 cursor-pointer hover:border-naranja">
                                            <input
                                                type="radio"
                                                name="lugar"
                                                checked={formData.respuestas.logistica.dondeEntrena === lugar}
                                                onChange={() => updateNested('respuestas.logistica.dondeEntrena', lugar)}
                                                className="accent-naranja"
                                            />
                                            <span className="text-[0.65rem] font-bold text-gris-claro uppercase">{lugar}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">Equipamiento disponible (Seleccionar)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {["Mancuernas", "Barra Olímpica", "Máquinas Polea", "Bandas Elásticas", "Kettlebells", "Peso Corporal"].map(eq => (
                                        <label key={eq} className="flex items-center gap-3 p-3 bg-marino border border-marino-4 rounded-lg cursor-pointer hover:bg-marino-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.respuestas.logistica.equipamiento.includes(eq)}
                                                onChange={() => toggleArray('respuestas.logistica.equipamiento', eq)}
                                                className="accent-naranja"
                                            />
                                            <span className="text-[0.7rem] font-medium text-blanco/80">{eq}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: PERSONALIZACIÓN AVANZADA */}
                    {step === 5 && (
                        <div className="space-y-8 fade-up visible">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <ClipboardCheck className="text-blanco" /> Personalización Avanzada
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Qué ejercicios NO te gusta hacer? (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.respuestas.personalizacion.noGusta}
                                        onChange={(e) => updateNested('respuestas.personalizacion.noGusta', e.target.value)}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none"
                                        placeholder="Ej: No me gusta hacer estocadas..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1">¿Algo importante que deba saber?</label>
                                    <textarea
                                        value={formData.respuestas.personalizacion.notasImportantes}
                                        onChange={(e) => updateNested('respuestas.personalizacion.notasImportantes', e.target.value)}
                                        className="w-full bg-marino border border-marino-4 rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none h-24 resize-none"
                                        placeholder="Algun detalle adicional..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="bg-marino shadow-inner p-6 rounded-2xl border border-naranja/20">
                                <label className="flex items-start gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.respuestas.personalizacion.declaracionFinal}
                                        onChange={(e) => updateNested('respuestas.personalizacion.declaracionFinal', e.target.checked)}
                                        className="mt-1 h-5 w-5 accent-naranja shrink-0"
                                    />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase text-blanco tracking-widest">Declaración Final *</p>
                                        <p className="text-[0.65rem] text-gris-claro leading-relaxed">
                                            Confirmo que la información brindada es verídica y me comprometo a informar cualquier cambio relevante en mi estado de salud durante el proceso.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: FINALIZAR */}
                    {step === 6 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 fade-up visible">
                            {estadoEnviado === 'exito' ? (
                                <>
                                    <CheckCircle2 size={48} className="text-[#22C55E] mb-4" />
                                    <p className="text-xl font-black uppercase text-blanco font-barlow-condensed tracking-tight">¡Formulario Recibido!</p>
                                    <p className="text-sm text-gris max-w-xs mx-auto">Iñaki Legarreta ya tiene tu perfil. Se pondrá en contacto con vos pronto para comenzar.</p>
                                    <Link href="/" className="mt-4 text-naranja text-[0.65rem] font-black uppercase tracking-[0.2em] border-b border-naranja/30 pb-1">Volver al inicio</Link>
                                </>
                            ) : (
                                <>
                                    <Zap size={48} className="text-naranja mb-4 animate-pulse" />
                                    <p className="text-sm font-medium text-blanco">Revisá tus respuestas antes de enviar.</p>
                                    <p className="text-xs text-gris mt-1">Al confirmar, Iñaki recibirá toda tu información.</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-auto pt-10 flex justify-between gap-4">
                        <button
                            onClick={prevStep}
                            disabled={step === 0 || enviando || estadoEnviado === 'exito'}
                            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${step === 0 || estadoEnviado === 'exito' ? 'opacity-0 pointer-events-none' : 'bg-marino-3 text-gris hover:text-blanco border border-marino-4 hover:border-gris'
                                }`}
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        <button
                            onClick={nextStep}
                            disabled={enviando || estadoEnviado === 'exito'}
                            className="flex-1 md:flex-none md:min-w-[180px] bg-naranja hover:bg-naranja-h disabled:opacity-50 text-marino font-black py-4 px-8 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest font-barlow-condensed text-lg transition-all shadow-lg shadow-naranja/20 active:scale-95"
                        >
                            {enviando ? (
                                <span className="flex items-center gap-2">Procesando...</span>
                            ) : (
                                step === steps.length - 2 ? 'Enviar Formulario' : (
                                    <>Siguiente <ChevronRight size={20} /></>
                                )
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-[0.65rem] text-gris/40 font-bold uppercase tracking-[0.4em]">
                    Powered by IL-COACHING CORE SYSTEM
                </div>
            </div>
        </main>
    );
}
