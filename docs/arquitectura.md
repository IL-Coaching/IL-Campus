# Arquitectura de IL-Campus

## Decisiones Técnicas

- **Next.js 14 (App Router)**: Permite manejar frontend y backend en un único repositorio para acelerar desarrollo.
- **TypeScript**: Tipado estático en todo el ciclo de vida.
- **Tailwind CSS**: Estilos consistentes sin necesidad de escribir CSS a mano.
- **Supabase (PostgreSQL)**: DB, auth y storage bajo un mismo servicio, excelente escalabilidad.
- **Prisma ORM**: ORM que asegura validación estricta desde la base de datos hasta el cliente.
- **Zod**: Validación de esquemas en la capa de servicios.
- **Vercel / Resend**: Para CI/CD de despliegue y envío rápido de emails.

## Estructura de Carpetas

```
/
├── .github/workflows/        # CI/CD
├── .husky/                   # Pre-commit hooks
├── config/                   # Configuraciones centralizadas
│   ├── baseDatos.config.ts
│   ├── seguridad.config.ts
│   └── sitio.config.ts
├── docs/                     # Documentación técnica
├── scripts/                  # Scripts de mantenimiento
├── src/
│   ├── app/                  # Rutas y páginas Next.js
│   ├── baseDatos/            # Esquema Prisma y conexión
│   ├── compartido/           # UI compartida e infraestructura
│   ├── middleware.ts         # Seguridad y autenticación
o/               #│   └── nucle Lógica de negocio
│       ├── acciones/         # Server Actions
│       ├── constantes/       # Constantes del dominio
│       ├── planificacion/    # Lógica de planificaciones
│       ├── seguridad/        # JWT, MFA, criptografía
│       ├── servicios/        # Lógica de negocio (servicios)
│       ├── testeo/           # Lógica de testeo
│       ├── tipos/            # Tipos TypeScript
│       ├── utilidades/       # Funciones utilitarias
│       └── validadores/      # Esquemas Zod
└── tests/                    # Suite de tests
    ├── unitarios/
    ├── integracion/
    ├── seguridad/
    └── e2e/
```

## Estándar de Seguridad (ArchSecure AI)

Este proyecto se rige por el sistema **ArchSecure AI**, priorizando:

- ✅ Validación de entradas con Zod en la capa de servicios
- ✅ Middleware de seguridad con headers CSP, HSTS, X-Frame-Options
- ✅ Protección de rutas autenticadas (entrenador/alumno)
- ✅ Centralización de sesión en `src/nucleo/seguridad`
- ✅ Configuraciones centralizadas en `/config`
- ✅ Pre-commit hooks (lint + typecheck)
- ✅ CI/CD con GitHub Actions
- ✅ Nomenclatura estricta: `[entidad].servicio.ts`, `[entidad].validador.ts`
- ⚠️ Tests de seguridad en desarrollo

## Capas de la Aplicación

1. **Middleware**: Primera capa - seguridad y headers
2. **Interfaz (Vistas)**: Ubicadas en `src/app`. No contienen lógica de base de datos.
3. **Acciones de Servidor**: Puerta de entrada para mutaciones de datos. Delegar siempre al servicio.
4. **Servicios (`src/nucleo/servicios`)**: Donde reside la lógica de negocio pura y validaciones complejas.
5. **Validadores (`src/nucleo/validadores`)**: Esquemas Zod para validación de entradas.
6. **Base de Datos (`src/baseDatos`)**: Acceso directo a datos vía Prisma.

## Idioma

El proyecto está completamente en **español** (variables, funciones, comandos, documentación).

## Commands

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Calidad
npm run lint        # ESLint
npm run typecheck  # TypeScript

# Tests
npm run test        # Todos
npm run test:unit   # Unitarios
npm run test:seguridad  # Seguridad
```
