import { CreditCard, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { obtenerDatosMembresia } from '@/nucleo/acciones/membresia-alumno.accion';
import AlumnoNav from '@/compartido/componentes/AlumnoNav';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function MembresiaPage() {
    const datos = await obtenerDatosMembresia();
    const { planActual, cobrosRecientes } = datos.membresia;

    return (
        <div className="min-h-screen bg-marino pb-24 text-blanco">
            <header className="p-6 pt-10 border-b border-marino-4 bg-marino-2/50 backdrop-blur-md sticky top-0 z-40">
                <h1 className="text-2xl font-barlow-condensed font-black uppercase">Mi Membresía</h1>
                <p className="text-[0.6rem] text-gris uppercase tracking-widest mt-1">Estado de tu plan y facturación</p>
            </header>

            <main className="p-6 space-y-6">
                {/* Estado actual */}
                {planActual ? (
                    <section className={`rounded-2xl p-6 border-2 ${
                        planActual.diasRestantes > 7 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : planActual.diasRestantes > 0 
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gris mb-1">Plan activo</p>
                                <h2 className="text-2xl font-barlow-condensed font-black text-blanco">{planActual.nombre}</h2>
                            </div>
                            <div className={`p-3 rounded-xl ${
                                planActual.diasRestantes > 7 
                                    ? 'bg-green-500/20' 
                                    : planActual.diasRestantes > 0 
                                        ? 'bg-yellow-500/20'
                                        : 'bg-red-500/20'
                            }`}>
                                {planActual.diasRestantes > 0 ? (
                                    <Clock size={24} className={
                                        planActual.diasRestantes > 7 ? 'text-green-400' : 'text-yellow-400'
                                    } />
                                ) : (
                                    <AlertCircle size={24} className="text-red-400" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                            <div>
                                <p className="text-[0.6rem] text-gris uppercase tracking-widest">Días restantes</p>
                                <p className={`text-3xl font-barlow-condensed font-black ${
                                    planActual.diasRestantes > 7 
                                        ? 'text-green-400' 
                                        : planActual.diasRestantes > 0 
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                }`}>
                                    {planActual.diasRestantes > 0 ? planActual.diasRestantes : 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[0.6rem] text-gris uppercase tracking-widest">Vence</p>
                                <p className="text-sm font-bold text-blanco">
                                    {planActual.fechaVencimiento 
                                        ? format(new Date(planActual.fechaVencimiento), "dd MMM yyyy", { locale: es })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>

                        {planActual.diasRestantes <= 7 && planActual.diasRestantes > 0 && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-xs text-yellow-400">
                                    Tu membresía está por vencer. Contactá a tu entrenador para renovar.
                                </p>
                            </div>
                        )}

                        {planActual.diasRestantes <= 0 && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-xs text-red-400">
                                    Tu membresía ha vencido. Contactá a tu entrenador para reactivarla.
                                </p>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="bg-marino-2 border border-marino-4 rounded-2xl p-6 text-center">
                        <CreditCard size={32} className="text-gris mx-auto mb-3" />
                        <h2 className="text-xl font-barlow-condensed font-black text-blanco">Sin plan activo</h2>
                        <p className="text-sm text-gris mt-2">Contactá a tu entrenador para activar tu membresía.</p>
                    </section>
                )}

                {/* Resumen de pagos */}
                <section>
                    <h3 className="text-xs font-bold text-gris uppercase tracking-[0.2em] mb-4 ml-1">Historial de pagos</h3>
                    <div className="space-y-2">
                        {cobrosRecientes.length === 0 ? (
                            <div className="bg-marino-2 border border-marino-4 p-4 rounded-xl text-center">
                                <FileText size={20} className="text-gris mx-auto mb-2" />
                                <p className="text-sm text-gris">Sin pagos registrados</p>
                            </div>
                        ) : (
                            cobrosRecientes.map((cobro) => (
                                <div key={cobro.id} className="bg-marino-2 border border-marino-4 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20">
                                            <CheckCircle size={16} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blanco">
                                                ${cobro.montoArs}
                                            </p>
                                            <p className="text-[0.6rem] text-gris">
                                                {format(new Date(cobro.fecha), "dd MMM yyyy", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[0.6rem] font-bold uppercase px-2 py-1 rounded bg-green-500/20 text-green-400">
                                        Completado
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Info de contacto */}
                <section className="bg-marino-2/50 border border-marino-4 p-4 rounded-xl">
                    <p className="text-xs text-gris text-center">
                        ¿Tenés alguna consulta sobre tu membresía? 
                        <span className="text-naranja font-bold"> Escribí a tu entrenador</span> desde la sección de mensajes.
                    </p>
                </section>
            </main>

            <AlumnoNav />
        </div>
    );
}
