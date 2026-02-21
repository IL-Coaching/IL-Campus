import { Users } from "lucide-react";
import Link from "next/link";
import BotonAltaManual from "./BotonAltaManual";
import { ClienteServicio } from "@/nucleo/servicios/cliente.servicio";
import { getEntrenadorSesion } from "@/nucleo/seguridad/sesion";

export default async function ClientesPage() {
    // 1. Obtener sesión de forma profesional
    const entrenador = await getEntrenadorSesion();

    // 2. Usar capa de servicio
    const clientes = await ClienteServicio.obtenerPorEntrenador(entrenador.id);

    return (
        <div className="space-y-8 fade-up visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Clientes
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Gestión y seguimiento de entrenados
                    </p>
                </div>
                <BotonAltaManual />
            </div>

            {/* Tabla */}
            <div className="bg-marino-2 border border-marino-4 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-marino-4 flex items-center justify-between bg-marino-3/50">
                    <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                        <Users size={16} className="text-naranja" />
                        Lista de Entrenados ({clientes.length})
                    </h3>

                    {/* Buscador Simple */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="bg-marino border border-marino-4 rounded px-3 py-1.5 text-sm text-blanco w-48 sm:w-64 focus:outline-none focus:border-naranja/50 transition-colors placeholder:text-gris"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-marino-4 bg-marino-3/30">
                                <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Nombre</th>
                                <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Email</th>
                                <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Anotación Inicial</th>
                                <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs">Estado</th>
                                <th className="p-4 font-barlow-condensed font-bold uppercase tracking-widest text-gris text-xs text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-marino-4">
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gris italic">
                                        No hay clientes cargados aún. Hacé clic en &quot;Alta Manual&quot; para empezar.
                                    </td>
                                </tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-marino-3/50 transition-colors">
                                        <td className="p-4 font-medium text-blanco">{cliente.nombre}</td>
                                        <td className="p-4 text-gris-claro font-medium">{cliente.email}</td>
                                        <td className="p-4 text-naranja font-bold tracking-widest text-xs uppercase">{cliente.notas || "Sin plan"}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${cliente.activo ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                                                }`}>
                                                {cliente.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/entrenador/clientes/${cliente.id}`}
                                                className="text-naranja hover:text-blanco font-bold text-xs uppercase tracking-widest transition-colors inline-block"
                                            >
                                                Ver Perfil
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
