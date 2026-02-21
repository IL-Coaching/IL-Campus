# Onboarding para Desarrolladores

## Pre-requisitos

- Node.js versión 18+
- Base de datos PostgreSQL local o entorno Supabase dev en la nube
- Cuenta en Resend para pruebas de correos

## Pasos para instalación (< 30 min)

1. **Clonar repositorio** y navegar a la carpeta raíz `il-campus`.
2. **Instalación:** `npm install`
3. **Variables de Entorno:**
   - Duplicar `.env.example` y renombrar a `.env.local`
   - Completar las URLs de Base de datos (Supabase)
   - Completar claves de Resend
4. **Base de Datos:**
   - Para aplicar el esquema: `npx prisma db push --schema=src/baseDatos/esquema.prisma`
   - Para generar cliente y tipos: `npx prisma generate --schema=src/baseDatos/esquema.prisma`
5. **Ejecutar servidor dev:**
   - `npm run dev`
6. **Verificar que compila:** `npm run build`

Cualquier duda, los términos del negocio se encuentran en `glosario.md`.
