# 📓 BITÁCORA TÉCNICA — IL-CAMPUS

## Versión 2.1 — Pipeline ArchSecure AI activo

Este archivo registra las decisiones arquitectónicas, cambios realizados y tareas pendientes siguiendo el protocolo de la **Tool Box (ArchSecure AI v4.0)**.

---

### 🚀 ESTADO ACTUAL

- **Fase:** 5 — Limpieza y Optimización (Completada)
- **Estado del Pipeline:** PROYECTO LIMPIO → Mantenimiento
- **Entorno de Deploy:** Vercel (Next.js 14 + Prisma + Supabase)
- **Node.js:** 20.x (declarado en package.json ✅)
- **Tests:** 30 passing ✅

---

### 🛠️ LOG DE INTERVENCIONES

#### [2026-03-21] — Intervención de LIMPIEZA (Arquitecto v2.0)

**Agente:** Arquitecto  
**Tipo:** Limpieza Nivel 1 - Eliminación de código muerto

- **Archivos eliminados (código muerto):**
  - [x] `src/nucleo/acciones/notas.accion.ts` — Duplicado de `nota.accion.ts`
  - [x] `src/nucleo/acciones/invitacion.accion.ts` — No usado en ningún archivo
  - [x] `dev.log` — Log de desarrollo local
  - [x] `lint-out.txt` — Output de linter
  - [x] `docs/TAREAS.md` — Desactualizado
  - [x] `tasklist.md` — Duplicado de bitácora
  - [x] `Extras/Tool Box/` — 13 archivos duplicados de `.agents/workflows/`

- **Correcciones:**
  - [x] Test actualizado: `notificacion.test.ts` — Añadido campo `enlace` faltante
  - [x] Verificación: Lint ✅, TypeScript ✅, Tests ✅ (30/30 passing)

**Gate de calidad:** ✅ Proyecto limpio y verificado

---

#### [2026-02-26] — Intervención del ARQUITECTO (ArchSecure AI v4.0)

**Agente:** Arquitecto  
**Tipo:** Limpieza Nivel 1 (sin aprobación requerida)

- **Cambios realizados:**
  - [x] Eliminados archivos de debug y output sueltos en raíz: `eslint.json`, `eslint2.json`, `l.json`, `lint_output.txt`, `errors.txt`, `eslint_errors.txt`, `eslint_output.txt`
  - [x] Movido `MIGRACION.md` → `docs/MIGRACION.md`
  - [x] Creada carpeta `scripts/` y movidos scripts sueltos: `count.js`, `check-owner.js`, `test-ejercicio.js`, `test-update.js`
  - [x] Actualizado `.gitignore` con `/scripts` y `*.txt`
  - [x] `skipLibCheck: true` evaluado — **JUSTIFICADO** para Next.js (tipos generados en `.next/types/`)
  - [x] Bitácora actualizada al estado real

**Deuda técnica identificada (no bloqueante):**

- Tests declarados en `package.json` pero sin implementación real → pendiente de Centinela de Calidad
- `scripts/` contiene scripts de debug sin documentar → limpiar o formalizar en futuro sprint

**Gate de calidad:** ✅ Listo para el Guardián de Seguridad

---

#### [2026-02-26] — Intervención del GUARDIÁN DE SEGURIDAD (ArchSecure AI v4.0)

**Agente:** Guardián de Seguridad  
**Tipo:** Auditoría completa (OWASP Top 10 + API Security)

**Resultados:**

| Severidad | Total | Parchados | Pendiente |
|---|---|---|---|
| 🔴 Crítica | 0 | — | 0 |
| 🟠 Alta | 2 | 2 | 0 |
| 🟡 Media | 2 | 0 | 2 (doc.) |
| 🟢 Baja | 3 | 0 | 3 (doc.) |

**Parches aplicados (Alta):**

- [x] **HALLAZGO #1** — `Math.random()` para códigos de activación de acceso → reemplazado por `crypto.getRandomValues()` (CSPRNG) en `cripto.ts` y `cliente.servicio.ts`. Nuevo método `generarCodigoActivacion()` centraliza la generación.
- [x] **HALLAZGO #2** — Middleware decodificaba JWT sin verificar firma (solo `JSON.parse` del payload base64) → reemplazado por `jwtVerify` de `jose` (compatible Edge Runtime). Un atacante podía forjar tokens con `role='entrenador'`.

**Hallazgos documentados (no bloqueantes):**

- 🟡 **CSP con `'unsafe-inline'` y `'unsafe-eval'`**: Requeridos por Next.js/Tailwind actualmente. Reducir en futura iteración con nonces.
- 🟡 **`console.error()` expone detalles internos en logs de servidor**: Aceptable en server-side (no llega al cliente), pero en el futuro considerar logger estructurado.
- 🟢 **Sin rate limiting en endpoints de auth**: Bcrypt limita velocidad de brute force. Agregar rate limiting en `/ingresar` es mejora recomendada para escalar.
- 🟢 **Email hardcodeado en `inscripcion.accion.ts`**: `legarretatraining@gmail.com` está fijo en código. Pasar a variable de entorno como `ENTRENADOR_EMAIL`.
- 🟢 **`supabase.ts` usa `SUPABASE_SERVICE_ROLE_KEY`**: Solo se usa server-side ✅. Sin riesgo de exposición cliente.

