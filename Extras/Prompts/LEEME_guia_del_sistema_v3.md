# SISTEMA ARCHSECURE AI — GUÍA DE USO
# Versión 3.0 — Sistema completo con todos los módulos
# Cómo combinar el Prompt Maestro con los módulos de extensión

---

## Filosofía del sistema

ArchSecure AI no es un asistente que responde preguntas.
Es un arquitecto de software senior que trabaja junto al equipo.
Construye, audita, corrige y documenta con criterio profesional.

Los módulos de extensión son capas de contexto especializado.
Cuanto más contexto cargado, más precisa y profunda la intervención.

---

## Estructura completa del sistema

```
Prompt Maestro (base — siempre presente)
    Prompt_Maestro.md
    └── Arquitectura + Seguridad + Metodología + Auditoría + Comandos base

Módulos de stack (según el lenguaje o plataforma del proyecto)
    modulo_python.md             → Proyectos en Python (reemplaza convenciones TS del Maestro)

Módulos de dominio (según el tipo de proyecto)
    modulo_bots.md               → Proyectos de Discord / Telegram / WhatsApp
    modulo_automatizaciones.md   → Scripts, cron jobs, procesos desatendidos

Módulos de disciplina técnica (según lo que se va a hacer)
    modulo_basedatos.md          → Todo proyecto con acceso a base de datos
    modulo_mobile.md             → Apps que deben funcionar en móvil y desktop
    modulo_testing.md            → Cuando se establece o mejora la estrategia de tests

Módulo de documentación
    modulo_bitacora.md           → Genera, audita y mantiene la bitácora técnica del proyecto

Módulo de comunicación (siempre activo)
    modulo_equipo_semisenioir.md → Ajusta tono y nivel de explicación al equipo
```

---

## Combinaciones por tipo de proyecto

### App web con Node.js / TypeScript
```
Cargar: Prompt Maestro + modulo_basedatos + modulo_equipo_semisenioir
```

### App web que debe funcionar en mobile
```
Cargar: Prompt Maestro + modulo_mobile + modulo_basedatos + modulo_equipo_semisenioir
```

### Bot de Telegram en Python
```
Cargar: Prompt Maestro + modulo_bots + modulo_python + modulo_equipo_semisenioir
```

### Bot de Discord en TypeScript
```
Cargar: Prompt Maestro + modulo_bots + modulo_equipo_semisenioir
```

### Script de automatización en Python
```
Cargar: Prompt Maestro + modulo_automatizaciones + modulo_python + modulo_equipo_semisenioir
```

### App full-stack con React + Node.js (con DB y mobile)
```
Cargar: Prompt Maestro + modulo_mobile + modulo_basedatos + modulo_equipo_semisenioir
```

### Proyecto sin tests o con tests en mal estado
```
Cargar: Prompt Maestro + [módulos del stack] + modulo_testing + modulo_equipo_semisenioir
Activar con: /test audit
```

### Auditoría de seguridad de cualquier proyecto
```
Cargar: Prompt Maestro + [módulos del stack] + modulo_equipo_semisenioir
Activar con: /audit full
```

### Proyecto nuevo que necesita su bitácora
```
Cargar: Prompt Maestro + modulo_bitacora + modulo_equipo_semisenioir
Activar con: /bitacora new
```

### Incorporación de desarrollador nuevo a un proyecto existente
```
Cargar: Prompt Maestro + modulo_bitacora + modulo_equipo_semisenioir
Adjuntar: bitacora del proyecto (bitacora.md)
Activar con: /bitacora audit
```

### Proyecto Python full-stack completo (máximo contexto)
```
Cargar: Prompt Maestro + modulo_python + modulo_mobile + modulo_basedatos
      + modulo_testing + modulo_bitacora + modulo_equipo_semisenioir
```

---

## Cuándo agregar cada módulo

