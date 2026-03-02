export const dynamic = 'force-dynamic';

import { getEntrenadorSesion } from '@/nucleo/seguridad/sesion';
import { prisma } from '@/baseDatos/conexion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Battery, Moon, Activity, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { marcarCheckinVisto } from '@/nucleo/acciones/checkin.accion';

export default async function CheckinsPage() {
    const entrenador = await getEntrenadorSesion();

    const checkinsNoVistos = await prisma.checkin.findMany({
        where: {
            cliente: { entrenadorId: entrenador.id },
            visto: false
        },
        include: {
            cliente: { select: { id: true, nombre: true } }
        },
        orderBy: { fecha: 'desc' }
    });

    const checkinsVistosRecientes = await prisma.checkin.findMany({
        where: {
            cliente: { entrenadorId: entrenador.id },
            visto: true
        },
        include: {
            cliente: { select: { id: true, nombre: true } }
        },
        orderBy: { fecha: 'desc' },
        take: 20
    });

    return (
        <div className="space-y-6 fade-up visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                        Check-ins
                    </h1>
                    <p className="text-gris font-medium text-sm">
                        Revisión de reportes semanales de clientes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-naranja/10 border border-naranja/20 rounded-xl">
                        <span className="text-naranja font-black text-sm">{checkinsNoVistos.length} pendientes</span>
                    </div>
                </div>
            </div>

            {/* Check-ins pendientes */}
            <section>
                <h2 className="text-xs font-bold text-naranja uppercase tracking-[0.2em] mb-4 ml-1">
                    Pendientes de revisión
                </h2>
                
                {checkinsNoVistos.length === 0 ? (
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl p-8 text-center">
                        <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
                        <p className="text-blanco font-bold">¡Todo al día!</p>
                        <p className="text-gris text-sm mt-1">No hay check-ins pendientes de revisión.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {checkinsNoVistos.map((checkin) => (
                            <div 
                                key={checkin.id} 
                                className="bg-marino-2 border border-naranja/30 rounded-2xl p-5 hover:border-naranja/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-naranja/10 rounded-full flex items-center justify-center">
                                            <span className="text-naranja font-bold text-sm">
                                                {checkin.cliente.nombre.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <Link 
                                                href={`/entrenador/clientes/${checkin.cliente.id}`}
                                                className="text-blanco font-bold hover:text-naranja transition-colors"
                                            >
                                                {checkin.cliente.nombre}
                                            </Link>
                                            <p className="text-xs text-gris">
                                                {format(new Date(checkin.fecha), "EEEE dd MMMM", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    <form action={async () => {
                                        'use server';
                                        await marcarCheckinVisto(checkin.id);
                                    }}>
                                        <button 
                                            type="submit"
                                            className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg hover:bg-green-500/30 transition-colors"
                                        >
                                            Marcar visto
                                        </button>
                                    </form>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-marino-3/50 rounded-xl p-3 text-center">
                                        <Battery size={16} className="text-yellow-400 mx-auto mb-1" />
                                        <p className="text-xl font-black text-blanco">{checkin.energia || '-'}</p>
                                        <p className="text-[0.5rem] text-gris uppercase">Energía</p>
                                    </div>
                                    <div className="bg-marino-3/50 rounded-xl p-3 text-center">
                                        <Moon size={16} className="text-blue-400 mx-auto mb-1" />
                                        <p className="text-xl font-black text-blanco">{checkin.sueno || '-'}</p>
                                        <p className="text-[0.5rem] text-gris uppercase">Sueño</p>
                                    </div>
                                    <div className="bg-marino-3/50 rounded-xl p-3 text-center">
                                        <Activity size={16} className="text-green-400 mx-auto mb-1" />
                                        <p className="text-xl font-black text-blanco">{checkin.adherencia || 0}%</p>
                                        <p className="text-[0.5rem] text-gris uppercase">Adherencia</p>
                                    </div>
                                </div>

                                {checkin.nota && (
                                    <div className="bg-marino-3/30 rounded-xl p-3 mb-3">
                                        <p className="text-xs text-gris-claro italic">&quot;{checkin.nota}&quot;</p>
                                    </div>
                                )}

                                {checkin.ajustesEsperados && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle size={14} className="text-red-400" />
                                            <p className="text-xs font-bold text-red-400">Problema físico reportado</p>
                                        </div>
                                        <p className="text-xs text-red-300">{checkin.ajustesEsperados}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                    <Link 
                                        href={`/entrenador/clientes/${checkin.cliente.id}`}
                                        className="flex-1 py-2 bg-marino-3 border border-marino-4 rounded-lg text-center text-xs font-bold text-blanco hover:bg-marino-4 transition-colors"
                                    >
                                        Ver perfil
                                    </Link>
                                    <Link 
                                        href="/entrenador/mensajeria"
                                        className="flex-1 py-2 bg-naranja/10 border border-naranja/20 rounded-lg text-center text-xs font-bold text-naranja hover:bg-naranja/20 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <MessageCircle size={12} /> Responder
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Historial reciente */}
            {checkinsVistosRecientes.length > 0 && (
                <section>
                    <h2 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                        <Clock size={14} /> Revisados recientemente
                    </h2>
                    
                    <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-marino-4">
                                        <th className="text-left text-xs font-bold text-gris uppercase tracking-widest p-4">Cliente</th>
                                        <th className="text-left text-xs font-bold text-gris uppercase tracking-widest p-4">Fecha</th>
                                        <th className="text-center text-xs font-bold text-gris uppercase tracking-widest p-4">Energía</th>
                                        <th className="text-center text-xs font-bold text-gris uppercase tracking-widest p-4">Sueño</th>
                                        <th className="text-center text-xs font-bold text-gris uppercase tracking-widest p-4">Adherencia</th>
                                        <th className="text-right text-xs font-bold text-gris uppercase tracking-widest p-4">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checkinsVistosRecientes.map((checkin) => (
                                        <tr key={checkin.id} className="border-b border-marino-4/50 hover:bg-marino-3/30">
                                            <td className="p-4">
                                                <Link href={`/entrenador/clientes/${checkin.cliente.id}`} className="text-blanco font-bold hover:text-naranja transition-colors">
                                                    {checkin.cliente.nombre}
                                                </Link>
                                            </td>
                                            <td className="p-4 text-sm text-gris">
                                                {format(new Date(checkin.fecha), "dd MMM", { locale: es })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs font-bold">
                                                    {checkin.energia || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-bold">
                                                    {checkin.sueno || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold">
                                                    {checkin.adherencia || 0}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/entrenador/clientes/${checkin.cliente.id}`} className="text-naranja text-xs font-bold hover:underline">
                                                    Ver →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