**Gate de calidad:** ✅ Listo para Fase 4 — Sin críticas ni altas pendientes

---

### 🔒 NORMAS DE SEGURIDAD PARA FASE 4 (Adaptación Móvil)

Estas reglas deben respetarse en todo código nuevo de la Fase 4:

1. **Nunca validar solo en cliente** — Toda validación de negocio se hace en Server Actions
2. **Tokens con CSPRNG** — Usar `CriptoServicio.generarCodigoActivacion()` o `generateRandomToken()` para cualquier token nuevo. Nunca `Math.random()`
3. **No exponer datos sensibles en URL** — IDs de recursos internos van por cookie/sesión, no por query string en rutas públicas
4. **Server Actions con verificación de sesión** — Toda acción destructiva o de escritura llama primero a `getEntrenadorSesion()` o `getAlumnoSesion()`
5. **Inputs sanitizados con Zod** — Todo input de usuario pasa por validador Zod antes de llegar a la DB
6. **Imágenes en Supabase Storage** — Validar tipo MIME en servidor antes de subir (no confiar en extensión del archivo)
7. **No incluir contraseñas ni tokens en logs** — `console.error(error)` sí, `console.error('token:', token)` nunca

---

#### [2026-02-24] — Inicio de Refactorización Fase 1

- **Decisión:** Iniciar con la simplificación de la biblioteca de ejercicios.
- **Cambios realizados:**
  - [x] Simplificación de campos en `EsquemaEjercicio`.
  - [x] Reparación de acciones CRUD en `ejercicio.accion.ts`.
  - [x] Habilitación de "Texto Libre" en `SelectorEjercicioCelda.tsx`.
  - [x] Creación de `ModalEditarEjercicio.tsx` e integración en biblioteca.
  - [x] Resolución de errores críticos de TypeScript (enEstasis, descansoSegundos).
  - [x] Implementación de vistas colapsables jerárquicas (Macro -> Micro).
  - [x] Funcionalidad de Drag & Drop para reordenar ejercicios en sesiones.
  - [x] Módulo de Finanzas: Registro de cobros, historial y banner de estado (Al día/Vencido).
- **Razón:** La biblioteca actual era inoperante y demasiado compleja para el uso diario. Se habilitó un flujo mucho más ágil para el entrenador.

---

### 📋 ROADMAP DEL PIPELINE

| Fase | Agente | Estado |
|---|---|---|
| Fase 1: Reparar Biblioteca de Ejercicios | Arquitecto | ✅ Completo |
| Fase 1: Habilitar Texto Libre en Planificación | Arquitecto | ✅ Completo |
| Fase 1: Limpieza TypeScript (Guardian Deploy) | Guardián Deploy | ✅ Completo |
| Fase 2: UX del Constructor (Colapsables, D&D) | Arquitecto | ✅ Completo |
| Fase 3: Vínculo Cliente-Finanzas | Arquitecto | ✅ Completo |
| Limpieza de raíz y estructura del repo | Arquitecto | ✅ 2026-02-26 |
| Fase 4: Adaptación Móvil | Por definir | ✅ 2026-03-19 |
| Auditoría de seguridad | Guardián de Seguridad | ✅ 2026-03-19 |
| **Suite de tests críticos** | Centinela de Calidad | ✅ 2026-03-19 |
| Limpieza de código muerto | Arquitecto | ✅ 2026-03-21 |
- [x] **Calidad:** Creada suite de tests unitarios para `EsquemaActualizarEjercicio` (`tests/unitarios/planificacion.test.ts`). Cobertura del 100% en lógica de `ModoMedicion`.

---

### 📢 ADRs (Decisiones Arquitectónicas Registradas)

#### ADR-001: skipLibCheck: true en tsconfig

- **Decisión:** Mantener `skipLibCheck: true`
- **Razón:** Next.js genera tipos en `.next/types/` que pueden tener conflictos con versiones de TypeScript. Es la configuración recomendada por el equipo de Next.js.
- **Impacto:** Bajo. El código propio sí es verificado con `strict: true`.

#### ADR-002: Módulo nucleo/ como capa de lógica de negocio

- **Decisión:** Toda la lógica de negocio vive en `src/nucleo/` separada de las pages de Next.js.
- **Razón:** Separación clara entre infraestructura (Next.js/Prisma) y dominio.

---

### 📢 NOTAS DEL ARQUITECTO

- Se prioriza la **estabilidad del build** para evitar fallos en Vercel.
- Se mantiene el campo de **video** como opcional pero accesible.
- Se implementará **Soft Delete** (archivar) en lugar de borrado físico.
- La carpeta `scripts/` es de uso local — no forma parte del proyecto en producción.
