# AGENTS.md — Reglas Operativas para IL-Campus
> Este archivo es la fuente de verdad para cualquier agente de IA que trabaje en este proyecto.
> Fue redactado por el arquitecto externo (Claude) tras análisis completo del código base.
> **Leer completo antes de escribir cualquier línea de código.**

---

## 🧠 Contexto del Proyecto

IL-Campus es la plataforma digital de **IL-Coaching** (entrenador personal: Iñaki Legarreta).
Tiene tres superficies:

1. **Landing pública** — Visitantes ven planes, bio, testimonios, contacto vía WhatsApp.
2. **Campus del Entrenador** — Dashboard completo para gestionar clientes, planificaciones, finanzas, mensajería, métricas. Es la "caja de herramientas" del entrenador: sin restricciones de lógica, sin flujos forzados, control total.
3. **Portal del Cliente** — Acceso del alumno a su rutina, checkins, progreso, perfil y chat con el entrenador.

**No hay pasarela de pago.** Las contrataciones son offline (WhatsApp). El sistema gestiona lo que ocurre *después* de contratar.

---

## 🏗️ Stack y Capas (no negociable)

```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
Prisma ORM → Supabase (PostgreSQL) → Vercel
```

### Las 6 capas en orden estricto (de afuera hacia adentro):

```
Middleware → Vista → Acción → Servicio → Validador → Base de Datos
```

| Capa | Ubicación | Responsabilidad | Puede tocar DB directamente |
|---|---|---|---|
| Middleware | `src/middleware.ts` | Auth, rate limit, headers | ❌ |
| Vista | `src/app/**/*.tsx` | Render, estado UI, llamar acciones | ❌ |
| Acción | `src/nucleo/acciones/*.accion.ts` | Entry point de mutaciones, verificar sesión, delegar al servicio | Solo vía Prisma para guards de propiedad |
| Servicio | `src/nucleo/servicios/*.servicio.ts` | Lógica de negocio pura | ✅ vía `prisma` |
| Validador | `src/nucleo/validadores/*.validador.ts` | Esquemas Zod | ❌ |
| BD | `src/baseDatos/` | Conexión Prisma, schema | — |

**Regla de oro**: una Vista nunca importa `prisma`. Un Servicio nunca importa `next/cache`. Si esto ocurre, el código está en la capa incorrecta.

---

## 📁 Estructura de Carpetas — Dónde Va Cada Cosa

```
src/
├── app/
│   ├── componentes-landing/     # Componentes exclusivos de la landing pública
│   ├── entrenador/(dashboard)/  # Páginas y componentes del dashboard entrenador
│   │   └── [modulo]/
│   │       ├── page.tsx         # Solo lógica de página (fetch + render)
│   │       └── componentes/     # Componentes del módulo (NO crear en raíz del módulo)
│   ├── alumno/                  # Páginas y componentes del portal alumno
│   └── api/                     # API routes (solo para webhooks/cron)
│
├── compartido/
│   ├── componentes/             # ⭐ Componentes usados en MÁS DE UN módulo
│   │   └── planificacion/       # Componentes compartidos de planificación
│   ├── hooks/                   # Hooks reutilizables
│   └── infraestructura/         # Clientes externos (supabase, stores zustand)
│
├── nucleo/
│   ├── acciones/                # Server Actions — 1 archivo por entidad
│   ├── constantes/              # Constantes y arrays derivados de enums
│   ├── seguridad/               # JWT, MFA, sesión
│   ├── servicios/               # Lógica de negocio — 1 archivo por entidad
│   ├── tipos/                   # Tipos TypeScript compartidos
│   ├── utilidades/              # Funciones puras sin dependencias externas
│   └── validadores/             # Esquemas Zod — 1 archivo por entidad
│
└── baseDatos/
    ├── conexion.ts              # Export del cliente Prisma (singleton)
    └── esquema.prisma           # Fuente de verdad del modelo de datos
```

---

## ✅ Convenciones de Código (obligatorias)

### Nomenclatura
- Todo el código está en **español**: variables, funciones, clases, comentarios, commits.
- Archivos: `[entidad].[tipo].ts` — ej: `cliente.servicio.ts`, `plan.validador.ts`, `cobro.accion.ts`
- Componentes React: `PascalCase.tsx` con nombre descriptivo del rol — ej: `ListadoClientes.tsx`, `ModalGestionPago.tsx`
- Hooks: `use` + camelCase — ej: `useSesionLocal.ts`, `useMobile.ts`

### Componentes
- Si un componente se usa en **más de un módulo** → va en `src/compartido/componentes/`
- Si un componente es exclusivo de un módulo → va en `[modulo]/componentes/`
- **Prohibido duplicar componentes.** Antes de crear uno nuevo, buscar si existe en `compartido/`.
- Los `page.tsx` son páginas, no componentes. No deben superar ~80 líneas. La lógica va en componentes hijos.

### Acciones de Servidor
- Siempre `"use server"` al inicio.
- Siempre verificar sesión con `getEntrenadorSesion()` o `getAlumnoSesion()` antes de operar.
- Siempre validar con Zod antes de llamar al servicio.
- Siempre retornar `{ exito: true, ... }` o `{ error: "mensaje" }` — nunca lanzar excepciones al cliente.
- Siempre llamar `revalidatePath()` al final si mutó datos.
- **Un archivo de acciones por entidad.** Si `planificacion.accion.ts` supera 400 líneas, dividir por subdominio (ej: `macrociclo.accion.ts`, `sesion.accion.ts`).

