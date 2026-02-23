import { GrupoMuscular, TipoArticulacion, PatronMovimiento, TipoEquipamiento, Lateralidad, PosicionCarga, NivelTecnico } from "@prisma/client";

export const MAPEO_MUSCULO: Record<string, GrupoMuscular> = {
    'gluteo': 'GLUTEO',
    'patada de gluteo': 'GLUTEO',
    'hip thrust': 'GLUTEO',
    'isquiotibiales': 'ISQUIOTIBIALES',
    'isquio': 'ISQUIOTIBIALES',
    'isquios': 'ISQUIOTIBIALES',
    'femoral': 'ISQUIOTIBIALES',
    'rumano': 'ISQUIOTIBIALES',
    'cuadriceps': 'CUADRICEPS',
    'prensa': 'CUADRICEPS',
    'sentadilla': 'CUADRICEPS',
    'extension de pierna': 'CUADRICEPS',
    'gakk': 'CUADRICEPS',
    'pecho': 'PECHO',
    'pectoral': 'PECHO',
    'banca': 'PECHO',
    'apertura': 'PECHO',
    'cruce in polea': 'PECHO',
    'floor press': 'PECHO',
    'espalda': 'ESPALDA',
    'dorsal': 'ESPALDA',
    'remo': 'ESPALDA',
    'jalon': 'ESPALDA',
    'pull over': 'ESPALDA',
    'dominada': 'ESPALDA',
    'hombro': 'HOMBROS',
    'hombros': 'HOMBROS',
    'deltoides': 'HOMBROS',
    'militar': 'HOMBROS',
    'vuelo': 'HOMBROS',
    'arnold': 'HOMBROS',
    'face pull': 'HOMBROS',
    'biceps': 'BICEPS',
    'curl': 'BICEPS',
    'predicador': 'BICEPS',
    'triceps': 'TRICEPS',
    'frances': 'TRICEPS',
    'copa': 'TRICEPS',
    'extension de codo': 'TRICEPS',
    'patada de burro': 'TRICEPS',
    'core': 'CORE',
    'abdomen': 'CORE',
    'abdominal': 'CORE',
    'plancha': 'CORE',
    'gemelo': 'GEMELOS',
    'pantorrilla': 'GEMELOS',
    'aductor': 'ADUCTORES',
};

export const MAPEO_EQUIPAMIENTO: Record<string, TipoEquipamiento> = {
    'máquina': 'MAQUINA',
    'maquina': 'MAQUINA',
    'barra': 'BARRA',
    'mancuerna': 'MANCUERNA',
    'mancuernas': 'MANCUERNA',
    'polea': 'POLEA',
    'cable': 'POLEA',
    'banda': 'POLEA',
    'banda elástica': 'POLEA',
    'peso corporal': 'PESO_CORPORAL',
    'sin material': 'PESO_CORPORAL',
    'trx': 'POLEA',
    'kettlebell': 'KETTLEBELL',
    'pesa rusa': 'KETTLEBELL',
    'multipower': 'MAQUINA',
    'smith': 'MAQUINA',
    'disco': 'DISCO',
    'banco': 'BANCO',
};

export const MAPEO_PATRON: Record<string, PatronMovimiento> = {
    'empuje horizontal': 'EMPUJE_HORIZONTAL',
    'banca': 'EMPUJE_HORIZONTAL',
    'apertura': 'EMPUJE_HORIZONTAL',
    'empuje vertical': 'EMPUJE_VERTICAL',
    'militar': 'EMPUJE_VERTICAL',
    'arnold': 'EMPUJE_VERTICAL',
    'tracción horizontal': 'TRACCION_HORIZONTAL',
    'remo': 'TRACCION_HORIZONTAL',
    'tracción vertical': 'TRACCION_VERTICAL',
    'jalon': 'TRACCION_VERTICAL',
    'dominada': 'TRACCION_VERTICAL',
    'bisagra': 'BISAGRA',
    'peso muerto': 'BISAGRA',
    'rumano': 'BISAGRA',
    'buenos dias': 'BISAGRA',
    'hip thrust': 'BISAGRA',
    'sentadilla': 'SENTADILLA',
    'prensa': 'SENTADILLA',
    'zancada': 'SENTADILLA',
    'bulgara': 'SENTADILLA',
    'aislamiento': 'AISLAMIENTO',
    'curl': 'AISLAMIENTO',
    'extension': 'AISLAMIENTO',
    'vuelo': 'AISLAMIENTO',
    'peck': 'AISLAMIENTO',
    'isométrico': 'ISOMETRICO',
};

export function normalizar(texto: string | null): string {
    if (!texto) return "";
    return texto.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function mapearMusculo(texto: string): GrupoMuscular | null {
    const norm = normalizar(texto);
    for (const key in MAPEO_MUSCULO) {
        if (norm.includes(normalizar(key))) return MAPEO_MUSCULO[key];
    }
    return null;
}

export function mapearEquipamiento(texto: string): TipoEquipamiento[] {
    const norm = normalizar(texto);
    const results: TipoEquipamiento[] = [];
    for (const key in MAPEO_EQUIPAMIENTO) {
        if (norm.includes(normalizar(key))) {
            const val = MAPEO_EQUIPAMIENTO[key];
            if (!results.includes(val)) results.push(val);
        }
    }
    return results;
}

export function mapearPatron(texto: string): PatronMovimiento | null {
    const norm = normalizar(texto);
    for (const key in MAPEO_PATRON) {
        if (norm.includes(normalizar(key))) return MAPEO_PATRON[key];
    }
    return null;
}
