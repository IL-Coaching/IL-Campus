"use client"
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { ClientePlanificacion } from '@/nucleo/tipos/planificacion.tipos';

export default function DetallesFormulario({ cliente }: { cliente: ClientePlanificacion }) {
    const form = cliente.formularioInscripcion;
    const [descargando, setDescargando] = useState(false);

    const descargarPDF = async () => {
        setDescargando(true);
        try {
            // Importar dinámicamente para evitar problemas de SSR con window
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default;

            const elemento = document.getElementById('formulario-inscripcion-pdf');
            if (!elemento) return;

            const opt = {
                margin: 10, // top, left, bottom, right
                filename: `Anamnesis_${cliente.nombre.replace(/ /g, '_')}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0F1629' },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(elemento).save();
        } catch (error) {
            console.error('Error generando PDF:', error);
        } finally {
            setDescargando(false);
        }
    };

    if (!form) {
        return (
            <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 text-center text-gris italic">
                Este cliente no completó el formulario de inscripción inicial o fue importado manualmente.
            </div>
        );
    }

    // Renderizador de secciones con formato limpio
    const seccion = (titulo: string, data: Record<string, string | number | boolean | string[] | undefined>) => (
        <div className="mb-8 break-inside-avoid">
            <h4 className="text-naranja font-barlow-condensed font-black uppercase text-xl mb-4 border-b border-marino-4 pb-2">{titulo}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {Object.entries(data).map(([key, value]) => {
                    // Dar formato legible a las claves camelCase
                    const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());

                    let displayValue = value;
                    if (Array.isArray(value)) displayValue = value.length > 0 ? value.join(' • ') : 'Ninguno';
                    else if (value === true) displayValue = 'Sí';
                    else if (value === false) displayValue = 'No';
                    else if (value === '' || value === null || value === undefined) displayValue = '- Sin responder -';

                    return (
                        <div key={key}>
                            <p className="text-[0.65rem] font-black text-gris uppercase tracking-widest">{formattedKey}</p>
                            <p className="text-sm text-blanco mt-1.5 font-medium whitespace-pre-wrap">{displayValue}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-marino-2 border border-marino-4 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-marino-4 bg-marino-3/50 flex items-center justify-between">
                <h3 className="font-barlow-condensed font-bold tracking-widest uppercase text-sm text-blanco flex items-center gap-2">
                    <FileText size={16} className="text-naranja" />
                    Respuestas del Formulario
                </h3>
                <button
                    onClick={descargarPDF}
                    disabled={descargando}
                    className="flex items-center gap-2 bg-naranja/10 hover:bg-naranja border border-naranja/20 hover:border-naranja px-4 py-2 rounded-lg text-[0.65rem] font-black text-naranja hover:text-marino uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Download size={14} /> {descargando ? 'PROCESANDO...' : 'DESCARGAR PDF'}
                </button>
            </div>
            <div className="p-6 overflow-x-auto text-blanco">
                {/* Contenedor que será convertido a PDF */}
                <div id="formulario-inscripcion-pdf" className="p-2 sm:p-6 bg-marino-2" style={{ color: '#F5F5F5' }}>
                    <div className="mb-10 text-center border-b border-marino-4 pb-6">
                        <p className="text-[0.65rem] font-black text-naranja uppercase tracking-[0.3em] mb-2">Expediente Oficial</p>
                        <h2 className="text-3xl font-barlow-condensed font-black uppercase text-blanco">Ficha de Inscripción</h2>
                        <h3 className="text-xl font-bold text-gris mt-2">{cliente.nombre}</h3>
                        <p className="text-xs text-gris-claro mt-2">Fecha de Alta: {new Date(cliente.fechaAlta).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-6">
                        {form.datosPersonales && Object.keys(form.datosPersonales).length > 0 && seccion('1. Datos Personales', form.datosPersonales)}
                        {form.contacto && Object.keys(form.contacto).length > 0 && seccion('2. Contacto', form.contacto)}
                        {form.saludMedica && Object.keys(form.saludMedica).length > 0 && seccion('3. Salud Médica', form.saludMedica)}
                        {form.estiloDeVida && Object.keys(form.estiloDeVida).length > 0 && seccion('4. Estilo de Vida', form.estiloDeVida)}
                        {form.experiencia && Object.keys(form.experiencia).length > 0 && seccion('5. Experiencia', form.experiencia)}
                        {form.objetivos && Object.keys(form.objetivos).length > 0 && seccion('6. Objetivos', form.objetivos)}
                        {form.disponibilidad && Object.keys(form.disponibilidad).length > 0 && seccion('7. Disponibilidad', form.disponibilidad)}
                        {form.personalizacion && Object.keys(form.personalizacion).length > 0 && seccion('8. Personalización', form.personalizacion)}
                        {form.consentimiento && Object.keys(form.consentimiento).length > 0 && seccion('9. Consentimiento', form.consentimiento)}
                    </div>
                </div>
            </div>
        </div>
    );
}
