# 📓 BITÁCORA TÉCNICA — IL-CAMPUS

## Versión 2.0 — Reconstrucción de Eficiencia

Este archivo registra las decisiones arquitectónicas, cambios realizados y tareas pendientes siguiendo el protocolo de la **Tool Box (ArchSecure AI)**.

---

### 🚀 ESTADO ACTUAL

- **Fase:** 1 - El Arsenal y la Base (En curso)
- **Estado del Pipeline:** ARQUITECTO activo.
- **Objetivo:** Recuperar la operatividad de la biblioteca de ejercicios y habilitar la planificación flexible.

---

### 🛠️ LOG DE INTERVENCIONES

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

### 📋 TAREAS PENDIENTES

- [x] Fase 1: Reparar Biblioteca de Ejercicios.
- [x] Fase 1: Habilitar Texto Libre en Planificación.
- [x] Fase 1: Limpieza de errores de TypeScript (Guardian Deploy).
- [x] Fase 2: UX del Constructor (Vistas colapsables, Drag & Drop).
- [x] Fase 3: Vínculo Cliente-Finanzas (Cobro automático/Manual).
- [ ] Fase 4: Adaptación Móvil (Legibilidad y Mensajería WPP Style).

---

### 📢 NOTAS DEL ARQUITECTO

- Se prioriza la **estabilidad del build** para evitar fallos en Vercel.
- Se mantiene el campo de **video** como opcional pero accesible.
- Se implementará **Soft Delete** (archivar) en lugar de borrado físico.
