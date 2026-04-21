-- Migración: Convertir PlanAsignado.estado de String a enum EstadoPlan
-- Fecha: 2026-04-21

-- 1. Crear el enum
CREATE TYPE "EstadoPlan" AS ENUM ('ACTIVO', 'ARCHIVADO', 'VENCIDO', 'CANCELADO');

-- 2. Normalizar valores existentes en la DB antes de cambiar el tipo
UPDATE "PlanAsignado" SET "estado" = 'ACTIVO' WHERE "estado" IN ('activo', 'activa', 'active');
UPDATE "PlanAsignado" SET "estado" = 'ARCHIVADO' WHERE "estado" IN ('archivado', 'archived');
UPDATE "PlanAsignado" SET "estado" = 'VENCIDO' WHERE "estado" IN ('vencido', 'vencida', 'expired');
UPDATE "PlanAsignado" SET "estado" = 'CANCELADO' WHERE "estado" IN ('cancelado', 'cancelada', 'cancelled');

-- 3. Cambiar el tipo de columna
ALTER TABLE "PlanAsignado" ALTER COLUMN "estado" TYPE "EstadoPlan" USING "estado"::"EstadoPlan";