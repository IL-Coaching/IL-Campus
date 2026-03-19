-- CreateEnum
CREATE TYPE "ModalidadBloque" AS ENUM ('SECUENCIAL', 'CIRCUITO', 'SUPERSERIE', 'AMRAP', 'EMOM');

-- CreateEnum
CREATE TYPE "GrupoMuscular" AS ENUM ('CUADRICEPS', 'ISQUIOTIBIALES', 'GLUTEO', 'PECHO', 'ESPALDA', 'HOMBROS', 'BICEPS', 'TRICEPS', 'CORE', 'GEMELOS', 'ADUCTORES', 'ABDOMINALES', 'LUMBARES', 'TRAPECIO', 'ANTEBRAZOS');

-- CreateEnum
CREATE TYPE "TipoArticulacion" AS ENUM ('MONOARTICULAR', 'BIARTICULAR', 'MULTIARTICULAR');

-- CreateEnum
CREATE TYPE "PatronMovimiento" AS ENUM ('EMPUJE_HORIZONTAL', 'EMPUJE_VERTICAL', 'TRACCION_HORIZONTAL', 'TRACCION_VERTICAL', 'BISAGRA', 'SENTADILLA', 'AISLAMIENTO', 'ISOMETRICO', 'CARGADA_OLIMPICA', 'CAMINATA_TRANSPORTE');

-- CreateEnum
CREATE TYPE "TipoEquipamiento" AS ENUM ('MAQUINA', 'BARRA', 'MANCUERNA', 'POLEA', 'BANDA_ELASTICA', 'PESO_CORPORAL', 'TRX', 'KETTLEBELL', 'MULTIPOWER', 'BANCO', 'DISCO', 'CABLE');

-- CreateEnum
CREATE TYPE "Lateralidad" AS ENUM ('BILATERAL', 'UNILATERAL');

-- CreateEnum
CREATE TYPE "PosicionCarga" AS ENUM ('LONGITUD_LARGA', 'LONGITUD_CORTA', 'NEUTRA');