| Módulo | Agregar cuando... |
|---|---|
| `modulo_python` | El stack usa Python — adapta convenciones, herramientas y patrones de seguridad |
| `modulo_bots` | El proyecto incluye un bot de Discord, Telegram o WhatsApp |
| `modulo_automatizaciones` | Hay scripts, cron jobs o procesos desatendidos |
| `modulo_mobile` | La app debe funcionar en dispositivos móviles y desktop |
| `modulo_basedatos` | El proyecto accede a cualquier base de datos (SQL, NoSQL, Redis) |
| `modulo_testing` | Se va a establecer, auditar o mejorar la estrategia de tests |
| `modulo_bitacora` | Se va a crear, auditar o mantener la bitácora técnica del proyecto |
| `modulo_equipo_semisenioir` | **Siempre** — ajusta el tono sin cambiar el contenido técnico |

---

## Árbol de decisión rápido

```
¿El proyecto usa Python?
  → Sí → agregar modulo_python

¿El proyecto tiene o tendrá base de datos?
  → Sí (casi siempre) → agregar modulo_basedatos

¿La app debe funcionar en móviles?
  → Sí → agregar modulo_mobile

¿El proyecto incluye un bot de mensajería?
  → Sí → agregar modulo_bots

¿Hay scripts o jobs automatizados?
  → Sí → agregar modulo_automatizaciones

¿Los tests están ausentes, desorganizados o son insuficientes?
  → Sí → agregar modulo_testing

¿El proyecto necesita una bitácora nueva o tiene una desactualizada?
  → Sí → agregar modulo_bitacora

¿Hay un desarrollador nuevo incorporándose al proyecto?
  → Sí → agregar modulo_bitacora + adjuntar bitacora.md del proyecto

¿El equipo es semi-senior?
  → Siempre → agregar modulo_equipo_semisenioir
```

---

## Referencia completa de comandos

### Comandos del Prompt Maestro

| Comando | Acción |
|---|---|
| `/build [descripción]` | Construir nuevo módulo o proyecto desde cero |
| `/restructure` | Reestructurar proyecto existente |
| `/audit full` | Auditoría de seguridad completa (4 fases) |
| `/audit [módulo]` | Auditar módulo específico |
| `/fix #[N]` | Aplicar remediación del hallazgo N |
| `/fix all low` | Parchear automáticamente todos los hallazgos de severidad baja |
| `/explain #[N]` | Explicar hallazgo N en lenguaje no técnico |
| `/report` | Generar reporte ejecutivo final |
| `/verify #[N]` | Verificar que el hallazgo N está resuelto |
| `/sbom` | Generar o validar el Software Bill of Materials |
| `/checklist` | Mostrar checklist del modo activo |
| `/docs` | Generar o actualizar documentación del módulo actual |

### Comandos del Módulo Mobile

| Comando | Acción |
|---|---|
| `/mobile scan` | Análisis completo del repositorio — detecta estado de compatibilidad mobile |
| `/mobile audit` | Auditoría en app que ya declara ser responsive |
| `/mobile migrate` | Plan y ejecución de migración a diseño híbrido |
| `/mobile fix #[N]` | Aplica corrección del hallazgo N de compatibilidad |
| `/mobile checklist` | Checklist de validación completo por viewport |
| `/mobile report` | Reporte de estado de compatibilidad mobile |
| `/mobile docs` | Genera o actualiza `docs/mobile.md` |

### Comandos del Módulo Base de Datos

| Comando | Acción |
|---|---|
| `/db audit` | Audita esquema, índices, seguridad y patrones de acceso |
| `/db migration [descripción]` | Genera migración versionada para el cambio descrito |
| `/db explain [query]` | Analiza una query y propone optimizaciones |
| `/db docs` | Genera o actualiza `docs/basedatos.md` |

### Comandos del Módulo Testing

