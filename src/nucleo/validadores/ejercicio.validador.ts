import { z } from "zod";

const GrupoMuscularEnum = z.enum([
    "CUADRICEPS", "ISQUIOTIBIALES", "GLUTEO", "PECHO", "ESPALDA",
    "HOMBROS", "BICEPS", "TRICEPS", "CORE", "GEMELOS", "ADUCTORES",
    "ABDOMINALES", "LUMBARES", "TRAPECIO", "ANTEBRAZOS"
]);

const TipoArticulacionEnum = z.enum(["MONOARTICULAR", "BIARTICULAR", "MULTIARTICULAR"]);

const PatronMovimientoEnum = z.enum([
    "EMPUJE_HORIZONTAL", "EMPUJE_VERTICAL", "TRACCION_HORIZONTAL",
    "TRACCION_VERTICAL", "BISAGRA", "SENTADILLA", "AISLAMIENT0",
    "ISOMETRICO", "CARGADA_OLIMPICA", "CAMINATA_TRANSPORTE"
]);

const TipoEquipamientoEnum = z.enum([
    "MAQUINA", "BARRA", "MANCUERNA", "POLEA", "BANDA_ELASTICA",
    "PESO_CORPORAL", "TRX", "KETTLEBELL", "MULTIPOWER", "BANCO", "DISCO", "CABLE"
]);

const LateralidadEnum = z.enum(["BILATERAL", "UNILATERAL"]);

const PosicionCargaEnum = z.enum(["LONGITUD_LARGA", "LONGITUD_CORTA", "NEUTRA"]);

const NivelTecnicoEnum = z.enum(["BASICO", "INTERMEDIO", "AVANZADO"]);

const OrigenEjercicioEnum = z.enum(["BIBLIOTECA_IL", "PERSONALIZADO"]);

/**
 * Esquema de validación para crear/actualizar un ejercicio.
 * @security OWASP A03:2021 - Validación de entradas
 */
export const EsquemaEjercicio = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
    nombresAlternativos: z.array(z.string()).optional().default([]),
    descripcion: z.string().optional().or(z.literal("")),
    erroresComunes: z.string().optional().or(z.literal("")),
    musculoPrincipal: GrupoMuscularEnum,
    musculosSecundarios: z.array(GrupoMuscularEnum).optional().default([]),
    articulacion: TipoArticulacionEnum,
    patron: PatronMovimientoEnum,
    equipamiento: z.array(TipoEquipamientoEnum).min(1, "Al menos un equipamiento requerido"),
    lateralidad: LateralidadEnum,
    posicionCarga: PosicionCargaEnum.default("NEUTRA"),
    nivelTecnico: NivelTecnicoEnum.default("BASICO"),
    urlVideo: z.string().url("URL de video inválida").optional().or(z.literal("")),
    origen: OrigenEjercicioEnum.default("BIBLIOTECA_IL"),
    visibleParaClientes: z.boolean().default(true),
});

export const EsquemaBuscarEjercicio = z.object({
    query: z.string().optional(),
    musculo: GrupoMuscularEnum.optional(),
    equipamiento: TipoEquipamientoEnum.optional(),
    posicionCarga: PosicionCargaEnum.optional(),
});

export type TEjercicio = z.infer<typeof EsquemaEjercicio>;
export type TBuscarEjercicio = z.infer<typeof EsquemaBuscarEjercicio>;
