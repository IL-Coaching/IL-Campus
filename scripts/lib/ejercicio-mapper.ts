import { GrupoMuscular, TipoArticulacion, PatronMovimiento, TipoEquipamiento, Lateralidad, PosicionCarga, NivelTecnico } from "@prisma/client";

export const MAPEO_MUSCULO: Record<string, GrupoMuscular> = {
    'glúteo': 'GLUTEO',
    'gluteo': 'GLUTEO',
    'glute': 'GLUTEO',
    'isquiotibiales': 'ISQUIOTIBIALES',
    'isquio': 'ISQUIOTIBIALES',
    'isquiosurales': 'ISQUIOTIBIALES',
    'isquios': 'ISQUIOTIBIALES',
    'femoral': 'ISQUIOTIBIALES',
    'cuádriceps': 'CUADRICEPS',
    'cuadriceps': 'CUADRICEPS',
    'quad': 'CUADRICEPS',
    'pecho': 'PECHO',
    'pectoral': 'PECHO',
    'espalda': 'ESPALDA',
    'dorsal': 'ESPALDA',
    'hombro': 'HOMBROS',
    'hombros': 'HOMBROS',
    'deltoides': 'HOMBROS',
    'deltoides anterior': 'HOMBROS',
    'deltoides lateral': 'HOMBROS',
    'deltoides posterior': 'HOMBROS',
    'bíceps': 'BICEPS',
    'biceps': 'BICEPS',
    'tríceps': 'TRICEPS',
    'triceps': 'TRICEPS',
    'core': 'CORE',
    'abdomen': 'CORE',
    'abdominales': 'CORE',
    'gemelo': 'GEMELOS',
    'gemelos': 'GEMELOS',
    'pantorrilla': 'GEMELOS',
    'aductor': 'ADUCTORES',
    'aductores': 'ADUCTORES',
    'lumbares': 'CORE',
    'trapecio': 'ESPALDA',
    'antebrazos': 'ESPALDA',
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
    'empuje vertical': 'EMPUJE_VERTICAL',
    'tracción horizontal': 'TRACCION_HORIZONTAL',
    'traccion horizontal': 'TRACCION_HORIZONTAL',
    'tracción vertical': 'TRACCION_VERTICAL',
    'traccion vertical': 'TRACCION_VERTICAL',
    'bisagra': 'BISAGRA',
    'sentadilla': 'SENTADILLA',
    'aislamiento': 'AISLAMIENTO',
    'isométrico': 'ISOMETRICO',
    'isometrico': 'ISOMETRICO',
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
