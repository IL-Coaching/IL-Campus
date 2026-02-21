"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarPerfil from './componentes/SidebarPerfil';
import TopbarPlanificacion from './componentes/TopbarPlanificacion';
import VistaMacrociclo from './componentes/VistaMacrociclo';
import VistaMesociclo from './componentes/VistaMesociclo';
import VistaMicrociclo from './componentes/VistaMicrociclo';
import VistaSesion from './componentes/VistaSesion';
import BuscadorEjercicios from './componentes/BuscadorEjercicios';
import type { Cliente } from '@prisma/client';
import { MacrocicloCompleto } from '@/nucleo/tipos/planificacion.tipos';
import { crearNuevoMacrociclo } from '@/nucleo/acciones/planificacion.accion';
import { Loader2, Settings } from 'lucide-react';

type NivelVista = 'macro' | 'meso' | 'micro' | 'sesion';

interface ConstructorClienteProps {
    cliente: Cliente;
    macrocicloInicial: MacrocicloCompleto | null;
}

export default function ConstructorCliente({ cliente, macrocicloInicial }: ConstructorClienteProps) {
    const [vistaActual, setVistaActual] = useState<NivelVista>('macro');
    const [historial, setHistorial] = useState<NivelVista[]>([]);
    const [mesActivo, setMesActivo] = useState(1);
    const [semanaActiva, setSemanaActiva] = useState(1);
    const [diaActivo, setDiaActivo] = useState('Lunes');
    const [buscadorOpen, setBuscadorOpen] = useState(false);
    const [creandoPlan, setCreandoPlan] = useState(false);

    const router = useRouter();

    const handleCrearPlan = async () => {
        setCreandoPlan(true);
        const formData = new FormData();
        formData.append("duracion", "12"); // 12 semanas por defecto
        formData.append("fechaInicio", new Date().toISOString());

        const res = await crearNuevoMacrociclo(cliente.id, formData);
        if (res.exito) {
            router.refresh();
        }
        setCreandoPlan(false);
    };

    function irA(nivel: NivelVista) {
        setHistorial(prev => [...prev, vistaActual]);
        setVistaActual(nivel);
    }

    function volver() {
        if (historial.length === 0) return;
        const anterior = historial[historial.length - 1];
        setHistorial(prev => prev.slice(0, -1));
        setVistaActual(anterior);
    }

    function saltarA(nivel: NivelVista) {
        if (nivel === 'macro') setHistorial([]);
        else if (nivel === 'meso') setHistorial(['macro']);
        else if (nivel === 'micro') setHistorial(['macro', 'meso']);
        setVistaActual(nivel);
    }

    const breadcrumbItems: { label: string; nivel: NivelVista }[] = [
        { label: 'Planificación', nivel: 'macro' }
    ];
    if (vistaActual === 'meso' || historial.includes('meso')) breadcrumbItems.push({ label: `Mes ${mesActivo}`, nivel: 'meso' });
    if (vistaActual === 'micro' || historial.includes('micro')) breadcrumbItems.push({ label: `Semana ${semanaActiva}`, nivel: 'micro' });
    if (vistaActual === 'sesion') breadcrumbItems.push({ label: `${diaActivo}`, nivel: 'sesion' });

    return (
        <div className="flex flex-col min-h-full bg-marino selection:bg-naranja/30 pb-20">

            <TopbarPlanificacion
                items={breadcrumbItems}
                cliente={cliente}
                onNavigate={saltarA}
                onVolver={volver}
                canVolver={historial.length > 0}
            />

            <div className="flex flex-1 mt-6 gap-6">
                <div className="hidden xl:block">
                    <SidebarPerfil cliente={cliente} />
                </div>

                <main className="flex-1 min-w-0">

                    {!macrocicloInicial ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 fade-up visible">
                            <div className="p-6 bg-marino-2 border border-marino-4 rounded-full">
                                <span className="text-4xl text-naranja">🏗️</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-barlow-condensed font-black uppercase text-blanco">Módulo de Planificación Vacío</h3>
                                <p className="text-gris max-w-sm mt-2 font-medium">Este atleta aún no tiene un macrociclo de entrenamiento. ¿Deseas inicializar una estructura base de 12 semanas?</p>
                            </div>
                            <button
                                onClick={handleCrearPlan}
                                disabled={creandoPlan}
                                className="bg-naranja hover:bg-naranja-h text-marino font-black px-10 py-4 rounded-xl uppercase tracking-widest font-barlow-condensed text-lg shadow-lg shadow-naranja/20 transition-all flex items-center gap-2"
                            >
                                {creandoPlan ? <Loader2 className="animate-spin" /> : "Inicializar Macrociclo"}
                            </button>
                        </div>
                    ) : (
                        <>
                            {vistaActual === 'macro' && (
                                <VistaMacrociclo
                                    onSelectMeso={(n) => { setMesActivo(n); irA('meso'); }}
                                />
                            )}

                            {vistaActual === 'meso' && (
                                <VistaMesociclo
                                    mes={mesActivo}
                                    onSelectSemana={(n) => { setSemanaActiva(n); irA('micro'); }}
                                />
                            )}

                            {vistaActual === 'micro' && (
                                <VistaMicrociclo
                                    semana={semanaActiva}
                                    onSelectSesion={(dia) => { setDiaActivo(dia); irA('sesion'); }}
                                />
                            )}

                            {vistaActual === 'sesion' && (
                                <VistaSesion
                                    dia={diaActivo}
                                    onOpenBuscador={() => setBuscadorOpen(true)}
                                />
                            )}
                        </>
                    )}
                </main>

                <div className="xl:hidden fixed bottom-6 right-6">
                    <button
                        onClick={() => setBuscadorOpen(true)}
                        className="w-14 h-14 bg-naranja text-marino rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            {buscadorOpen && (
                <BuscadorEjercicios onClose={() => setBuscadorOpen(false)} />
            )}
        </div>
    );
}
