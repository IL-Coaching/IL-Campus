"use client"
import { Plus, Copy, Save, Loader2, ClipboardList, ChevronLeft } from 'lucide-react';
import { DiaConEjercicios } from '@/nucleo/tipos/planificacion.tipos';

interface Props {
    diaObjeto: DiaConEjercicios;
    semanaNombre: string;
    hasUnsavedChanges: boolean;
    saving: boolean;
    isSelectionMode: boolean;
    selectedIds: string[];
    copiedSesionId: string | null;
    onBack: () => void;
    onToggleSelectionMode: () => void;
    onAgrupar: () => void;
    onCopiarEstructura: () => void;
    onPegarEstructura: () => void;
    onGuardarTodo: () => void;
}

export default function HeaderSesion({
    diaObjeto,
    semanaNombre,
    hasUnsavedChanges,
    saving,
    isSelectionMode,
    selectedIds,
    copiedSesionId,
    onBack,
    onToggleSelectionMode,
    onAgrupar,
    onCopiarEstructura,
    onPegarEstructura,
    onGuardarTodo,
}: Props) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="flex items-center gap-5">
                <button
                    onClick={() => {
                        if (hasUnsavedChanges) {
                            if (confirm("Tenés cambios sin guardar. ¿Seguro que querés volver? Los cambios se perderán.")) {
                                onBack();
                            }
                        } else {
                            onBack();
                        }
                    }}
                    className="md:hidden w-12 h-12 bg-marino-2 border border-marino-4 rounded-2xl flex items-center justify-center shrink-0 shadow-xl text-gris hover:text-blanco"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="w-14 h-14 bg-marino-2 border border-marino-4 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl">
                    <ClipboardList className="text-naranja" size={28} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className="px-2.5 py-1 bg-naranja/10 rounded-lg text-[0.65rem] font-black text-naranja uppercase tracking-[0.15em] leading-none">
                            {semanaNombre}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                        {diaObjeto.diaSemana} — <span className="text-naranja">{diaObjeto.focoMuscular}</span>
                    </h2>
                </div>
            </div>

            {hasUnsavedChanges && (
                <div className="bg-naranja/10 border border-naranja/30 rounded-2xl px-4 py-2 flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 bg-naranja rounded-full"></div>
                    <span className="text-[0.65rem] font-black text-naranja uppercase tracking-widest">Cambios sin guardar</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 w-full lg:w-auto">
                <button
                    onClick={onToggleSelectionMode}
                    className={`flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${isSelectionMode ? 'bg-naranja text-marino border-naranja' : 'bg-marino-2 border-marino-4 text-gris hover:border-naranja/40 hover:text-blanco'}`}
                >
                    <Plus size={16} className={isSelectionMode ? 'rotate-45' : ''} />
                    {isSelectionMode ? 'Cancelar' : 'Agrupar'}
                </button>

                {isSelectionMode && (
                    <button
                        onClick={onAgrupar}
                        disabled={selectedIds.length < 2}
                        className={`flex items-center justify-center gap-2 px-5 py-3.5 bg-verde text-marino border border-verde rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${selectedIds.length < 2 ? 'opacity-30' : 'hover:scale-105 shadow-xl shadow-verde/20'}`}
                    >
                        <Save size={16} /> Crear Vínculo ({selectedIds.length})
                    </button>
                )}

                {!isSelectionMode && (
                    <>
                        <button
                            onClick={onCopiarEstructura}
                            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-marino-2 border border-marino-4 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-gris hover:border-blanco/20 hover:text-blanco transition-all"
                        >
                            <Copy size={16} /> <span className="hidden md:inline">Clonar</span> Estructura
                        </button>
                        {copiedSesionId && copiedSesionId !== diaObjeto.id && (
                            <button
                                onClick={onPegarEstructura}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-marino-2/50 border border-naranja/40 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-naranja hover:bg-naranja hover:text-marino transition-all font-barlow-condensed"
                                title="Reemplazar sesión actual con la copiada"
                            >
                                Pegar Estructura
                            </button>
                        )}
                    </>
                )}

                <button
                    onClick={onGuardarTodo}
                    disabled={saving}
                    className="col-span-2 md:col-span-1 md:flex-1 flex items-center justify-center gap-3 px-8 py-4 md:py-3.5 bg-naranja hover:bg-naranja-h transition-all text-marino font-black rounded-2xl text-[0.7rem] uppercase tracking-widest shadow-2xl shadow-naranja/30 active:scale-95 border-none"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Guardando..." : "Guardar Sesión"}
                </button>
            </div>
        </div>
    );
}