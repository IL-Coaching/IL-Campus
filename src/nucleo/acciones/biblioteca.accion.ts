"use server";

import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { BIBLIOTECA_EXTENSA } from "../constantes/biblioteca_data";

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

const PLANES_OFICIALES = [
    { nombre: "Nivel 1 - Start ★", precio: 15000, duracionDias: 30, visible: true },
    { nombre: "Nivel 2 - GymRat 🧠", precio: 40000, duracionDias: 90, visible: true },
    { nombre: "Nivel 3 - Elite 🚀", precio: 125000, duracionDias: 365, visible: true },
];

export async function sincronizarPlanesMaestros() {
    try {
        const entrenador = await getEntrenadorSesion();

        // 1. Marcar planes viejos como invisibles (para no borrar historial de asignaciones)
        await prisma.plan.updateMany({
            where: { entrenadorId: entrenador.id, visible: true },
            data: { visible: false }
        });

        // 2. Crear los nuevos planes del flyer
        for (const plan of PLANES_OFICIALES) {
            await prisma.plan.create({
                data: {
                    ...plan,
                    entrenadorId: entrenador.id,
                    beneficios: ["Plan Personalizado", "Seguimiento Directo", "Guía de Entrenamiento"]
                }
            });
        }

        return { exito: true };
    } catch (error) {
        console.error("Error al sincronizar planes:", error);
        return { error: "No se pudieron actualizar los planes." };
    }
}

export async function cargarPlanesOficiales() {
    try {
        const entrenador = await getEntrenadorSesion();
        let creados = 0;
        for (const plan of PLANES_OFICIALES) {
            const existe = await prisma.plan.findFirst({
                where: { nombre: plan.nombre, entrenadorId: entrenador.id }
            });
            if (!existe) {
                await prisma.plan.create({
                    data: { ...plan, entrenadorId: entrenador.id }
                });
                creados++;
            }
        }
        return { exito: true, creados };
    } catch (error) {
        console.error("Error al cargar planes:", error);
        return { error: "No se pudieron cargar los planes oficiales." };
    }
}

export async function cargarBibliotecaOficial() {
    try {
        const entrenador = await getEntrenadorSesion();

        let creados = 0;
        // Combinamos la oficial (que ya estaba) con la extensa (extraída de los extras)
        const bibliotecaCompleta = [...BIBLIOTECA_OFICIAL, ...BIBLIOTECA_EXTENSA];

        for (const exe of bibliotecaCompleta) {
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

        // También cargar planes si no existen
        await cargarPlanesOficiales();

        return { exito: true, creados };
    } catch (error) {
        console.error("Error al cargar biblioteca:", error);
        return { error: "No se pudo cargar la biblioteca oficial." };
    }
}
