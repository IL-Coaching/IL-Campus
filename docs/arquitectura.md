# Arquitectura de IL-Campus

## Decisiones Técnicas

- **Next.js 14 (App Router)**: Permite manejar frontend y backend en un único repositorio para acelerar desarrollo.
- **TypeScript**: Tipado estático en todo el ciclo de vida.
- **Tailwind CSS**: Estilos consistentes sin necesidad de escribir CSS a mano.
- **Supabase (PostgreSQL)**: DB, auth y storage bajo un mismo servicio, excelente escalabilidad.
- **Prisma ORM**: ORM que asegura validación estricta desde la base de datos hasta el cliente.
- **Vercel / Resend**: Para CI/CD de despliegue y envío rápido de emails.

## Estructura de Carpetas Explicada

La aplicación se divide en:

- `config`: Configuraciones de servicios (BD, Auth, Sitio).
- `docs`: Documentación principal.
- `src/nucleo`: Lógica de negocios enfocada en cada módulo (cliente, rutina, etc.).
- `src/compartido`: Recursos reusables de UI o utilidades.
- `src/app`: Sólo ruteo, vistas layout y page que conectan lógica de negocio con UI.
- `src/baseDatos`: Configuración Prisma y conexión Supabase.
- `tests`: Pruebas divididas por unidad, integración o E2E.
- `scripts`: Entorno de scripting para tareas o CI.

## Capas de la Aplicación

Para mantener un código senior y escalable, seguimos estos niveles:

1. **Interfaz (Vistas)**: Ubicadas en `src/app`. No contienen lógica de base de datos.
2. **Acciones de Servidor**: Puerta de entrada para mutaciones de datos. Delegar siempre al servicio.
3. **Servicios (`src/nucleo/servicios`)**: Donde reside la lógica de negocio pura y validaciones complejas.
4. **Respositorio / DB (`src/baseDatos`)**: Acceso directo a datos vía Prisma.

## Estándar de Seguridad

Este proyecto se rige por el sistema **ArchSecure AI**, priorizando:

- Validación de entradas en la capa de servicios.
- Centralización de sesión en una capa de seguridad (`src/nucleo/seguridad`).
- Nomenclatura estricta: `[entidad].servicio.ts`, `[entidad].accion.ts`.

Ningún fichero debe cruzar fronteras sin propósito claro.
Ningún archivo lleva lógica fuera de su dominio.
Todos los ficheros deben ser nombrados en español.
