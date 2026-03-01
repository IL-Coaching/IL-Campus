import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#f97316',
        paddingBottom: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b'
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 10,
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 4
    },
    weekTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f97316',
        marginBottom: 8,
        marginTop: 15
    },
    dayContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#f97316'
    },
    dayTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6
    },
    exerciseItem: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    exerciseOrder: {
        width: 25,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b'
    },
    exerciseName: {
        flex: 1,
        fontSize: 11,
        color: '#1e293b'
    },
    exerciseDetails: {
        fontSize: 10,
        color: '#64748b'
    },
    exerciseNotes: {
        fontSize: 9,
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 2
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10
    },
    rirBadge: {
        fontSize: 9,
        backgroundColor: '#fef3c7',
        color: '#b45309',
        padding: 2,
        borderRadius: 3,
        marginLeft: 8
    },
    deloadBadge: {
        fontSize: 8,
        backgroundColor: '#fef9c3',
        color: '#854d0e',
        padding: 2,
        borderRadius: 3,
        marginLeft: 5
    }
});

interface EjercicioPDF {
    orden: number;
    nombre: string;
    series: number;
    repsMin: number;
    repsMax: number;
    RIR: number | null;
    descansoSegundos: number | null;
    notasTecnicas: string | null;
    pesoSugerido: number | null;
}

interface DiaPDF {
    diaSemana: string;
    focoMuscular: string;
    ejercicios: EjercicioPDF[];
}

interface SemanaPDF {
    numeroSemana: number;
    objetivoSemana: string;
    RIRobjetivo: number;
    esFaseDeload: boolean;
    diasSesion: DiaPDF[];
}

interface BloquePDF {
    nombre: string | null;
    objetivo: string;
    semanas: SemanaPDF[];
}

interface MacrocicloPDF {
    duracionSemanas: number;
    bloquesMensuales: BloquePDF[];
}

interface Props {
    macrociclo: MacrocicloPDF;
    nombreAlumno: string;
    nombreEntrenador: string;
}

export function RutinaPDF({ macrociclo, nombreAlumno, nombreEntrenador }: Props) {
    const fechaActual = new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Rutina de Entrenamiento</Text>
                    <Text style={styles.subtitle}>
                        {nombreAlumno} · {macrociclo.duracionSemanas} semanas · Generado {fechaActual}
                    </Text>
                </View>

                {macrociclo.bloquesMensuales.map((bloque, bloqueIdx) => (
                    <View key={bloqueIdx} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {bloque.nombre || `Bloque ${bloqueIdx + 1}`}: {bloque.objetivo}
                        </Text>

                        {bloque.semanas.map((semana) => (
                            <View key={semana.numeroSemana}>
                                <Text style={styles.weekTitle}>
                                    Semana {semana.numeroSemana} · {semana.objetivoSemana}
                                    {semana.RIRobjetivo && (
                                        <Text style={styles.rirBadge}>RIR {semana.RIRobjetivo}</Text>
                                    )}
                                    {semana.esFaseDeload && (
                                        <Text style={styles.deloadBadge}>DELOAD</Text>
                                    )}
                                </Text>

                                {semana.diasSesion.map((dia, diaIdx) => (
                                    <View key={diaIdx} style={styles.dayContainer}>
                                        <Text style={styles.dayTitle}>
                                            {dia.diaSemana} - {dia.focoMuscular}
                                        </Text>

                                        {dia.ejercicios.map((ejercicio, ejIdx) => (
                                            <View key={ejIdx} style={styles.exerciseItem}>
                                                <Text style={styles.exerciseOrder}>{ejercicio.orden}.</Text>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.exerciseName}>{ejercicio.nombre}</Text>
                                                    <Text style={styles.exerciseDetails}>
                                                        {ejercicio.series} series × {ejercicio.repsMin}-{ejercicio.repsMax} reps
                                                        {ejercicio.descansoSegundos && ` · ${ejercicio.descansoSegundos}s descanso`}
                                                        {ejercicio.pesoSugerido && ` · ${ejercicio.pesoSugerido}kg`}
                                                    </Text>
                                                    {ejercicio.notasTecnicas && (
                                                        <Text style={styles.exerciseNotes}>{ejercicio.notasTecnicas}</Text>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                ))}

                <Text style={styles.footer}>
                    Entrenador: {nombreEntrenador} · IL-Campus · www.il-coaching.com
                </Text>
            </Page>
        </Document>
    );
}
