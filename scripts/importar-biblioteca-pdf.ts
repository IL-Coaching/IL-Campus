import fs from 'fs';
import { mapearMusculo, mapearEquipamiento, mapearPatron } from './lib/ejercicio-mapper';
import { insertarEjercicios, ExerciseData } from './lib/db-inserter';
import { GrupoMuscular, TipoArticulacion, PatronMovimiento, Lateralidad, PosicionCarga, NivelTecnico, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const insertar = args.includes('--insertar');

    if (!fs.existsSync('extracted_exercises_final.json')) {
        console.error("No se encontró extracted_exercises_final.json. Ejecuta primero universal_parser.js");
        return;
    }

    const raw = JSON.parse(fs.readFileSync('extracted_exercises_final.json', 'utf8'));
    console.log(`Cargados ${raw.length} ejercicios desde el JSON.`);

    let allExtracted: ExerciseData[] = [];

    for (const r of raw) {
        // Inferir datos
        const musculo = mapearMusculo(r.nombre) || GrupoMuscular.HOMBROS;
        const equip = mapearEquipamiento(r.nombre);
        const patron = mapearPatron(r.nombre) || PatronMovimiento.AISLAMIENTO;

        // Ajustes por nombre
        const nLower = r.nombre.toLowerCase();
        if (nLower.includes("máquina") || nLower.includes("maquina") || nLower.includes("smith") || nLower.includes("prensa")) {
            if (!equip.includes("MAQUINA")) equip.push("MAQUINA");
        }
        if (nLower.includes("barra") && !equip.includes("BARRA")) equip.push("BARRA");
        if ((nLower.includes("mancuerna") || nLower.includes("mcuerna") || nLower.includes("manc")) && !equip.includes("MANCUERNA")) equip.push("MANCUERNA");
        if (nLower.includes("polea") && !equip.includes("POLEA")) equip.push("POLEA");

        allExtracted.push({
            nombre: r.nombre,
            musculoPrincipal: musculo,
            articulacion: nLower.includes("cur") || nLower.includes("exten") || nLower.includes("elev") ? TipoArticulacion.MONOARTICULAR : TipoArticulacion.MULTIARTICULAR,
            patron: patron,
            equipamiento: equip.length > 0 ? equip : ["PESO_CORPORAL"],
            lateralidad: nLower.includes("unilateral") ? Lateralidad.UNILATERAL : Lateralidad.BILATERAL,
            urlVideo: r.urlVideo,
            posicionCarga: nLower.includes("larga") ? PosicionCarga.LONGITUD_LARGA : (nLower.includes("corta") ? PosicionCarga.LONGITUD_CORTA : PosicionCarga.NEUTRA),
            nivelTecnico: NivelTecnico.BASICO
        });
    }

    if (dryRun) {
        console.log("\n--- RESULTADO DRY RUN ---");
        console.log(`Total a procesar: ${allExtracted.length}`);
        console.log(JSON.stringify(allExtracted.slice(0, 10), null, 2));
        console.log("...");
    }

    if (insertar) {
        const entrenador = await prisma.entrenador.findFirst();
        if (!entrenador) {
            console.error("No se encontró ningún entrenador en la DB.");
            return;
        }

        console.log(`Insertando en la cuenta de: ${entrenador.nombre}`);
        const result = await insertarEjercicios(allExtracted, entrenador.id);
        console.log(`\n¡TRABAJO TERMINADO!`);
        console.log(`✓ ${result.creados} ejercicios insertados.`);
        console.log(`⚠ ${result.omitidos} omitidos (ya existen o error).`);
    }
}

main().catch(console.error);