### Constantes y Enums
- Los arrays de display derivados de enums de Prisma van en `src/nucleo/constantes/enums.ts`.
- **Prohibido escribir arrays de strings de dominio directamente en componentes JSX.**
- Ejemplo correcto:
  ```ts
  // src/nucleo/constantes/enums.ts
  export const GRUPOS_MUSCULARES = ['CUADRICEPS', 'ISQUIOTIBIALES', ...] as const;
  ```
  ```tsx
  // En el componente:
  import { GRUPOS_MUSCULARES } from '@/nucleo/constantes/enums';
  {GRUPOS_MUSCULARES.map(g => <option key={g}>{g}</option>)}
  ```

### Clientes de Supabase
- `supabase.ts` → `supabaseAdmin` → **solo servidor**, para operaciones que bypasean RLS.
- `supabase-cliente.ts` → `supabaseCliente` → **solo cliente (browser)**, para realtime y storage público.
- Nunca importar `supabaseAdmin` en un componente `"use client"`.

---

## 🚫 Anti-patrones Prohibidos

Estos patrones **no deben aparecer** en el código. Si los encontrás, reportarlos antes de continuar:

| Anti-patrón | Por qué está prohibido | Solución |
|---|---|---|
| `prisma` importado en un `*.tsx` de `src/app/` | Viola separación de capas | Mover lógica a una acción o servicio |
| Componente duplicado en dos rutas | Genera desincronización garantizada | Mover a `compartido/componentes/` |
| Array de strings de dominio en JSX | Desincroniza con el schema | Exportar desde `constantes/enums.ts` |
| `window.location.reload()` | Rompe el modelo de React | Usar `router.refresh()` |
| `any` en TypeScript | Elimina la protección del tipado | Tipar correctamente o usar `unknown` |
| Lógica de negocio en un `page.tsx` | Viola separación de capas | Extraer a servicio o acción |
| Fetch a `/api/` interno desde Server Components | Innecesario en App Router | Llamar directamente a la función del servicio |

---

## 🎨 Sistema de Diseño (no modificar sin consultar)

El design system está definido en `src/app/globals.css` y `tailwind.config.ts`. Los tokens son:

```
Colores: marino / marino-2 / marino-3 / marino-4 / naranja / naranja-h
         blanco / gris / gris-claro / rojo / verde / azul / yellow
Fuentes: font-barlow / font-barlow-condensed
```

- **Nunca usar colores hex directos** en componentes. Usar siempre las clases Tailwind del sistema (`bg-marino-2`, `text-naranja`, etc.).
- Los inputs ya tienen estilos globales en `globals.css`. No sobrescribir con `!important` sin justificación.

---

## 🔐 Seguridad (invariantes)

Estas reglas no tienen excepciones:

1. **Toda ruta de entrenador** verifica `getEntrenadorSesion()` al inicio de cada acción.
2. **Toda mutación sobre un recurso** verifica que el recurso pertenezca al entrenador autenticado antes de operar (BOLA — Broken Object Level Authorization).
3. **Toda entrada de usuario** pasa por un esquema Zod antes de llegar a Prisma.
4. **`supabaseAdmin`** nunca se expone al cliente.
5. **`JWT_SECRET`** nunca se loguea ni se expone en respuestas.

---

## 📏 Límites de Tamaño (señales de alerta)

Si un archivo supera estos límites, debe dividirse antes de agregar más funcionalidad:

| Tipo de archivo | Límite recomendado | Acción si supera |
|---|---|---|
| `*.accion.ts` | 400 líneas | Dividir por subdominio |
| `*.servicio.ts` | 500 líneas | Extraer utilidades o dividir |
| `page.tsx` | 80 líneas | Extraer a componentes hijos |
| Componente React | 250 líneas | Dividir en sub-componentes |

---

## 🔄 Flujo de Trabajo con el Arquitecto (Claude)

Este proyecto usa un modelo de desarrollo **Arquitecto + Ejecutor**:

- **Arquitecto (Claude en claude.ai)**: Define qué hacer, en qué orden, qué archivos tocar y qué no tocar. Hace el análisis y toma decisiones de diseño.
- **Ejecutor (OpenCode en Antigravity IDE)**: Implementa las instrucciones del arquitecto. No toma decisiones de arquitectura por su cuenta.

### Cuándo pausar y consultar al arquitecto:

- Antes de crear un nuevo archivo de servicio o acción que no exista aún.
- Antes de modificar el schema de Prisma (`esquema.prisma`).
- Antes de agregar una nueva dependencia (`npm install`).
- Si una tarea requiere modificar más de 5 archivos simultáneamente.
- Si hay ambigüedad sobre en qué capa o carpeta va algo nuevo.
- Si el código a modificar no tiene tests y la modificación es de alto riesgo.

### Qué puede hacer OpenCode sin consultar:

- Implementar funcionalidades dentro de módulos existentes siguiendo los patrones ya establecidos.
- Refactorizar componentes duplicados hacia `compartido/`.
- Agregar validaciones Zod a acciones existentes.
- Corregir bugs tipados claramente.
- Actualizar estilos dentro del design system existente.

---

## ✔️ Checklist Pre-Commit

Antes de hacer commit, verificar:

```bash
npm run lint        # Sin errores de ESLint
npm run typecheck   # Sin errores de TypeScript
npm run test        # 30/30 tests pasando (o más)
```

Si alguno falla, **no hacer commit**. Corregir primero.

---

## 📓 Registro de Cambios

Cada intervención significativa debe registrarse en `bitacora_tecnica.md` con:
- Fecha
- Qué se cambió y por qué
- Archivos afectados
- Estado de tests post-cambio

---

*Última actualización: arquitecto externo tras análisis del código base — Abril 2026*
*Cualquier modificación a este archivo debe ser aprobada por el arquitecto.*