-- CreateEnum
CREATE TYPE "NivelTecnico" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "OrigenEjercicio" AS ENUM ('BIBLIOTECA_IL', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "TipoCarga" AS ENUM ('INTRODUCTORIA', 'BASE', 'CHOQUE', 'DESCARGA_TEST');

-- CreateEnum
CREATE TYPE "ModeloPeriodizacion" AS ENUM ('LINEAL', 'ONDULANTE', 'CONJUGADA', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "VelocidadPercibida" AS ENUM ('NORMAL', 'LENTA', 'MUY_LENTA');

-- CreateEnum
CREATE TYPE "NivelRespuesta" AS ENUM ('ALTA', 'NORMAL', 'BAJA');

-- CreateEnum
CREATE TYPE "ZonaIntensidad" AS ENUM ('NEURAL', 'NEURO_ENDOCRINA', 'HIPERTROFIA', 'RESISTENCIA');

-- CreateEnum
CREATE TYPE "ModalidadTesteo" AS ENUM ('DIRECTO', 'INDIRECTO');

-- CreateEnum
CREATE TYPE "ModoMedicion" AS ENUM ('REPS', 'TIEMPO', 'DISTANCIA', 'AMRAP');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('MENSAJE_DIRECTO', 'FINANZA', 'VENCIMIENTO_MEMBRESIA', 'NUEVO_FORMULARIO', 'CHECKIN');

-- CreateEnum
CREATE TYPE "GravedadNotificacion" AS ENUM ('INFO', 'ALERTA', 'CRITICO');

-- CreateTable
CREATE TABLE "Entrenador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "landingBioUrl" TEXT,
    "landingHeroUrl" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "Entrenador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "precioPromocional" DOUBLE PRECISION,
    "mesesPromocion" INTEGER,
    "duracionDias" INTEGER NOT NULL,
    "descripcion" TEXT,
    "beneficios" TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ejercicio" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombresAlternativos" TEXT[],
    "descripcion" TEXT,
    "erroresComunes" TEXT,
    "musculoPrincipal" "GrupoMuscular" NOT NULL,
    "musculosSecundarios" "GrupoMuscular"[],
    "articulacion" "TipoArticulacion" NOT NULL,
    "patron" "PatronMovimiento" NOT NULL,
    "equipamiento" "TipoEquipamiento"[],
    "lateralidad" "Lateralidad" NOT NULL,
    "posicionCarga" "PosicionCarga" NOT NULL DEFAULT 'NEUTRA',
    "nivelTecnico" "NivelTecnico" NOT NULL DEFAULT 'BASICO',
    "urlVideo" TEXT,
    "thumbnailUrl" TEXT,
    "origen" "OrigenEjercicio" NOT NULL DEFAULT 'BIBLIOTECA_IL',
    "visibleParaClientes" BOOLEAN NOT NULL DEFAULT true,
    "archivado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "telefono" TEXT,
    "genero" TEXT,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "invitationExpires" TIMESTAMP(3),
    "invitationToken" TEXT,
    "lastLogin" TIMESTAMP(3),
    "passwordResetExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "enEstasis" BOOLEAN NOT NULL DEFAULT false,
    "esVIP" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAsignado" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanAsignado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormularioInscripcion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "datosPersonales" JSONB,
    "contacto" JSONB,
    "consentimiento" JSONB,
    "saludMedica" JSONB,
    "estiloDeVida" JSONB,
    "experiencia" JSONB,
    "objetivos" JSONB,
    "disponibilidad" JSONB,
    "personalizacion" JSONB,
    "condicionesClinicas" TEXT[],
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormularioInscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditoriaCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorViejo" TEXT,
    "valorNuevo" TEXT,
    "modificadoPor" TEXT NOT NULL DEFAULT 'SISTEMA',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditoriaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CicloMenstrual" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "duracionCiclo" INTEGER NOT NULL,
    "fechaInicioUltimoCiclo" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CicloMenstrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Macrociclo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "duracionSemanas" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Macrociclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueMensual" (
    "id" TEXT NOT NULL,
    "macrocicloId" TEXT NOT NULL,
    "nombre" TEXT,
    "objetivo" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "metodo" TEXT,
    "rangoReferencia" TEXT,

    CONSTRAINT "BloqueMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semana" (
    "id" TEXT NOT NULL,
    "bloqueMensualId" TEXT NOT NULL,
    "numeroSemana" INTEGER NOT NULL,
    "objetivoSemana" TEXT NOT NULL,
    "RIRobjetivo" INTEGER NOT NULL,
    "volumenEstimado" TEXT NOT NULL,
    "esFaseDeload" BOOLEAN NOT NULL DEFAULT false,
    "esSemanaTesteo" BOOLEAN NOT NULL DEFAULT false,
    "tipoCarga" "TipoCarga",
    "modeloPeriodizacion" "ModeloPeriodizacion" NOT NULL DEFAULT 'LINEAL',
    "fasesCiclo" TEXT,
    "checkinRequerido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Semana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumenSemanal" (
    "id" TEXT NOT NULL,
    "semanaId" TEXT NOT NULL,
    "grupoMuscular" TEXT NOT NULL,
    "seriesTotal" INTEGER NOT NULL,
    "bajoDeLaMinima" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VolumenSemanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaSesion" (
    "id" TEXT NOT NULL,
    "semanaId" TEXT NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "focoMuscular" TEXT NOT NULL,
    "notas" TEXT,

    CONSTRAINT "DiaSesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueSesion" (
    "id" TEXT NOT NULL,
    "diaId" TEXT NOT NULL,
    "nombre" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "modalidad" "ModalidadBloque" NOT NULL DEFAULT 'SECUENCIAL',

    CONSTRAINT "BloqueSesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjercicioPlanificado" (
    "id" TEXT NOT NULL,
    "diaId" TEXT NOT NULL,
    "bloqueId" TEXT,
    "ejercicioId" TEXT,
    "nombreLibre" TEXT,
    "esBiblioteca" BOOLEAN NOT NULL DEFAULT false,
    "series" INTEGER NOT NULL,
    "modoMedicion" "ModoMedicion" NOT NULL DEFAULT 'REPS',
    "repsMin" INTEGER,
    "repsMax" INTEGER,
    "tiempoObjetivoSeg" INTEGER,
    "RIR" INTEGER,
    "tempo" TEXT,
    "tempoExcentrica" INTEGER,
    "tempoPausa" INTEGER,
    "tempoConcentrica" INTEGER,
    "tempoPausaArriba" INTEGER,
    "esUltimaSerieAlFallo" BOOLEAN NOT NULL DEFAULT false,
    "descansoSegundos" INTEGER,
    "pesoSugerido" DOUBLE PRECISION,
    "zonaIntensidad" "ZonaIntensidad",
    "cadencia" TEXT,
    "duracionSerie" TEXT,
    "notasTecnicas" TEXT,
    "orden" INTEGER NOT NULL,
    "esTesteo" BOOLEAN NOT NULL DEFAULT false,
    "modalidadTesteo" "ModalidadTesteo",
    "grupoId" TEXT,
    "nombreGrupo" TEXT,

    CONSTRAINT "EjercicioPlanificado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionRegistrada" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "diaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "duracionMinutos" INTEGER,

    CONSTRAINT "SesionRegistrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieRegistrada" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "ejercicioPlanificadoId" TEXT NOT NULL,
    "pesoKg" DOUBLE PRECISION,
    "repsReales" INTEGER,
    "velocidadPercibida" "VelocidadPercibida",
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,

    CONSTRAINT "SerieRegistrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricasSesion" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "duracion" INTEGER,
    "DOMS" TEXT,
    "grupoMuscularFatigado" TEXT,
    "pesajeDia" DOUBLE PRECISION,
    "esfuerzoGral" INTEGER,

    CONSTRAINT "MetricasSesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilRespuesta" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nivelRespuesta" "NivelRespuesta",
    "fechaEvaluacion" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "PerfilRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaEstancamiento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "semanasEstancado" INTEGER NOT NULL,
    "revisada" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaEstancamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAdherencia" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "semanaId" TEXT NOT NULL,
    "sesionesPlanificadas" INTEGER NOT NULL,
    "sesionesCompletadas" INTEGER NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RegistroAdherencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fotosUrls" TEXT[],
    "pesoKg" DOUBLE PRECISION,
    "nota" TEXT,
    "energia" INTEGER,
    "sueno" INTEGER,
    "adherencia" INTEGER,
    "faseCiclo" TEXT,
    "ajustesEsperados" TEXT,
    "alturaCm" DOUBLE PRECISION,
    "fuerzaRelativa" TEXT,
    "videoUrl" TEXT,
    "visto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobro" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoArs" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT NOT NULL,
    "periodoDesde" TIMESTAMP(3) NOT NULL,
    "periodoHasta" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "planAsignadoId" TEXT,
    "comprobanteUrl" TEXT,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "emisor" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrl" TEXT,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoTesteo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "modalidad" "ModalidadTesteo" NOT NULL,
    "pesoUtilizado" DOUBLE PRECISION NOT NULL,
    "repsRealizadas" INTEGER NOT NULL,
    "unRMCalculado" DOUBLE PRECISION NOT NULL,
    "fuerzaRelativa" DOUBLE PRECISION NOT NULL,
    "mesocicloId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "ResultadoTesteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigTesteoEjercicio" (
    "id" TEXT NOT NULL,
    "semanaId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "modalidad" "ModalidadTesteo" NOT NULL,
    "repsObjetivoIndirecto" INTEGER,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "ConfigTesteoEjercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PorcentajesCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "unRM" DOUBLE PRECISION NOT NULL,
    "modalidadTesteo" "ModalidadTesteo" NOT NULL,
    "fechaTesteo" TIMESTAMP(3) NOT NULL,
    "p100" DOUBLE PRECISION NOT NULL,
    "p94_3" DOUBLE PRECISION NOT NULL,
    "p90_6" DOUBLE PRECISION NOT NULL,
    "p88_1" DOUBLE PRECISION NOT NULL,
    "p85_6" DOUBLE PRECISION NOT NULL,
    "p83_1" DOUBLE PRECISION NOT NULL,
    "p80_7" DOUBLE PRECISION NOT NULL,
    "p78_6" DOUBLE PRECISION NOT NULL,
    "p76_5" DOUBLE PRECISION NOT NULL,
    "p74_4" DOUBLE PRECISION NOT NULL,
    "p72_3" DOUBLE PRECISION NOT NULL,
    "p70_3" DOUBLE PRECISION NOT NULL,
    "p68_8" DOUBLE PRECISION NOT NULL,
    "p67_5" DOUBLE PRECISION NOT NULL,
    "p66_2" DOUBLE PRECISION NOT NULL,
    "p65_0" DOUBLE PRECISION NOT NULL,
    "p63_8" DOUBLE PRECISION NOT NULL,
    "p62_7" DOUBLE PRECISION NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PorcentajesCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "gravedad" "GravedadNotificacion" NOT NULL DEFAULT 'INFO',
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "purgada" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaEntrenador" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaEntrenador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RutinaPlantilla" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RutinaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjercicioRutina" (
    "id" TEXT NOT NULL,
    "rutinaId" TEXT NOT NULL,
    "ejercicioId" TEXT,
    "nombreLibre" TEXT,
    "series" INTEGER NOT NULL,
    "repsMin" INTEGER NOT NULL,
    "repsMax" INTEGER NOT NULL,
    "descansoSeg" INTEGER NOT NULL,
    "tempo" TEXT,
    "metodo" TEXT,
    "notasTecnicas" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "EjercicioRutina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigLanding" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "heroTitulo" TEXT,
    "heroSubtitulo" TEXT,
    "heroImagenUrl" TEXT,
    "bioTexto" TEXT,
    "bioImagenUrl" TEXT,
    "testimonios" JSONB,
    "faqs" JSONB,
    "footerTexto" TEXT,
    "modoMantenimiento" BOOLEAN NOT NULL DEFAULT false,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigLanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAutenticacion" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 1,
    "bloqueadoHasta" TIMESTAMP(3),
    "ultimoIntento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAutenticacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamificacionCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "experiencia" INTEGER NOT NULL DEFAULT 0,
    "rachaDias" INTEGER NOT NULL DEFAULT 0,
    "ultimoCheckin" TIMESTAMP(3),
    "logrosGenerales" TEXT[],
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamificacionCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entrenador_email_key" ON "Entrenador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_invitationToken_key" ON "Cliente"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_passwordResetToken_key" ON "Cliente"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "FormularioInscripcion_clienteId_key" ON "FormularioInscripcion"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "CicloMenstrual_clienteId_key" ON "CicloMenstrual"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "MetricasSesion_sesionId_key" ON "MetricasSesion"("sesionId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilRespuesta_clienteId_key" ON "PerfilRespuesta"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "PorcentajesCliente_clienteId_ejercicioId_key" ON "PorcentajesCliente"("clienteId", "ejercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigLanding_entrenadorId_key" ON "ConfigLanding"("entrenadorId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroAutenticacion_ip_key" ON "RegistroAutenticacion"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "GamificacionCliente_clienteId_key" ON "GamificacionCliente"("clienteId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejercicio" ADD CONSTRAINT "Ejercicio_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAsignado" ADD CONSTRAINT "PlanAsignado_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAsignado" ADD CONSTRAINT "PlanAsignado_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioInscripcion" ADD CONSTRAINT "FormularioInscripcion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditoriaCliente" ADD CONSTRAINT "AuditoriaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CicloMenstrual" ADD CONSTRAINT "CicloMenstrual_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Macrociclo" ADD CONSTRAINT "Macrociclo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueMensual" ADD CONSTRAINT "BloqueMensual_macrocicloId_fkey" FOREIGN KEY ("macrocicloId") REFERENCES "Macrociclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semana" ADD CONSTRAINT "Semana_bloqueMensualId_fkey" FOREIGN KEY ("bloqueMensualId") REFERENCES "BloqueMensual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolumenSemanal" ADD CONSTRAINT "VolumenSemanal_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "Semana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaSesion" ADD CONSTRAINT "DiaSesion_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "Semana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueSesion" ADD CONSTRAINT "BloqueSesion_diaId_fkey" FOREIGN KEY ("diaId") REFERENCES "DiaSesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioPlanificado" ADD CONSTRAINT "EjercicioPlanificado_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "BloqueSesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioPlanificado" ADD CONSTRAINT "EjercicioPlanificado_diaId_fkey" FOREIGN KEY ("diaId") REFERENCES "DiaSesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioPlanificado" ADD CONSTRAINT "EjercicioPlanificado_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionRegistrada" ADD CONSTRAINT "SesionRegistrada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionRegistrada" ADD CONSTRAINT "SesionRegistrada_diaId_fkey" FOREIGN KEY ("diaId") REFERENCES "DiaSesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieRegistrada" ADD CONSTRAINT "SerieRegistrada_ejercicioPlanificadoId_fkey" FOREIGN KEY ("ejercicioPlanificadoId") REFERENCES "EjercicioPlanificado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieRegistrada" ADD CONSTRAINT "SerieRegistrada_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionRegistrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricasSesion" ADD CONSTRAINT "MetricasSesion_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionRegistrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilRespuesta" ADD CONSTRAINT "PerfilRespuesta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaEstancamiento" ADD CONSTRAINT "AlertaEstancamiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaEstancamiento" ADD CONSTRAINT "AlertaEstancamiento_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAdherencia" ADD CONSTRAINT "RegistroAdherencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_planAsignadoId_fkey" FOREIGN KEY ("planAsignadoId") REFERENCES "PlanAsignado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoTesteo" ADD CONSTRAINT "ResultadoTesteo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoTesteo" ADD CONSTRAINT "ResultadoTesteo_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigTesteoEjercicio" ADD CONSTRAINT "ConfigTesteoEjercicio_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigTesteoEjercicio" ADD CONSTRAINT "ConfigTesteoEjercicio_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "Semana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PorcentajesCliente" ADD CONSTRAINT "PorcentajesCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PorcentajesCliente" ADD CONSTRAINT "PorcentajesCliente_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaEntrenador" ADD CONSTRAINT "NotaEntrenador_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RutinaPlantilla" ADD CONSTRAINT "RutinaPlantilla_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioRutina" ADD CONSTRAINT "EjercicioRutina_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioRutina" ADD CONSTRAINT "EjercicioRutina_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "RutinaPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigLanding" ADD CONSTRAINT "ConfigLanding_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificacionCliente" ADD CONSTRAINT "GamificacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