| Comando | Acción |
|---|---|
| `/test audit` | Audita el estado actual de los tests del proyecto |
| `/test build [módulo]` | Genera suite de tests para el módulo indicado |
| `/test security` | Genera tests específicos de seguridad (auth, autorización, entradas) |
| `/test coverage` | Analiza y reporta cobertura actual vs umbrales |
| `/test fix #[N]` | Corrige hallazgo N de la auditoría de testing |

### Comandos del Módulo Bitácora

| Comando | Acción |
|---|---|
| `/bitacora new` | Inicia relevamiento para generar una bitácora desde cero |
| `/bitacora audit` | Audita una bitácora existente contra los criterios de calidad |
| `/bitacora adr [descripción]` | Genera una nueva entrada ADR para una decisión específica |
| `/bitacora update [sección]` | Actualiza una sección específica de la bitácora |
| `/bitacora onboarding` | Genera o actualiza específicamente la guía de incorporación |
| `/bitacora sync` | Compara la bitácora con el código actual y detecta brechas |
| `/bitacora glossary` | Extrae términos del dominio del código y sugiere entradas para el glosario |

---

## Reglas de comportamiento del sistema

### El sistema SIEMPRE:
- Lee todos los módulos cargados antes de responder
- Aplica el tono del Módulo Equipo en toda comunicación
- Documenta cada decisión significativa antes de ejecutarla
- Pide aprobación humana para cambios de Nivel 2 y 3 (ver Prompt Maestro)
- Emite un resumen de cambios al final de cada intervención significativa

### El sistema NUNCA:
- Ejecuta acciones destructivas o irreversibles sin aprobación explícita
- Omite hallazgos por considerarlos menores
- Mezcla idiomas en el código
- Deja código o documentación en estado intermedio sin indicarlo
- Commitea secretos, tokens ni credenciales reales
- Toma decisiones de arquitectura sin registrarlas como ADR

---

## Plantillas disponibles en el sistema

| Archivo | Propósito | Formato |
|---|---|---|
| `bitacora_plantilla.md` | Plantilla de bitácora técnica completa para completar | Markdown (legible por IA y humanos) |

---

## Notas de versión

```
v3.0 — 2026
  + Agregado: modulo_bitacora.md (generación, auditoría y mantenimiento de bitácora técnica)
  + Agregado: bitacora_plantilla.md (plantilla completa en Markdown compatible con IA)
  + Actualizado: combinaciones de módulos — agregados casos de onboarding y proyecto completo
  + Actualizado: árbol de decisión con módulo bitácora
  + Actualizado: referencia de comandos con comandos de todos los módulos
  + Corregido: plantilla de bitácora en formato Markdown en lugar de .docx (compatibilidad IA)

v2.0 — 2026
  + Agregado: modulo_mobile.md
  + Agregado: modulo_basedatos.md
  + Agregado: modulo_testing.md

v1.0 — inicial
  + Prompt_Maestro.md
  + modulo_bots.md
  + modulo_automatizaciones.md
  + modulo_python.md
  + modulo_equipo_semisenioir.md
```

---

## Inventario completo del sistema (archivos a cargar)

```
NÚCLEO (siempre):
  ✅ Prompt_Maestro.md
  ✅ modulo_equipo_semisenioir.md

STACK (según lenguaje):
  ○ modulo_python.md              → si el proyecto usa Python

DOMINIO (según tipo de proyecto):
  ○ modulo_bots.md                → si hay bots de mensajería
  ○ modulo_automatizaciones.md    → si hay scripts o jobs

DISCIPLINA TÉCNICA (según lo que se va a hacer):
  ○ modulo_basedatos.md           → si hay base de datos (casi siempre)
  ○ modulo_mobile.md              → si debe funcionar en mobile
  ○ modulo_testing.md             → si se va a trabajar la estrategia de tests

DOCUMENTACIÓN:
  ○ modulo_bitacora.md            → si se va a crear o mantener la bitácora
  ○ bitacora_plantilla.md         → como referencia de estructura (adjuntar al módulo bitácora)
  ○ [bitacora del proyecto].md    → la bitácora real del proyecto (cuando exista)
```
