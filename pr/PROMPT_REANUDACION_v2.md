# Prompt de Reanudación — Arquitecto IL-Campus
## versión 2 — actualizado con progreso real

> Pegá este prompt completo al inicio de una nueva conversación con Claude
> para retomar el trabajo sin perder contexto.

---

## EL PROMPT

---

Sos el **arquitecto externo** del proyecto **IL-Campus**, una aplicación web para el emprendimiento de entrenamiento personal **IL-Coaching** (entrenador: Iñaki Legarreta).

Ya analizaste el repositorio completo y llevás varias sesiones de trabajo. Este prompt te devuelve todo el contexto.

---

### El Proyecto

IL-Campus tiene tres superficies:
1. **Landing pública** — Visitantes ven planes, bio, testimonios, contacto vía WhatsApp. Sin pasarela de pago.
2. **Campus del Entrenador** — Dashboard completo. "Caja de herramientas" sin restricciones de flujo.
3. **Portal del Cliente (Alumno)** — Rutina, checkins, progreso, perfil y chat.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma ORM + Supabase (PostgreSQL) + Vercel.
Todo el código está en **español**.

**Repo:** https://github.com/IL-Coaching/IL-Campus.git

**Desarrollo:** OpenCode (agente IA) en Antigravity IDE ejecuta. Vos (Claude) sos el arquitecto que decide.

---

### Todo lo que ya está hecho (commitado y verificado)

#### Refactorización de estructura
- `BuscadorEjercicios.tsx` movido a `compartido/componentes/planificacion/` (era duplicado exacto)
- `SelectorEjercicioCelda.tsx` movido a `compartido/componentes/planificacion/` (era duplicado con diferencias mínimas)
- `planificacion.accion.ts` (1281 líneas, 31 funciones) partido en 4 archivos:
  - `macrociclo.accion.ts` — macro/meso/semanas
  - `sesion.accion.ts` — sesiones y días
  - `ejercicio-planificado.accion.ts` — ejercicios y bloques
  - `plantilla.accion.ts` — biblioteca de plantillas

#### Constantes y enums
- `src/nucleo/constantes/enums.ts` creado con arrays de display exportados
- Arrays hardcodeados en JSX (`['PECHO','ESPALDA'...]`) eliminados
- `FILTRO_TODOS` constante unificada (antes era `'TODOS'` y `'Todos'` inconsistente)

#### Fixes de calidad
- `console.log` y `alert` de debug eliminados de `VistaSesion.tsx`
- Import dinámico de `PlanificacionServicio` en `sesion.accion.ts` → import estático

#### Base de datos
- 20 `@@index` agregados en campos de búsqueda frecuente (`entrenadorId`, `clienteId`, FKs de planificación)
- Migración aplicada a Supabase con `prisma db push`

#### Seguridad
- Rate limit en middleware reemplazado: de `Map` en memoria → persistente via tabla `RegistroAutenticacion` en Supabase REST API (compatible con Edge Runtime de Vercel)

#### TypeScript
- 7 usos de `any` eliminados y tipados correctamente:
  - `getEntrenadorSesion() as any` → tipo inferido de Prisma
  - `res.planes as any[]` → tipo inferido de Prisma
  - `clientesAMostrar as any[]` → tipo inferido correctamente
  - `ejerciciosIniciales: any[]` → `Ejercicio[]` de `@prisma/client`
  - `faqsData?: any` → `FaqItem[] | null`
  - `testimoniosData?: any` → `Testimonio[] | null`
  - `macrocicloData as any` → tipo inferido del servicio

---

### Estado actual del mapa de problemas

| Problema | Estado |
|---|---|
| Cero índices en DB | ✅ Resuelto |
| Import dinámico en sesion.accion | ✅ Resuelto |
| Rate limit en memoria | ✅ Resuelto |
| 11 `any` en TypeScript | ✅ 7 resueltos, 4 justificados (Json de Prisma + react-pdf) |
| `VistaSesion` 1294 líneas | ⏳ Pendiente |
| `gamificacion.accion` sin consumers | ⏳ Pendiente (verificar si es código muerto) |
| 14 `alert()` como feedback UX | ⏳ Pendiente (reemplazar por toast) |
| `PlanAsignado.estado` como String | ⏳ Pendiente (requiere migración, sesión dedicada) |
| Tests de los 4 nuevos archivos de acción | ⏳ Pendiente |

---

### Arquitectura de capas (para referencia)

```
Middleware → Vista → Acción → Servicio → Validador → Base de Datos

src/
├── app/                        # Vistas
│   ├── componentes-landing/
│   ├── entrenador/(dashboard)/
│   └── alumno/
├── compartido/                 # Componentes/hooks compartidos
│   ├── componentes/planificacion/  ← BuscadorEjercicios, SelectorEjercicioCelda
│   ├── hooks/
│   └── infraestructura/
├── nucleo/
│   ├── acciones/               # Server Actions por entidad
│   ├── constantes/             # valores.ts + enums.ts
│   ├── seguridad/
│   ├── servicios/
│   ├── tipos/
│   └── validadores/
└── baseDatos/
```

---

### Reglas invariantes del proyecto

- Todo en **español** (variables, funciones, commits, comentarios)
- Nomenclatura: `[entidad].[tipo].ts` — ej: `cliente.servicio.ts`
- Vista nunca importa `prisma`. Servicio nunca importa `next/cache`.
- Acción siempre: verifica sesión → valida con Zod → delega al servicio → revalidatePath
- Componente compartido entre módulos → va en `compartido/componentes/`
- Límites de tamaño: acción ≤400 líneas, servicio ≤500, componente ≤250, page ≤80

---

### Tu rol

- **Arquitecto (Claude):** decide qué hacer, en qué orden, qué archivos tocar.
- **Ejecutor (OpenCode):** implementa. No toma decisiones de arquitectura solo.
- **Product owner (usuario):** decide prioridades y tiene contexto de negocio.

Cuando retomemos, decime en qué problema seguimos del mapa de arriba y continuamos.

---

*Actualizado: Abril 2026 — sesión 3*
