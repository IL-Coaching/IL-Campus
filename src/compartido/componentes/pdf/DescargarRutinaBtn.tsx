"use client";

import { Download, Loader2, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RutinaPDF } from '@/compartido/componentes/pdf/RutinaPDF';

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

export function DescargarRutinaBtn({ macrociclo, nombreAlumno, nombreEntrenador }: Props) {
    return (
        <PDFDownloadLink
            document={
                <RutinaPDF
                    macrociclo={macrociclo}
                    nombreAlumno={nombreAlumno}
                    nombreEntrenador={nombreEntrenador}
                />
            }
            fileName={`rutina-${nombreAlumno.replace(/\s+/g, '-').toLowerCase()}.pdf`}
            className="flex items-center gap-2 px-4 py-2.5 bg-marino-3 border border-marino-4 rounded-xl text-sm text-blanco hover:bg-marino-4 hover:border-naranja/30 transition-all disabled:opacity-50"
        >
            {({ loading, error }: { loading: boolean; error: Error | null }) => {
                if (loading) {
                    return (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Preparando...</span>
                        </>
                    );
                }
                if (error) {
                    return (
                        <>
                            <FileText size={16} className="text-red-400" />
                            <span>Error</span>
                        </>
                    );
                }
                return (
                    <>
                        <Download size={16} />
                        <span>PDF</span>
                    </>
                );
            }}
        </PDFDownloadLink>
    );
}
