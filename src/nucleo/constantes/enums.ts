/**
 * Constantes de display derivadas de los enums del schema de Prisma.
 * Fuente de verdad única para todos los valores de filtros y selectores.
 * Si el schema cambia, cambiar acá — nunca en los componentes.
 */

export const GRUPOS_MUSCULARES_FILTRO = [
    'TODOS',
    'CUADRICEPS',
    'ISQUIOTIBIALES',
    'GLUTEO',
    'PECHO',
    'ESPALDA',
    'HOMBROS',
    'BICEPS',
    'TRICEPS',
    'CORE',
    'GEMELOS',
    'ADUCTORES',
    'ABDOMINALES',
    'LUMBARES',
    'TRAPECIO',
    'ANTEBRAZOS',
] as const;

export const GRUPOS_MUSCULARES_BUSCADOR = [
    'TODOS',
    'PECHO',
    'ESPALDA',
    'HOMBROS',
    'BICEPS',
    'TRICEPS',
    'CUADRICEPS',
    'ISQUIOTIBIALES',
    'GLUTEO',
    'CORE',
] as const;

export const EQUIPAMIENTO_FILTRO = [
    'TODOS',
    'MAQUINA',
    'BARRA',
    'MANCUERNA',
    'POLEA',
    'BANDA_ELASTICA',
    'PESO_CORPORAL',
    'TRX',
    'KETTLEBELL',
    'MULTIPOWER',
    'BANCO',
    'DISCO',
    'CABLE',
] as const;

export const PATRONES_MOVIMIENTO_FILTRO = [
    'TODOS',
    'EMPUJE_HORIZONTAL',
    'EMPUJE_VERTICAL',
    'TRACCION_HORIZONTAL',
    'TRACCION_VERTICAL',
    'BISAGRA',
    'SENTADILLA',
    'AISLAMIENTO',
    'ISOMETRICO',
    'CARGADA_OLIMPICA',
    'CAMINATA_TRANSPORTE',
] as const;

export const METODOS_PAGO = [
    'EFECTIVO',
    'TRANSFERENCIA',
    'MERCADOPAGO',
    'OTRO',
] as const;

export const LATERALIDAD = [
    'BILATERAL',
    'UNILATERAL',
] as const;

/** Valor centinela para el estado "sin filtro activo" */
export const FILTRO_TODOS = 'TODOS' as const;
