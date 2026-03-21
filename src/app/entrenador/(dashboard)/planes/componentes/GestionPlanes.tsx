"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, AlertTriangle } from "lucide-react";
import { crearPlan, actualizarPlan, eliminarPlan } from "@/nucleo/acciones/plan.accion";

interface PlanItem {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
    precioPromocional: number | null;
    mesesPromocion: number | null;
    descripcion: string | null;
    beneficios: string[];
    visible: boolean;
    _count: { asignaciones: number };
}

export default function GestionPlanes({ planesIniciales }: { planesIniciales: PlanItem[] }) {
    const router = useRouter();
    const [planes, setPlanes] = useState<PlanItem[]>(planesIniciales);
    const [isPending, startTransition] = useTransition();

    const [modalAbierto, setModalAbierto] = useState(false);
    const [planEditando, setPlanEditando] = useState<string | null>(null);

    // Form
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState(0);
    const [duracionDias, setDuracionDias] = useState(30);
    const [precioPromocional, setPrecioPromocional] = useState<number | ''>('');
    const [mesesPromocion, setMesesPromocion] = useState<number | ''>('');
    const [descripcion, setDescripcion] = useState('');
    const [beneficios, setBeneficios] = useState<string[]>(['']);
    const [visible, setVisible] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    function abrirModalCrecion() {
        setPlanEditando(null);
        setNombre('');
        setPrecio(0);
        setPrecioPromocional('');
        setMesesPromocion('');
        setDuracionDias(30);
        setDescripcion('');
        setBeneficios(['']);
        setVisible(true);
        setErrorMsg('');
        setModalAbierto(true);
    }

    function abrirModalEdicion(plan: PlanItem) {
        setPlanEditando(plan.id);
        setNombre(plan.nombre);
        setPrecio(plan.precio);
        setPrecioPromocional(plan.precioPromocional ?? '');
        setMesesPromocion(plan.mesesPromocion ?? '');
        setDuracionDias(plan.duracionDias);
        setDescripcion(plan.descripcion || '');
        setBeneficios(plan.beneficios.length ? [...plan.beneficios] : ['']);
        setVisible(plan.visible);
        setErrorMsg('');
        setModalAbierto(true);
    }

    function handleBeneficioChange(index: number, value: string) {
        const nuevos = [...beneficios];
        nuevos[index] = value;
        setBeneficios(nuevos);
    }

    function addBeneficio() {
        setBeneficios([...beneficios, '']);
    }

    function removeBeneficio(index: number) {
        setBeneficios(beneficios.filter((_, i) => i !== index));
    }

    async function handleGuardar() {
        if (!nombre.trim() || precio < 0 || duracionDias <= 0) {
            setErrorMsg('Revisa los campos obligatorios (nombre, precio positivo, duración válida).');
            return;
        }

        const beneficiosLimpio = beneficios.map(b => b.trim()).filter(b => b !== '');

        startTransition(async () => {
            const payload = {
                nombre: nombre.trim(),
                precio: Number(precio),
                precioPromocional: precioPromocional === '' ? null : Number(precioPromocional),
                mesesPromocion: mesesPromocion === '' ? null : Number(mesesPromocion),
                duracionDias: Number(duracionDias),
                descripcion: descripcion.trim(),
                beneficios: beneficiosLimpio,
                visible
            };

            if (planEditando) {
                const res = await actualizarPlan(planEditando, payload);
                if (!res.exito) {
                    setErrorMsg(res.error || 'Error al actualizar');
                    return;
                }
            } else {
                const res = await crearPlan(payload);
                if (!res.exito) {
                    setErrorMsg(res.error || 'Error al crear');
                    return;
                }
            }

            // Temporary, ideally we'd re-fetch naturally via server actions but since it's client state we fake a reload.
            router.refresh();
        });
    }

    function handleEliminar(id: string) {
        if (confirm("¿Estás seguro de que deseas eliminar este plan?")) {
            startTransition(async () => {
                const res = await eliminarPlan(id);
                if (res.exito) {
                    setPlanes(planes.filter(p => p.id !== id));
                } else {
                    alert(res.error || "No se pudo eliminar.");
                }
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={abrirModalCrecion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-naranja text-marino text-[0.65rem] uppercase tracking-widest font-black hover:bg-naranja/80 transition-colors shadow-lg shadow-naranja/20"
                >
                    <Plus size={14} /> Nuevo Plan
                </button>
            </div>

            {/* Listado de Planes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {planes.length === 0 ? (
                    <div className="col-span-full bg-marino-2 border border-marino-4 rounded-xl p-12 text-center text-gris italic">
                        Todavía no creaste ningún plan.
                    </div>
                ) : planes.map(plan => (
                    <div key={plan.id} className="bg-marino-2 border border-marino-4 hover:border-naranja/20 transition-colors rounded-2xl p-6 shadow-xl flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-blanco mb-1">{plan.nombre}</h3>
                                <p className="text-naranja font-black text-lg">
                                    ${plan.precio} <span className="text-xs text-gris font-normal">/ {plan.duracionDias} días</span>
                                </p>
                                {plan.precioPromocional !== null && plan.mesesPromocion !== null && (
                                    <p className="text-verde text-sm mt-1">
                                        Promo: ${plan.precioPromocional} por {plan.mesesPromocion} mes{plan.mesesPromocion > 1 ? 'es' : ''}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => abrirModalEdicion(plan)} className="p-2 text-gris hover:text-blanco bg-marino border border-marino-4 rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleEliminar(plan.id)} className="p-2 text-gris hover:text-rojo bg-marino border border-marino-4 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-gris mb-4 line-clamp-3">{plan.descripcion}</p>
                            {plan.beneficios.length > 0 && (
                                <ul className="space-y-2 mb-4">
                                    {plan.beneficios.map((b, i) => (
                                        <li key={i} className="text-xs text-blanco/80 flex items-start gap-2">
                                            <span className="text-naranja mt-1">✓</span> {b}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-marino-4 flex items-center justify-between text-xs">
                            <span className="text-gris font-bold">
                                {plan._count.asignaciones} cliente{plan._count.asignaciones !== 1 ? 's' : ''} asignado{plan._count.asignaciones !== 1 ? 's' : ''}
                            </span>
                            <span className={`font-black uppercase tracking-widest ${plan.visible ? 'text-verde' : 'text-rojo'}`}>
                                {plan.visible ? 'Público' : 'Oculto'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marino/80 backdrop-blur-sm">
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-marino-2/95 border-b border-marino-4 p-5 flex items-center justify-between backdrop-blur-sm z-10">
                            <h3 className="text-xl font-barlow-condensed font-black text-blanco uppercase tracking-tight">
                                {planEditando ? 'Editar Plan' : 'Crear Plan'}
                            </h3>
                            <button onClick={() => setModalAbierto(false)} className="text-gris hover:text-blanco transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {errorMsg && (
                                <div className="bg-rojo/10 border border-rojo/20 text-rojo text-xs p-3 rounded-lg flex items-center gap-2 font-bold">
                                    <AlertTriangle size={14} /> {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Nombre del Plan *</label>
                                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Precio (ARS) *</label>
                                    <input type="number" min="0" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Precio Promo (Opcional)</label>
                                    <input type="number" min="0" value={precioPromocional} onChange={e => setPrecioPromocional(e.target.value ? Number(e.target.value) : '')} placeholder="Ej: 7000" className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Meses Promo</label>
                                    <input type="number" min="1" value={mesesPromocion} onChange={e => setMesesPromocion(e.target.value ? Number(e.target.value) : '')} placeholder="Ej: 1" className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Duración (Dias) *</label>
                                    <input type="number" min="1" value={duracionDias} onChange={e => setDuracionDias(Number(e.target.value))} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-1">Descripción corta</label>
                                    <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full bg-marino border border-marino-4 rounded-xl py-2 px-3 text-sm text-blanco focus:outline-none focus:border-naranja/50" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-marino-4">
                                <label className="text-[0.6rem] text-gris uppercase tracking-widest font-bold block mb-3">Beneficios Checklist</label>
                                <div className="space-y-2">
                                    {beneficios.map((b, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={b}
                                                onChange={e => handleBeneficioChange(i, e.target.value)}
                                                placeholder="Ej: Soporte 24/7"
                                                className="w-full bg-marino border border-white/10 rounded-lg px-3 py-2 text-blanco font-black text-base uppercase tracking-tight focus:ring-1 focus:ring-naranja/50 focus:border-naranja/50 focus:bg-marino-3 placeholder:text-gris/20 group-hover:text-naranja transition-all shadow-inner"
                                            />
                                            <button onClick={() => removeBeneficio(i)} className="text-gris hover:text-rojo transition-colors px-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addBeneficio} className="text-naranja text-xs font-bold uppercase hover:underline mt-2">
                                        + Agregar otro
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <span className="text-[0.6rem] text-gris uppercase tracking-widest font-bold">Plan visible públicamente</span>
                                <button onClick={() => setVisible(!visible)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${visible ? 'bg-verde/10 text-verde border border-verde/20' : 'bg-marino-3 border border-marino-4 text-gris'}`}>
                                    {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {visible ? 'SÍ' : 'NO'}
                                </button>
                            </div>

                        </div>
                        <div className="p-5 border-t border-marino-4 bg-marino-3/30 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setModalAbierto(false)} className="px-5 py-2.5 rounded-xl bg-marino-3 border border-marino-4 text-gris text-[0.6rem] uppercase tracking-widest font-black hover:text-blanco transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleGuardar} disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-naranja text-marino text-[0.6rem] uppercase tracking-widest font-black hover:bg-naranja/80 transition-colors disabled:opacity-50">
                                <Save size={14} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
