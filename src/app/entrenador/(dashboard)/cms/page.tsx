import { obtenerCMSDatos } from "@/nucleo/acciones/cms.accion";
import CMSPanel from "./componentes/CMSPanel";

export default async function CMSPage() {
    const res = await obtenerCMSDatos();

    if (!res.exito || !res.config || !res.planes) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-rojo font-bold">Error al cargar la configuración CMS.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 bg-naranja/10 border border-naranja/20 rounded text-[0.6rem] font-bold text-naranja uppercase tracking-widest">
                        Gestor de Contenidos
                    </span>
                </div>
                <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tight text-blanco leading-none">
                    CMS <span className="text-naranja">Landing Page</span>
                </h1>
                <p className="text-gris font-medium text-sm mt-1 max-w-xl">
                    Control absoluto sobre la fachada pública de IL-Campus.
                </p>
            </div>

            {/* Panel Principal */}
            <CMSPanel config={res.config} planes={res.planes} />
        </div>
    );
}
