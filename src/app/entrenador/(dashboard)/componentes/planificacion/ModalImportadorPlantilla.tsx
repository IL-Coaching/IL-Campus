"use client"
import { useState, useEffect } from 'react';
import { X, Calendar, Loader2, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { importarSemanaAPlantilla, obtenerPlantillasSemana } from '@/nucleo/acciones/plantilla.accion';
import { useTransition } from 'react';

interface PlantillaSemana {
    id: string;
    plantillaNombre: string | null;
    objetivoSemana: string;
    esFaseDeload: boolean;
    diasSesion: {
        diaSemana: string;
        focoMuscular: string | null;
        ejercicios: {
            id: string;
            ejercicio?: { nombre: string } | null;
            nombreLibre: string | null;
            series: number;
            repsMin: number | null;
            repsMax: number | null;
        }[];
    }[];
}

interface ModalImportadorPlantillaProps {
    clienteId: string;
    onClose: () => void;
    onImportacionCompleta?: () => void;
}

export default function ModalImportadorPlantilla({ clienteId, onClose, onImportacionCompleta }: ModalImportadorPlantillaProps) {
    const [plantillas, setPlantillas] = useState<PlantillaSemana[]>([]);
    const [cargando, setCargando] = useState(true);
    const [seleccionada, setSeleccionada] = useState<PlantillaSemana | null>(null);
    const [modo, setModo] = useState<'reemplazar' | 'agregar'>('agregar');
    const [semanaDestino, setSemanaDestino] = useState(1);
    const [expandida, setExpandida] = useState<string | null>(null);
    const [importando, setImportando] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        cargarPlantillas();
    }, []);

    async function cargarPlantillas() {
        setCargando(true);
        const res = await obtenerPlantillasSemana();
        if (res.exito && res.plantillas) {
            setPlantillas(res.plantillas as unknown as PlantillaSemana[]);
        }
        setCargando(false);
    }

    async function handleImportar() {
        if (!seleccionada) return;
        
        setImportando(true);
        startTransition(async () => {
            const res = await importarSemanaAPlantilla(
                seleccionada.id,
                clienteId,
                semanaDestino,
                modo
            );
            
            if (res.exito) {
                alert('Plantilla importada correctamente');
                onImportacionCompleta?.();
                onClose();
            } else {
                alert('Error al importar: ' + res.error);
            }
            setImportando(false);
        });
    }

    const totalEjercicios = seleccionada?.diasSesion.reduce((acc, d) => acc + d.ejercicios.length, 0) || 0;
    const diasConEjercicios = seleccionada?.diasSesion.filter(d => d.ejercicios.length > 0).length || 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-marino/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-marino-2 border border-marino-4 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-marino-4 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-barlow-condensed font-black uppercase text-blanco">
                            Importar Plantilla
                        </h3>
                        <p className="text-xs text-gris mt-1">Selecciona una plantilla de tu biblioteca</p>
                    </div>
                    <button onClick={onClose} className="text-gris hover:text-blanco transition-colors p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cargando ? (
                        <div className="text-center py-8">
                            <Loader2 className="animate-spin text-naranja mx-auto mb-2" size={24} />
                            <p className="text-gris text-sm">Cargando plantillas...</p>
                        </div>
                    ) : plantillas.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar size={40} className="text-marino-4 mx-auto mb-4" />
                            <p className="text-gris text-sm mb-2">No hay plantillas disponibles</p>
                            <p className="text-[0.65rem] text-gris/60">Crea plantillas en la Biblioteca → Rutinas</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {plantillas.map((plantilla) => (
                                <div
                                    key={plantilla.id}
                                    className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
                                        seleccionada?.id === plantilla.id
                                            ? 'border-naranja bg-naranja/5'
                                            : 'border-marino-4 hover:border-naranja/30'
                                    }`}
                                    onClick={() => setSeleccionada(plantilla)}
                                >
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                seleccionada?.id === plantilla.id
                                                    ? 'bg-naranja text-marino'
                                                    : 'bg-marino-3 text-naranja'
                                            }`}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-blanco font-black">{plantilla.plantillaNombre || 'Sin nombre'}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[0.5rem] text-naranja font-bold uppercase">
                                                        {totalEjercicios} ejercicios
                                                    </span>
                                                    <span className="text-[0.5rem] text-gris uppercase">
                                                        {diasConEjercicios} días
                                                    </span>
                                                    {plantilla.esFaseDeload && (
                                                        <span className="text-[0.5rem] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                                                            Deload
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandida(expandida === plantilla.id ? null : plantilla.id);
                                            }}
                                            className="p-2 text-gris hover:text-blanco"
                                        >
                                            {expandida === plantilla.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>

                                    {expandida === plantilla.id && (
                                        <div className="border-t border-marino-4 p-4 bg-marino-3/20">
                                            <div className="grid grid-cols-7 gap-2">
                                                {plantilla.diasSesion.map((dia) => (
                                                    <div key={dia.diaSemana} className="bg-marino-2 border border-marino-4 rounded-lg p-2">
                                                        <div className="text-[0.5rem] text-naranja font-black uppercase mb-1">{dia.diaSemana.substring(0,3)}</div>
                                                        <div className="text-[0.45rem] text-gris mb-1">{dia.focoMuscular || '—'}</div>
                                                        <div className="space-y-0.5">
                                                            {dia.ejercicios.slice(0, 2).map(ej => (
                                                                <div key={ej.id} className="text-[0.4rem] text-blanco truncate">
                                                                    {ej.ejercicio?.nombre || ej.nombreLibre || '—'}
                                                                </div>
                                                            ))}
                                                            {dia.ejercicios.length > 2 && (
                                                                <div className="text-[0.4rem] text-gris">+{dia.ejercicios.length - 2}</div>
                                                            )}
                                                            {dia.ejercicios.length === 0 && (
                                                                <div className="text-[0.4rem] text-marino-4">Vacío</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer con opciones de importación */}
                {seleccionada && (
                    <div className="p-6 border-t border-marino-4 bg-marino-3/30 shrink-0 space-y-4">
                        {/* Modo de importación */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setModo('agregar')}
                                className={`flex-1 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                                    modo === 'agregar'
                                        ? 'bg-naranja text-marino'
                                        : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco'
                                }`}
                            >
                                Agregar al final
                            </button>
                            <button
                                onClick={() => setModo('reemplazar')}
                                className={`flex-1 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                                    modo === 'reemplazar'
                                        ? 'bg-naranja text-marino'
                                        : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco'
                                }`}
                            >
                                Reemplazar semana
                            </button>
                        </div>

                        {/* Semana destino (solo si es reemplazar) */}
                        {modo === 'reemplazar' && (
                            <div className="flex items-center gap-4">
                                <label className="text-[0.65rem] text-gris font-bold uppercase">Semana a reemplazar:</label>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5,6,7,8].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSemanaDestino(s)}
                                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                                semanaDestino === s
                                                    ? 'bg-naranja text-marino'
                                                    : 'bg-marino-2 border border-marino-4 text-gris hover:text-blanco'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botón importar */}
                        <button
                            onClick={handleImportar}
                            disabled={importando}
                            className="w-full py-3 bg-naranja text-marino rounded-xl font-black uppercase tracking-widest hover:bg-naranja/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {importando ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Download size={18} />
                                    Importar Plantilla
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}