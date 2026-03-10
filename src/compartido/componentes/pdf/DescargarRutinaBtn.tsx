"use client";

import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';

export interface MacrocicloData {
    duracionSemanas: number;
    bloquesMensuales: {
        nombre: string | null;
        objetivo: string;
        semanas: {
            numeroSemana: number;
            objetivoSemana: string;
            RIRobjetivo: number;
            esFaseDeload: boolean;
            diasSesion: {
                diaSemana: string;
                focoMuscular: string;
                ejercicios: {
                    orden: number;
                    nombre: string;
                    series: number;
                    repsMin: number;
                    repsMax: number;
                    RIR: number | null;
                    descansoSegundos: number | null;
                    notasTecnicas: string | null;
                    pesoSugerido: number | null;
                }[];
            }[];
        }[];
    }[];
}

interface Props {
    macrociclo: MacrocicloData;
    nombreAlumno: string;
    nombreEntrenador: string;
}

// Lazy-load the PDF renderer to avoid yoga-wasm crashing on SSR/hydration
export function DescargarRutinaBtn({ macrociclo, nombreAlumno, nombreEntrenador }: Props) {
    const [PdfLink, setPdfLink] = useState<React.ComponentType<{
        document: React.ReactElement;
        fileName: string;
        className: string;
        children: (props: { loading: boolean; error: Error | null }) => React.ReactNode;
    }> | null>(null);
    const [PdfDoc, setPdfDoc] = useState<React.ComponentType<{
        macrociclo: MacrocicloData;
        nombreAlumno: string;
        nombreEntrenador: string;
    }> | null>(null);

    useEffect(() => {
        // Only import the PDF renderer on the client side
        Promise.all([
            import('@react-pdf/renderer'),
            import('@/compartido/componentes/pdf/RutinaPDF')
        ]).then(([pdfRenderer, pdfModule]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPdfLink(() => pdfRenderer.PDFDownloadLink as any);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPdfDoc(() => pdfModule.RutinaPDF as any);
        }).catch(() => {
            // PDF module failed to load — silently fail
        });
    }, []);

    if (!PdfLink || !PdfDoc) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2.5 bg-marino-3 border border-marino-4 rounded-xl text-sm text-gris opacity-60 cursor-not-allowed"
            >
                <Loader2 size={16} className="animate-spin" />
                <span>PDF</span>
            </button>
        );
    }

    return (
        <PdfLink
            document={
                <PdfDoc
                    macrociclo={macrociclo}
                    nombreAlumno={nombreAlumno}
                    nombreEntrenador={nombreEntrenador}
                />
            }
            fileName={`rutina-${nombreAlumno.replace(/\s+/g, '-').toLowerCase()}.pdf`}
            className="flex items-center gap-2 px-4 py-2.5 bg-marino-3 border border-marino-4 rounded-xl text-sm text-blanco hover:bg-marino-4 hover:border-naranja/30 transition-all"
        >
            {({ loading }: { loading: boolean }) =>
                loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Preparando...</span>
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        <span>PDF</span>
                    </>
                )
            }
        </PdfLink>
    );
}
