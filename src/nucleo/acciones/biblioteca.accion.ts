"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/baseDatos/conexion";
import { getEntrenadorSesion } from "../seguridad/sesion";
import { EjercicioServicio } from "../servicios/ejercicio.servicio";

/**
 * Acciones para gestionar la biblioteca oficial de IL-Coaching.
 */

export async function sincronizarPlanesMaestros() {
    revalidatePath("/entrenador/biblioteca");
    return { success: true };
}

const BIBLIOTECA_BASE_PDF = [
    // --- HOMBROS ---
    {
        nombre: "Press de hombros con barra en rack sentado",
        musculoPrincipal: "HOMBROS",
        articulacion: "MULTIARTICULAR",
        patron: "EMPUJE_VERTICAL",
        equipamiento: ["BARRA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        urlVideo: "https://www.youtube.com/watch?v=KdvzGnDDtKM",
        descripcion: "Mantener la espalda apoyada, bajar la barra hasta la altura de la barbilla y empujar explosivamente."
    },
    {
        nombre: "Press de hombros con mancuerna sentado",
        musculoPrincipal: "HOMBROS",
        articulacion: "MULTIARTICULAR",
        patron: "EMPUJE_VERTICAL",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Mancuernas a los lados de la cabeza, empuje vertical completo sin chocar las pesas arriba."
    },
    {
        nombre: "Press Arnold",
        musculoPrincipal: "HOMBROS",
        articulacion: "MULTIARTICULAR",
        patron: "EMPUJE_VERTICAL",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        urlVideo: "https://www.youtube.com/watch?v=O_LKRwMnZHw",
        descripcion: "Iniciar con palmas hacia adentro, rotar durante el empuje."
    },
    {
        nombre: "Elevaciones laterales con mancuerna",
        musculoPrincipal: "HOMBROS",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["MANCUERNA"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Brazos ligeramente flexionados, subir hasta la altura de los hombros."
    },

    // --- PECHO ---
    {
        nombre: "Press de banca con barra",
        musculoPrincipal: "PECHO",
        articulacion: "MULTIARTICULAR",
        patron: "EMPUJE_HORIZONTAL",
        equipamiento: ["BARRA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Retracción escapular, barra al pecho (zona media) y empuje vertical."
    },
    {
        nombre: "Press inclinado con mancuerna",
        musculoPrincipal: "PECHO",
        articulacion: "MULTIARTICULAR",
        patron: "EMPUJE_HORIZONTAL",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Banco a 30-45 grados. Máximo estiramiento en la fase excéntrica."
    },
    {
        nombre: "Aperturas con mancuerna",
        musculoPrincipal: "PECHO",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Movimiento semicircular, énfasis en el estiramiento pectoral."
    },

    // --- ESPALDA ---
    {
        nombre: "Remo con barra",
        musculoPrincipal: "ESPALDA",
        articulacion: "MULTIARTICULAR",
        patron: "TRACCION_HORIZONTAL",
        equipamiento: ["BARRA"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Torso a 45 grados, tracción hacia el ombligo manteniendo espalda neutra."
    },
    {
        nombre: "Remo unilateral con mancuerna",
        musculoPrincipal: "ESPALDA",
        articulacion: "MULTIARTICULAR",
        patron: "TRACCION_HORIZONTAL",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "UNILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Apoyo en banco, tracción llevando el codo hacia la cadera."
    },
    {
        nombre: "Jalón al pecho agarre abierto",
        musculoPrincipal: "ESPALDA",
        articulacion: "MULTIARTICULAR",
        patron: "TRACCION_VERTICAL",
        equipamiento: ["POLEA", "MAQUINA"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Tracción hacia la parte superior del pecho, evitar balanceo del torso."
    },

    // --- PIERNAS (CUADRICEPS) ---
    {
        nombre: "Sentadilla con barra atrás",
        musculoPrincipal: "CUADRICEPS",
        articulacion: "MULTIARTICULAR",
        patron: "SENTADILLA",
        equipamiento: ["BARRA"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Mantener core activo, bajar hasta profundidad adecuada según movilidad."
    },
    {
        nombre: "Sentadilla búlgara con mancuernas",
        musculoPrincipal: "CUADRICEPS",
        articulacion: "MULTIARTICULAR",
        patron: "SENTADILLA",
        equipamiento: ["MANCUERNA", "BANCO"],
        lateralidad: "UNILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Un pie elevado en banco, descender verticalmente priorizando pierna delantera."
    },
    {
        nombre: "Prensa 45 grados",
        musculoPrincipal: "CUADRICEPS",
        articulacion: "MULTIARTICULAR",
        patron: "SENTADILLA",
        equipamiento: ["MAQUINA"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Pies a ancho de hombros, bajar de forma controlada sin despegar la cadera."
    },

    // --- PIERNAS (POSTERIOR/GLUTEO) ---
    {
        nombre: "Peso muerto rumano con barra",
        musculoPrincipal: "ISQUIOTIBIALES",
        articulacion: "MULTIARTICULAR",
        patron: "BISAGRA",
        equipamiento: ["BARRA"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Flexión de cadera con rodillas semifijas, sentir estiramiento en isquios."
    },
    {
        nombre: "Peso muerto sumo",
        musculoPrincipal: "ISQUIOTIBIALES",
        articulacion: "MULTIARTICULAR",
        patron: "BISAGRA",
        equipamiento: ["BARRA", "DISCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        urlVideo: "https://www.youtube.com/watch?v=aOyQqlrAoLU",
        descripcion: "Pies anchos, manos por dentro de las piernas, énfasis en aductores y glúteo."
    },
    {
        nombre: "Hip Thrust con barra",
        musculoPrincipal: "GLUTEO",
        articulacion: "MULTIARTICULAR",
        patron: "BISAGRA",
        equipamiento: ["BARRA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Apoyo escapular en banco, empuje de cadera hacia arriba con bloqueo final."
    },
    {
        nombre: "Curl femoral sentado",
        musculoPrincipal: "ISQUIOTIBIALES",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["MAQUINA"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Alinear rodilla con eje de máquina, flexión completa."
    },

    // --- BRAZOS ---
    {
        nombre: "Curl de bíceps con barra",
        musculoPrincipal: "BICEPS",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["BARRA"],
        lateralidad: "BILATERAL",
        posicionCarga: "NEUTRA",
        descripcion: "Codos pegados al torso, evitar balanceo."
    },
    {
        nombre: "Press Francés con barra W",
        musculoPrincipal: "TRICEPS",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["BARRA", "BANCO"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_LARGA",
        descripcion: "Bajar barra hacia la frente o ligeramente por detrás para mayor estiramiento."
    },
    {
        nombre: "Extensión de tríceps en polea alta",
        musculoPrincipal: "TRICEPS",
        articulacion: "MONOARTICULAR",
        patron: "AISLAMIENTO",
        equipamiento: ["POLEA"],
        lateralidad: "BILATERAL",
        posicionCarga: "LONGITUD_CORTA",
        descripcion: "Soga o barra recta, extensión completa bloqueando el codo abajo."
    }
];

export async function cargarBibliotecaOficial() {
    try {
        const entrenador = await getEntrenadorSesion();

        let creados = 0;
        for (const ej of BIBLIOTECA_BASE_PDF) {
            // Verificar si ya existe para evitar duplicados
            const existe = await prisma.ejercicio.findFirst({
                where: {
                    nombre: ej.nombre,
                    entrenadorId: entrenador.id
                }
            });

            if (!existe) {
                await EjercicioServicio.crear({
                    ...ej,
                    entrenadorId: entrenador.id,
                    origen: 'BIBLIOTECA_IL',
                    visibleParaClientes: true
                });
                creados++;
            }
        }

        revalidatePath("/entrenador/biblioteca");
        return { success: true, exito: true, creados };
    } catch (error) {
        console.error("Error al cargar biblioteca:", error);
        return { error: "No se pudo cargar la biblioteca oficial." };
    }
}
