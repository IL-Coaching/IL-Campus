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
    ShieldCheck,
    Zap,
    AlertTriangle,
    MapPin,
    Phone,
    Mail,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { enviarFormularioInscripcion } from '@/nucleo/acciones/inscripcion.accion';
import {
    EsquemaDatosPersonales,
    EsquemaEstiloDeVida,
    EsquemaSaludMedica,
    EsquemaExperiencia,
    EsquemaObjetivos,
    EsquemaDisponibilidad,
    EsquemaConsentimiento,
} from '@/nucleo/validadores/inscripcion.validador';

export default function InscripcionPage() {
    const [step, setStep] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [estadoEnviado, setEstadoEnviado] = useState<'pendiente' | 'exito' | 'error'>('pendiente');
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [mostrarErrores, setMostrarErrores] = useState(false);

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
            saludMedica: {
                condiciones: [] as string[],
                otrasCondiciones: '',
                aptoMedico: '',
            },
            estiloDeVida: {
                ocupacion: '',
                actividad: '',
                sueno: '',
                alimentacion: '',
                otraActividadFisica: '',
            },
            experiencia: {
                entrenaActualmente: '',
                tiempo: '',
            },
            objetivos: {
                principales: [] as string[],
                motivacion: ''
            },
            disponibilidad: {
                sesionesSemanales: '',
                tiempoSesion: '',
                lugar: [] as string[],
                equipamiento: [] as string[]
            },
            personalizacion: {
                noGusta: '',
                notas: ''
            },
            consentimiento: {
                aceptado: false,
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

    const validarStep = (stepIndex: number): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (stepIndex === 1) {
            const datos = {
                nombre: formData.nombre,
                email: formData.email,
                telefono: formData.telefono,
                nacimiento: formData.respuestas.datosPersonales.nacimiento,
                edad: formData.respuestas.datosPersonales.edad,
                genero: formData.respuestas.datosPersonales.genero,
                peso: formData.respuestas.datosPersonales.peso,
                altura: formData.respuestas.datosPersonales.altura,
                ubicacion: formData.respuestas.datosPersonales.ubicacion,
            };
            const resultado = EsquemaDatosPersonales.safeParse(datos);
            if (!resultado.success) {
                resultado.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
        }
        
        if (stepIndex === 2) {
            const datos = {
                actividad: formData.respuestas.estiloDeVida.actividad,
                sueno: formData.respuestas.estiloDeVida.sueno,
                otraActividadFisica: formData.respuestas.estiloDeVida.otraActividadFisica,
            };
            const resultado = EsquemaEstiloDeVida.safeParse(datos);
            if (!resultado.success) {
                resultado.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
        }
        
        if (stepIndex === 3) {
            const datos = {
                condiciones: formData.respuestas.saludMedica.condiciones,
                otrasCondiciones: formData.respuestas.saludMedica.otrasCondiciones,
                aptoMedico: formData.respuestas.saludMedica.aptoMedico,
            };
            const resultado = EsquemaSaludMedica.safeParse(datos);
            if (!resultado.success) {
                resultado.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
        }
        
        if (stepIndex === 4) {
            const datos = {
                entrenaActualmente: formData.respuestas.experiencia.entrenaActualmente,
                tiempo: formData.respuestas.experiencia.tiempo,
            };
            const resultado = EsquemaExperiencia.safeParse(datos);
            if (!resultado.success) {
                resultado.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
            
            const objetivos = {
                principales: formData.respuestas.objetivos.principales,
                motivacion: formData.respuestas.objetivos.motivacion,
            };
            const resultObj = EsquemaObjetivos.safeParse(objetivos);
            if (!resultObj.success) {
                resultObj.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
        }
        
        if (stepIndex === 5) {
            const datos = {
                sesionesSemanales: formData.respuestas.disponibilidad.sesionesSemanales,
                tiempoSesion: formData.respuestas.disponibilidad.tiempoSesion,
                lugar: formData.respuestas.disponibilidad.lugar,
                equipamiento: formData.respuestas.disponibilidad.equipamiento,
            };
            const resultado = EsquemaDisponibilidad.safeParse(datos);
            if (!resultado.success) {
                resultado.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
            
            const consentimiento = {
                aceptado: formData.respuestas.consentimiento.aceptado,
                declaracionFinal: formData.respuestas.consentimiento.declaracionFinal,
            };
            const resultCons = EsquemaConsentimiento.safeParse(consentimiento);
            if (!resultCons.success) {
                resultCons.error.issues.forEach(issue => {
                    nuevosErrores[issue.path[0] as string] = issue.message;
                });
            }
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

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

    const clearError = (key: string) => {
        const newErrors = { ...errores };
        delete newErrors[key];
        setErrores(newErrors);
    };

    const nextStep = () => {
        if (!validarStep(step)) {
            setMostrarErrores(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setMostrarErrores(false);
        setErrores({});
        
        if (step === steps.length - 2) {
            handleSubmit();
        } else {
            setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    // Helpers para actualizar el estado de forma inmutable y segura
    type ValorFormulario = string | number | boolean | string[];

    const updateNested = (path: string, value: ValorFormulario) => {
        setFormData(prev => {
            // Clonado profundo para asegurar inmutabilidad en estructuras complejas
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let currentLine = next as Record<string, unknown>; // Travesía dinámica segura de objeto anidado

            for (let i = 0; i < keys.length - 1; i++) {
                if (!currentLine[keys[i]]) currentLine[keys[i]] = {};
                currentLine = currentLine[keys[i]] as Record<string, unknown>;
            }

            currentLine[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const toggleArray = (path: string, value: string) => {
        setFormData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let currentLine = next as Record<string, unknown>;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!currentLine[keys[i]]) currentLine[keys[i]] = {};
                currentLine = currentLine[keys[i]] as Record<string, unknown>;
            }

            const lastKey = keys[keys.length - 1];
            const arr = (currentLine[lastKey] || []) as string[];

            if (arr.includes(value)) {
                currentLine[lastKey] = arr.filter(v => v !== value);
            } else {
                currentLine[lastKey] = [...arr, value];
            }

            return next;
        });
    };

    // Renderizadores de pasos individuales para limpieza de código (Principio ArchSecure AI)
    const renderStep2 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block tracking-[0.2em] flex flex-col">
                    <span>Nivel de Actividad Diaria *</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Referencia para gasto calórico base</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { val: 'Sedentario', desc: 'Sentado gran parte del día (Ej: Oficina)' },
                        { val: 'Ligeramente Activo', desc: 'De pie o camina parte del día (Ej: Ventas)' },
                        { val: 'Activo', desc: 'Constante movimiento (Ej: Mozo, Repositor)' },
                        { val: 'Muy Activo', desc: 'Trabajo físico pesado (Ej: Construcción)' }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => { updateNested('respuestas.estiloDeVida.actividad', opt.val); clearError('actividad') }}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.respuestas.estiloDeVida.actividad === opt.val
                                ? 'bg-naranja/10 border-naranja shadow-[0_0_20px_rgba(255,107,0,0.1)]'
                                : 'bg-marino-3 border-marino-4 hover:border-naranja/30'
                                }`}
                        >
                            <p className={`text-xs font-black uppercase tracking-widest ${formData.respuestas.estiloDeVida.actividad === opt.val ? 'text-naranja' : 'text-blanco'}`}>{opt.val}</p>
                            <p className="text-[0.65rem] text-gris font-medium mt-1">{opt.desc}</p>
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.actividad && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.actividad}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block tracking-[0.2em] flex flex-col">
                    <span>Horas de Sueño Promedio *</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Clave para la recuperación muscular</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {['Menos de 6hs', '6 a 7 hs', '7 a 8 hs', 'Más de 8 hs'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { updateNested('respuestas.estiloDeVida.sueno', opt); clearError('sueno') }}
                            className={`px-4 py-3 rounded-xl border text-[0.65rem] font-black uppercase tracking-widest transition-all ${formData.respuestas.estiloDeVida.sueno === opt
                                ? 'bg-naranja border-naranja text-marino'
                                : 'bg-marino-3 border-marino-4 text-gris'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.sueno && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.sueno}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block tracking-[0.2em] flex flex-col">
                    <span>¿Realizas otra actividad física aparte? (Opcional)</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Ayuda a evitar fatiga excesiva</span>
                </label>
                <input
                    type="text"
                    value={formData.respuestas.estiloDeVida.otraActividadFisica || ''}
                    onChange={(e) => updateNested('respuestas.estiloDeVida.otraActividadFisica', e.target.value)}
                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all placeholder:text-gris/40 font-medium"
                    placeholder="Ej: Fútbol los martes, boxeo dos veces por semana, etc."
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block flex flex-col">
                    <span>Condiciones Médicas y Medicación (Opcional)</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Vital para tu seguridad y ajuste biomecánico</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Asma', 'Diabetes', 'Hipertensión', 'Lesiones previas', 'Cirugías recientes', 'Escoliosis', 'Cifosis', 'Ninguna'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleArray('respuestas.saludMedica.condiciones', opt)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.respuestas.saludMedica.condiciones.includes(opt)
                                ? 'bg-naranja/20 border-naranja text-blanco'
                                : 'bg-marino-3 border-marino-4 text-gris hover:border-naranja/50'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.respuestas.saludMedica.condiciones.includes(opt) ? 'bg-naranja border-naranja' : 'border-marino-4'}`}>
                                {formData.respuestas.saludMedica.condiciones.includes(opt) && <CheckCircle2 size={12} className="text-marino" />}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight">{opt}</span>
                        </button>
                    ))}
                </div>
                <div className="space-y-2 mt-4">
                    <label className="text-[0.65rem] font-black text-gris uppercase tracking-widest ml-1">Otra condición o medicación</label>
                    <input
                        type="text"
                        value={formData.respuestas.saludMedica.otrasCondiciones}
                        onChange={(e) => updateNested('respuestas.saludMedica.otrasCondiciones', e.target.value)}
                        className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all"
                        placeholder="Especificar aquí..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block flex flex-col">
                    <span>¿Tienes apto médico vigente? *</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Protocolo preventivo obligatorio</span>
                </label>
                <div className="flex gap-4">
                    {['Sí', 'No', 'En trámite'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { updateNested('respuestas.saludMedica.aptoMedico', opt); clearError('aptoMedico') }}
                            className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[0.65rem] transition-all ${formData.respuestas.saludMedica.aptoMedico === opt
                                ? 'bg-naranja border-naranja text-marino'
                                : 'bg-marino-3 border-marino-4 text-gris hover:border-naranja/50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.aptoMedico && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.aptoMedico}
                    </p>
                )}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                <Dumbbell className="text-blanco" /> Experiencia y Objetivos
            </h2>

            <div className="space-y-4">
                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                    <span>¿Entrenás actualmente? *</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Define tu punto de partida metabólico</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Sí, frecuentemente", "Sí, a veces", "No, hace tiempo", "Nunca"].map((opc) => (
                        <button
                            key={opc}
                            onClick={() => { updateNested('respuestas.experiencia.entrenaActualmente', opc); clearError('entrenaActualmente') }}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.respuestas.experiencia.entrenaActualmente === opc ? 'bg-naranja/10 border-naranja' : 'bg-marino-3 border-marino-4 hover:border-naranja/30'}`}
                        >
                            <span className={`text-xs font-black uppercase tracking-widest ${formData.respuestas.experiencia.entrenaActualmente === opc ? 'text-naranja' : 'text-blanco'}`}>{opc}</span>
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.entrenaActualmente && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.entrenaActualmente}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                    <span>Objetivos Principales *</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Alinea la selección de ejercicios y volumen total</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Salud/Bienestar', 'Rendimiento'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { toggleArray('respuestas.objetivos.principales', opt); clearError('principales') }}
                            className={`p-3 rounded-xl border transition-all ${formData.respuestas.objetivos.principales.includes(opt) ? 'bg-naranja/20 border-naranja text-blanco' : 'bg-marino-3 border-marino-4 text-gris'}`}
                        >
                            <span className="text-[0.65rem] font-black uppercase tracking-tight">{opt}</span>
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.principales && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.principales}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-1 block flex flex-col">
                    <span>¿Qué te motiva a empezar hoy? (Opcional)</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Tu &quot;por qué&quot; nos ayuda a conectar con tu proceso</span>
                </label>
                <textarea
                    value={formData.respuestas.objetivos.motivacion}
                    onChange={(e) => updateNested('respuestas.objetivos.motivacion', e.target.value)}
                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none transition-all resize-none h-24"
                    placeholder="Tu por qué..."
                ></textarea>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                <ClipboardCheck className="text-blanco" /> Logística y Disponibilidad
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-1 block flex flex-col">
                        <span>Sesiones Semanales *</span>
                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Diseño realista según tu tiempo</span>
                    </label>
                    <select
                        value={formData.respuestas.disponibilidad.sesionesSemanales}
                        onChange={(e) => { updateNested('respuestas.disponibilidad.sesionesSemanales', e.target.value); clearError('sesionesSemanales'); }}
                        className={`w-full bg-marino-3 border rounded-xl px-4 py-3 text-blanco text-xs focus:border-naranja/50 outline-none transition-all cursor-pointer ${mostrarErrores && errores.sesionesSemanales ? 'border-red-500' : 'border-marino-4'}`}
                    >
                        <option value="">Seleccionar</option>
                        <option value="1-2">1 a 2 días</option>
                        <option value="3">3 días</option>
                        <option value="4">4 días</option>
                        <option value="5+">5 o más días</option>
                    </select>
                    {mostrarErrores && errores.sesionesSemanales && (
                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                            <XCircle size={12} /> {errores.sesionesSemanales}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-1 block flex flex-col">
                        <span>Tiempo por Sesión *</span>
                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Optimización por ventana de tiempo</span>
                    </label>
                    <select
                        value={formData.respuestas.disponibilidad.tiempoSesion}
                        onChange={(e) => { updateNested('respuestas.disponibilidad.tiempoSesion', e.target.value); clearError('tiempoSesion'); }}
                        className={`w-full bg-marino-3 border rounded-xl px-4 py-3 text-blanco text-xs focus:border-naranja/50 outline-none transition-all cursor-pointer ${mostrarErrores && errores.tiempoSesion ? 'border-red-500' : 'border-marino-4'}`}
                    >
                        <option value="">Seleccionar</option>
                        <option value="45min">~45 min</option>
                        <option value="60min">~60 min</option>
                        <option value="90min+">90 min o más</option>
                    </select>
                    {mostrarErrores && errores.tiempoSesion && (
                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                            <XCircle size={12} /> {errores.tiempoSesion}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-2 block flex flex-col">
                    <span>¿Dónde entrenarás? * (Elegir uno o más)</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Adaptación según equipamiento accesible</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['Gimnasio', 'Casa', 'Parque', 'Sin Equipo'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { toggleArray('respuestas.disponibilidad.lugar', opt); clearError('lugar') }}
                            className={`p-3 rounded-xl border text-[0.65rem] font-black uppercase tracking-widest transition-all ${formData.respuestas.disponibilidad.lugar.includes(opt) ? 'bg-naranja border-naranja text-marino' : 'bg-marino-3 border-marino-4 text-gris'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {mostrarErrores && errores.lugar && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
                        <XCircle size={12} /> {errores.lugar}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-naranja uppercase tracking-widest mb-1 block flex flex-col">
                    <span>Personalización y Notas (Opcional)</span>
                    <span className="text-[0.55rem] text-gris lowercase font-medium italic">Cualquier detalle extra que debamos saber</span>
                </label>
                <textarea
                    value={formData.respuestas.personalizacion.notas}
                    onChange={(e) => updateNested('respuestas.personalizacion.notas', e.target.value)}
                    className="w-full bg-marino-3 border border-marino-4 rounded-xl px-4 py-3 text-blanco text-sm focus:border-naranja/50 outline-none h-24 resize-none"
                    placeholder="Cualquier otra información..."
                ></textarea>
            </div>

            <div className="p-4 bg-marino-3 border-l-4 border-l-naranja rounded-r-xl">
                <button
                    onClick={() => { updateNested('respuestas.consentimiento.declaracionFinal', !formData.respuestas.consentimiento.declaracionFinal); clearError('declaracionFinal') }}
                    className="flex items-start gap-3 text-left w-full"
                >
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${mostrarErrores && errores.declaracionFinal ? 'border-red-500' : formData.respuestas.consentimiento.declaracionFinal ? 'bg-naranja border-naranja' : 'border-marino-4'}`}>
                        {formData.respuestas.consentimiento.declaracionFinal && <CheckCircle2 size={12} className="text-marino" />}
                    </div>
                    <div>
                        <p className="text-[0.6rem] font-bold text-blanco uppercase tracking-widest leading-relaxed">
                            Declaro que la información es fidedigna y estoy apto para realizar actividad física.
                        </p>
                    </div>
                </button>
                {mostrarErrores && errores.declaracionFinal && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-2 ml-8">
                        <XCircle size={12} /> {errores.declaracionFinal}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-marino flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-naranja/5 rounded-full blur-[120px] -z-10 translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-naranja/5 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4"></div>

            <div className="w-full max-w-3xl relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6 md:mb-10">
                    <div className="flex items-center gap-1 mb-2 scale-75 md:scale-100">
                        <div className="w-0.5 h-4 bg-gris-claro rounded-sm"></div>
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        <span className="text-3xl md:text-4xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter mx-2">IL</span>
                        <div className="w-1.5 h-6 bg-gris-claro rounded-sm"></div>
                        <div className="w-0.5 h-4 bg-gris-claro rounded-sm"></div>
                    </div>
                    <h1 className="text-xl md:text-3xl font-barlow-condensed font-black uppercase text-blanco tracking-tight">Inscripción</h1>
                    <p className="text-gris text-[0.7rem] md:text-sm mt-1 max-w-lg italic font-medium opacity-80 px-4">&quot;Más que entrenar: entender, adaptar, progresar&quot;</p>
                </div>

                {/* Progress Bar - Optimized for Mobile */}
                <div className="mb-8 md:mb-12 flex justify-between items-center relative px-2">
                    <div className="absolute h-[2px] bg-marino-4 left-0 right-0 top-1/2 -translate-y-1/2 -z-10"></div>
                    <div
                        className="absolute h-[2px] bg-naranja left-0 top-1/2 -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center group">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i <= step ? 'bg-marino border-naranja text-naranja shadow-lg shadow-naranja/10' : 'bg-marino border-marino-4 text-gris/40'
                                }`}>
                                {i < step ? <CheckCircle2 size={16} /> : (
                                    <span className="md:block scale-75 md:scale-100">{s.icon}</span>
                                )}
                            </div>
                            <span className={`hidden md:block absolute -bottom-8 text-[0.6rem] font-bold uppercase tracking-widest whitespace-nowrap ${i <= step ? 'text-blanco' : 'text-gris/40'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="bg-marino-2 border border-marino-4 rounded-[2rem] md:rounded-3xl p-5 md:p-10 shadow-2xl relative overflow-hidden min-h-[400px] md:min-h-[500px] flex flex-col mb-24 md:mb-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-naranja/30 to-transparent"></div>

                    {/* STEP 0: BIENVENIDA */}
                    {step === 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja">¡Bienvenido a IL Coaching!</h2>
                                <p className="text-gris-claro leading-relaxed font-medium">
                                    Este formulario es el primer paso para construir un proceso estructurado y adaptado a vos. Cada respuesta nos permite diseñar una estrategia precisa, alineada con tus objetivos y capacidades.
                                </p>
                                <div className="bg-marino-3 border-l-4 border-l-naranja p-5 rounded-r-xl space-y-3">
                                    <p className="text-xs font-bold text-naranja uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Privacidad y Uso de Datos
                                    </p>
                                    <p className="text-[0.7rem] text-blanco/80 italic leading-relaxed">
                                        Tus datos son tratados de forma estrictamente confidencial. Los utilizamos exclusivamente para diseñar tu plan de entrenamiento y salud, basándonos en criterios científicos para garantizar tu seguridad y progreso.
                                    </p>
                                    <div className="flex items-center gap-2 pt-2 border-t border-marino-4">
                                        <AlertTriangle size={14} className="text-naranja" />
                                        <p className="text-[0.65rem] text-gris font-medium">Campos con <span className="text-naranja">*</span> son obligatorios para poder avanzar.</p>
                                    </div>
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <User className="text-blanco" /> Datos Personales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                                        <span>Nombre y Apellido *</span>
                                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Uso: Identificación y contacto</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => { setFormData({ ...formData, nombre: e.target.value }); clearError('nombre'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20 ${mostrarErrores && errores.nombre ? 'border-red-500' : 'border-marino-4'}`}
                                            placeholder="Tu nombre completo"
                                        />
                                        {mostrarErrores && errores.nombre && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 text-xs font-bold">
                                                <XCircle size={14} />
                                            </div>
                                        )}
                                    </div>
                                    {mostrarErrores && errores.nombre && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <XCircle size={12} /> {errores.nombre}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                                        <span>Fecha de Nacimiento *</span>
                                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Meta: Perfil biológico</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.respuestas.datosPersonales.nacimiento}
                                            onChange={(e) => { updateNested('respuestas.datosPersonales.nacimiento', e.target.value); clearError('nacimiento'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all ${mostrarErrores && errores.nacimiento ? 'border-red-500' : 'border-marino-4'}`}
                                        />
                                        {mostrarErrores && errores.nacimiento && (
                                            <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <XCircle size={12} /> {errores.nacimiento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                                            <span>Edad *</span>
                                            <span className="text-[0.5rem] text-gris font-medium italic lowercase">Ajuste de carga</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.respuestas.datosPersonales.edad}
                                                onChange={(e) => { updateNested('respuestas.datosPersonales.edad', e.target.value); clearError('edad'); }}
                                                className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all ${mostrarErrores && errores.edad ? 'border-red-500' : 'border-marino-4'}`}
                                            />
                                        </div>
                                        {mostrarErrores && errores.edad && (
                                            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                                <XCircle size={12} /> {errores.edad}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                                            <span>Género *</span>
                                            <span className="text-[0.5rem] text-gris font-medium italic lowercase">Factores hormonales</span>
                                        </label>
                                        <select
                                            value={formData.respuestas.datosPersonales.genero}
                                            onChange={(e) => updateNested('respuestas.datosPersonales.genero', e.target.value)}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all appearance-none cursor-pointer ${mostrarErrores && errores.genero ? 'border-red-500' : 'border-marino-4'}`}
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                        {mostrarErrores && errores.genero && (
                                            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                                <XCircle size={12} /> {errores.genero}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                                            <span>Peso (kg) *</span>
                                            <span className="text-[0.5rem] text-gris font-medium italic lowercase">Calc. nutricional</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.respuestas.datosPersonales.peso}
                                            onChange={(e) => { updateNested('respuestas.datosPersonales.peso', e.target.value); clearError('peso'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all ${mostrarErrores && errores.peso ? 'border-red-500' : 'border-marino-4'}`}
                                        />
                                        {mostrarErrores && errores.peso && (
                                            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                                <XCircle size={12} /> {errores.peso}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex flex-col">
                                            <span>Altura (cm) *</span>
                                            <span className="text-[0.5rem] text-gris font-medium italic lowercase">Composición corp.</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.respuestas.datosPersonales.altura}
                                            onChange={(e) => { updateNested('respuestas.datosPersonales.altura', e.target.value); clearError('altura'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all ${mostrarErrores && errores.altura ? 'border-red-500' : 'border-marino-4'}`}
                                        />
                                        {mostrarErrores && errores.altura && (
                                            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                                <XCircle size={12} /> {errores.altura}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><MapPin size={12} /> Ubicación *</span>
                                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Coord. de zona horaria</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.respuestas.datosPersonales.ubicacion}
                                            onChange={(e) => { updateNested('respuestas.datosPersonales.ubicacion', e.target.value); clearError('ubicacion'); }}
                                            placeholder="Ciudad, País"
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20 ${mostrarErrores && errores.ubicacion ? 'border-red-500' : 'border-marino-4'}`}
                                        />
                                    </div>
                                    {mostrarErrores && errores.ubicacion && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <XCircle size={12} /> {errores.ubicacion}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Phone size={12} /> WhatsApp *</span>
                                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Seguimiento semanal</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => { setFormData({ ...formData, telefono: e.target.value }); clearError('telefono'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20 ${mostrarErrores && errores.telefono ? 'border-red-500' : 'border-marino-4'}`}
                                            placeholder="+54 9..."
                                        />
                                    </div>
                                    {mostrarErrores && errores.telefono && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <XCircle size={12} /> {errores.telefono}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] text-naranja font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Mail size={12} /> Email *</span>
                                        <span className="text-[0.55rem] text-gris lowercase font-medium italic">Envío de rutina</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError('email'); }}
                                            className={`w-full bg-marino border rounded-xl px-4 py-4 text-blanco focus:border-naranja outline-none transition-all placeholder:text-gris/20 ${mostrarErrores && errores.email ? 'border-red-500' : 'border-marino-4'}`}
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                    {mostrarErrores && errores.email && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <XCircle size={12} /> {errores.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ESTILO DE VIDA */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <Heart className="text-blanco" /> Estilo de Vida
                            </h2>
                            {renderStep2()}
                        </div>
                    )}

                    {/* STEP 3: SALUD Y CONDICIONES */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-barlow-condensed font-black uppercase text-naranja mb-6 flex items-center gap-3">
                                <ShieldCheck className="text-blanco" /> Salud y Condiciones
                            </h2>
                            {renderStep3()}
                        </div>
                    )}

                    {/* STEP 4: EXPERIENCIA Y OBJETIVOS */}
                    {step === 4 && renderStep4()}

                    {/* STEP 5: LOGÍSTICA */}
                    {step === 5 && renderStep5()}

                    {/* STEP 6: FINALIZAR */}
                    {step === 6 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
                            {estadoEnviado === 'exito' ? (
                                <>
                                    <div className="p-6 bg-green-500/10 rounded-full">
                                        <CheckCircle2 size={64} className="text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco">¡Formulario Enviado!</h2>
                                    <p className="text-gris max-w-sm mx-auto font-medium">Iñaki ya recibió tu perfil. Se pondrá en contacto con vos pronto para comenzar tu proceso.</p>
                                    <Link href="/" className="px-8 py-3 bg-marino-3 border border-marino-4 text-blanco rounded-xl font-black uppercase tracking-widest text-xs hover:border-naranja transition-all mt-4">
                                        Volver al Inicio
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="p-6 bg-naranja/10 rounded-full animate-pulse">
                                        <Target size={64} className="text-naranja" />
                                    </div>
                                    <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco">¿Todo listo?</h2>
                                    <p className="text-gris max-w-sm mx-auto font-medium">Al presionar &quot;Enviar&quot;, tus respuestas se guardarán en tu perfil de cliente para que tu coach pueda revisarlas.</p>
                                    {estadoEnviado === 'error' && (
                                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20 w-full mb-4">
                                            Hubo un error al enviar. Por favor, reintenta.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons - Sticky on Mobile */}
                    <div className="mt-auto pt-10 flex justify-between gap-4 fixed bottom-0 left-0 right-0 p-4 bg-marino-2/80 backdrop-blur-md border-t border-marino-4 md:relative md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none z-50">
                        <button
                            onClick={prevStep}
                            disabled={step === 0 || enviando || estadoEnviado === 'exito'}
                            className={`flex items-center gap-2 px-5 py-3 md:px-6 md:py-4 rounded-xl font-bold uppercase tracking-widest text-[0.65rem] transition-all ${step === 0 || estadoEnviado === 'exito' ? 'opacity-0 pointer-events-none' : 'bg-marino-3 text-gris hover:text-blanco border border-marino-4 hover:border-gris shadow-lg'
                                }`}
                        >
                            <ChevronLeft size={16} /> <span className="hidden md:inline">Anterior</span>
                        </button>

                        <button
                            onClick={nextStep}
                            disabled={enviando || estadoEnviado === 'exito'}
                            className="flex-1 md:flex-none md:min-w-[200px] bg-naranja hover:bg-naranja-h disabled:opacity-50 text-marino font-black py-3 md:py-4 px-6 md:px-8 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest font-barlow-condensed text-base md:text-lg transition-all shadow-xl shadow-naranja/20 active:scale-95"
                        >
                            {enviando ? (
                                <span className="flex items-center gap-2 animate-pulse">Procesando...</span>
                            ) : (
                                step === steps.length - 2 ? (
                                    <>Enviar <ChevronRight size={20} className="hidden md:block" /></>
                                ) : (
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
