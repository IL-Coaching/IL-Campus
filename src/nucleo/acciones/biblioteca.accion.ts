"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";

const BIBLIOTECA_OFICIAL = [
    // --- HOMBROS / EMPUJE VERTICAL ---
    {
        nombre: "Press de hombros con barra en rack sentado",
        patronMovimiento: "Empuje vertical ascendente",
        grupoMuscular: "Hombros",
        musculosPrincipales: "Deltoides Anterior, Pectoral mayor",
        musculosAccesorios: "Triceps, Trapecios",
        analisisBiomecanico: "Articulación del hombro (Flexión), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample1"
    },
    {
        nombre: "Press de hombros con barra en rack parado",
        patronMovimiento: "Empuje vertical ascendente",
        grupoMuscular: "Hombros",
        musculosPrincipales: "Deltoides Anterior, Pectoral mayor",
        musculosAccesorios: "Triceps, Trapecios",
        analisisBiomecanico: "Articulación del hombro (Flexión), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample2"
    },
    {
        nombre: "Press arnold",
        patronMovimiento: "Empuje vertical ascendente",
        grupoMuscular: "Hombros",
        musculosPrincipales: "Deltoides Anterior, Pectoral mayor",
        musculosAccesorios: "Triceps, Trapecios",
        analisisBiomecanico: "Articulación del hombro (Flexión), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample3"
    },
    // --- PECHO / EMPUJE HORIZONTAL ---
    {
        nombre: "Press de banca con barra",
        patronMovimiento: "Empuje horizontal",
        grupoMuscular: "Pecho",
        musculosPrincipales: "Pectoral mayor",
        musculosAccesorios: "Deltoides anterior, Triceps",
        analisisBiomecanico: "Articulación del hombro (Flexión - aducción), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample4"
    },
    {
        nombre: "Press de banca cerrado con barra",
        patronMovimiento: "Empuje horizontal",
        grupoMuscular: "Pecho / Triceps",
        musculosPrincipales: "Ticeps",
        musculosAccesorios: "Deltoides anterior, Pectoral mayor",
        analisisBiomecanico: "Articulación del hombro (Flexión - aducción), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample5"
    },
    {
        nombre: "Press inclinado con mancuerna",
        patronMovimiento: "Empuje horizontal",
        grupoMuscular: "Pecho / Superior",
        musculosPrincipales: "Pectoral mayor",
        musculosAccesorios: "Deltoides anterior, Triceps",
        analisisBiomecanico: "Articulación del hombro (Flexión - aducción), Articulación del codo (Extensión)",
        videoUrl: "https://youtu.be/sample6"
    },
    // --- PIERNAS / DOMINANTE RODILLA ---
    {
        nombre: "Sentadilla barra atrás",
        patronMovimiento: "Dominante de Rodilla",
        grupoMuscular: "Piernas",
        musculosPrincipales: "Cuádriceps, Glúteos",
        musculosAccesorios: "Aductores, Gemelos",
        analisisBiomecanico: "Articulación de la Rodilla (Extensión), Articulación de la cadera (Extensión)",
        videoUrl: "https://youtu.be/sample7"
    },
    {
        nombre: "Sentadilla búlgara",
        patronMovimiento: "Dominante de Rodilla (Unilateral)",
        grupoMuscular: "Piernas",
        musculosPrincipales: "Cuádriceps, Glúteos",
        musculosAccesorios: "Aductores, Gemelos",
        analisisBiomecanico: "Articulación de la Rodilla (Extensión), Articulación de la cadera (Extensión)",
        videoUrl: "https://youtu.be/sample8"
    },
    // --- PIERNAS / DOMINANTE CADERA ---
    {
        nombre: "Peso muerto Rumano",
        patronMovimiento: "Dominante de Cadera",
        grupoMuscular: "Piernas / Posterior",
        musculosPrincipales: "Isquiotibiales, Glúteos, Cuádriceps",
        musculosAccesorios: "Dorsal ancho, Deltoides posterior, Trapecio",
        analisisBiomecanico: "Articulación de la Rodilla (Extensión), Articulación de la cadera (Extensión)",
        videoUrl: "https://youtu.be/sample9"
    },
    {
        nombre: "Hip Thrust con barra",
        patronMovimiento: "Dominante de Cadera",
        grupoMuscular: "Glúteos",
        musculosPrincipales: "Glúteos, Isquiosurales",
        musculosAccesorios: "--",
        analisisBiomecanico: "Articulación de la cadera (Extensión)",
        videoUrl: "https://youtu.be/sample10"
    },
    // --- ESPALDA / TRACCIONES ---
    {
        nombre: "Remo con barra",
        patronMovimiento: "Tracción horizontal",
        grupoMuscular: "Espalda",
        musculosPrincipales: "Dorsal ancho, Trapecio, Deltoides posterior",
        musculosAccesorios: "Biceps",
        analisisBiomecanico: "Articulación del hombro (Extensión)",
        videoUrl: "https://youtu.be/sample11"
    },
    {
        nombre: "Jalón al pecho",
        patronMovimiento: "Tracción vertical",
        grupoMuscular: "Espalda",
        musculosPrincipales: "Dorsal ancho, Trapecio, Deltoides posterior",
        musculosAccesorios: "Biceps",
        analisisBiomecanico: "Articulación del hombro (Aducción), Articulación del codo (Flexión)",
        videoUrl: "https://youtu.be/sample12"
    }
];

export async function cargarBibliotecaOficial() {
    try {
        const entrenador = await getEntrenadorSesion();

        let creados = 0;
        for (const exe of BIBLIOTECA_OFICIAL) {
            // Evitar duplicados por nombre para el mismo entrenador
            const existe = await prisma.ejercicio.findFirst({
                where: { nombre: exe.nombre, entrenadorId: entrenador.id }
            });

            if (!existe) {
                await prisma.ejercicio.create({
                    data: {
                        ...exe,
                        entrenadorId: entrenador.id
                    }
                });
                creados++;
            }
        }

        return { exito: true, creados };
    } catch (error) {
        console.error("Error al cargar biblioteca:", error);
        return { error: "No se pudo cargar la biblioteca oficial." };
    }
}
