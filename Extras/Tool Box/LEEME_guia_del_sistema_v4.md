# SISTEMA ARCHSECURE AI — GUÍA DEL SISTEMA
# Versión 4.0 — 2026
# Idioma del sistema y del equipo: Español

---

## Filosofía del sistema

ArchSecure AI no es un asistente que responde preguntas.
Es un equipo de arquitectos especializados que trabaja junto a tu equipo humano.
Cada agente tiene un rol, un momento en el ciclo de desarrollo y un criterio de éxito claro.
El Orquestador Maestro los coordina para que trabajen como un pipeline coherente, no como partes sueltas.

---

## Inventario completo del sistema

### CAPA BASE — Siempre presente

| Archivo | Nombre | Función |
|---|---|---|
| `Prompt_Maestro.md` | **ArchSecure AI Base** | Arquitectura, seguridad, metodología, auditoría y comandos base |
| `modulo_equipo_semisenioir.md` | **Módulo Equipo** | Calibra el tono y nivel de explicación para equipos semi-senior |
| `Orquestador_Maestro.md` | **Orquestador Maestro** | Coordina el pipeline completo de agentes |

### MÓDULOS DE EXTENSIÓN — Según el stack y el tipo de proyecto

| Archivo | Nombre | Cuándo cargar |
|---|---|---|
| `modulo_python.md` | **Módulo Python** | Si el stack usa Python |
| `modulo_bots.md` | **Módulo Bots** | Si hay bots de Discord, Telegram o WhatsApp |
| `modulo_automatizaciones.md` | **Módulo Automatizaciones** | Si hay scripts, cron jobs o procesos desatendidos |
| `modulo_mobile.md` | **Módulo Mobile** | Si la app debe funcionar en dispositivos móviles |
| `modulo_basedatos.md` | **Módulo Base de Datos** | Si el proyecto accede a cualquier base de datos |
| `modulo_testing.md` | **Módulo Testing** | Si se va a trabajar la estrategia de tests en profundidad |
| `modulo_bitacora.md` | **Módulo Bitácora** | Si se va a crear, auditar o mantener la bitácora técnica |
| `bitacora_plantilla.md` | **Plantilla de Bitácora** | Como referencia al usar el Módulo Bitácora |

### AGENTES DEL PIPELINE — Activados por el Orquestador Maestro

| Archivo | Nombre | Especialidad | Momento en el pipeline |
|---|---|---|---|
| `Arquitecto.md` | **Arquitecto** | Estructura, clean code, organización | 1° — antes de auditar |
| `Guardian_Seguridad.md` | **Guardián de Seguridad** | Auditoría y remediación de vulnerabilidades | 2° — siempre antes de desplegar |
| `Centinela_Calidad.md` | **Centinela de Calidad** | Testing y cobertura de flujos críticos | 3° — después de seguridad |
| `Optimizador.md` | **Optimizador** | Rendimiento y eficiencia | 4° — después de tests |
| `Oficial_Despliegue.md` | **Oficial de Despliegue** | CI/CD y build de producción | 5° — cuando todo está en orden |
| `Ingeniero_Infraestructura.md` | **Ingeniero de Infraestructura** | Servidores, Docker, monitoreo | 6° — entorno de producción |

---

## El pipeline y su lógica

```
CONSTRUCCIÓN (Prompt Maestro + módulos según stack)
        ↓
ARQUITECTO → ordena, limpia, estructura
        ↓
GUARDIÁN DE SEGURIDAD → audita y parcha vulnerabilidades
        ↓
CENTINELA DE CALIDAD → cubre flujos críticos con tests
        ↓
OPTIMIZADOR → mejora rendimiento donde importa
        ↓
OFICIAL DE DESPLIEGUE → configura CI/CD y valida build
        ↓
INGENIERO DE INFRAESTRUCTURA → asegura el entorno
```

**Reglas absolutas del pipeline:**
- El Guardián de Seguridad nunca se salta
- No se optimiza sobre código que va a ser refactorizado
- No se deploya sin haber pasado por seguridad y con tests rotos
- Cada agente le entrega contexto estructurado al siguiente (protocolo de handoff)

---

## Modos de operación

| Modo | Comando | Cuándo usarlo |
|---|---|---|
| Manual | (predeterminado) | Proyectos nuevos, cuando el equipo quiere control fase por fase |
| Automático | `/pipeline auto` | Proyectos conocidos, cuando el equipo confía en el pipeline |
| Auditoría total | `/pipeline auditoria` | Evaluar el estado del sistema sin modificar nada |
| Refactor total | `/pipeline refactor` | Proyectos caóticos — requiere confirmación del equipo |

---

## Comandos rápidos

### Orquestador Maestro

| Comando | Acción |
|---|---|
| `/pipeline auto` | Ejecuta el pipeline completo en modo automático |
| `/pipeline auditoria` | Auditoría total sin modificar código |
| `/pipeline refactor` | Refactor total — requiere confirmación |
| `/pipeline estado` | Estado actual del proyecto en el pipeline |
| `/pipeline siguiente` | Activa el próximo agente según el estado |
| `/pipeline reporte` | Reporte consolidado de todas las intervenciones |
| `/pipeline arquitecto` | Activa el Arquitecto directamente |
| `/pipeline seguridad` | Activa el Guardián de Seguridad directamente |
| `/pipeline calidad` | Activa el Centinela de Calidad directamente |
| `/pipeline optimizador` | Activa el Optimizador directamente |
| `/pipeline despliegue` | Activa el Oficial de Despliegue directamente |
| `/pipeline infraestructura` | Activa el Ingeniero de Infraestructura directamente |

### Prompt Maestro (ArchSecure AI Base)

| Comando | Acción |
|---|---|
| `/build [descripción]` | Construir nuevo módulo o proyecto desde cero |
| `/restructure` | Reestructurar proyecto existente |
| `/audit full` | Auditoría de seguridad completa (4 fases) |
| `/audit [módulo]` | Auditar módulo específico |
| `/fix #[N]` | Aplicar remediación del hallazgo N |
| `/explain #[N]` | Explicar hallazgo N en lenguaje no técnico |
| `/report` | Generar reporte ejecutivo final |
| `/sbom` | Generar o validar el Software Bill of Materials |
| `/docs` | Generar o actualizar documentación del módulo actual |

### Módulo Bitácora

| Comando | Acción |
|---|---|
| `/bitacora new` | Generar bitácora desde cero |
| `/bitacora audit` | Auditar bitácora existente |
| `/bitacora adr [descripción]` | Nueva entrada ADR |
| `/bitacora update [sección]` | Actualizar sección específica |
| `/bitacora sync` | Detectar brechas entre código y bitácora |

### Módulo Mobile

| Comando | Acción |
|---|---|
| `/mobile scan` | Análisis completo de compatibilidad móvil |
| `/mobile audit` | Auditoría en app ya responsive |
| `/mobile migrate` | Plan y migración a diseño híbrido |
| `/mobile fix #[N]` | Corregir hallazgo N de compatibilidad |
| `/mobile report` | Reporte de compatibilidad móvil |

---

## Árbol de decisión — ¿Qué cargo en cada proyecto?

```
¿Hay un Orquestador que coordine el trabajo?
  → SIEMPRE → cargar Orquestador_Maestro.md

¿El equipo es semi-senior?
  → SIEMPRE → cargar modulo_equipo_semisenioir.md

¿El proyecto usa Python?
  → Sí → cargar modulo_python.md

¿El proyecto tiene base de datos?
  → Sí (casi siempre) → cargar modulo_basedatos.md

¿La app debe funcionar en mobile?
  → Sí → cargar modulo_mobile.md

¿El proyecto incluye un bot de mensajería?
  → Sí → cargar modulo_bots.md

¿Hay scripts o jobs automatizados?
  → Sí → cargar modulo_automatizaciones.md

¿Se va a trabajar la estrategia de tests en profundidad?
  → Sí → cargar modulo_testing.md

¿El proyecto necesita bitácora o tiene una desactualizada?
  → Sí → cargar modulo_bitacora.md + bitacora_plantilla.md

¿Se incorpora un desarrollador nuevo?
  → Sí → cargar modulo_bitacora.md + adjuntar bitacora.md del proyecto
```

---

## Combinaciones por tipo de proyecto

### Bot de Telegram en Python
```
Orquestador_Maestro + Prompt_Maestro + modulo_python + modulo_bots + modulo_equipo_semisenioir
```

### App web full-stack con base de datos
```
Orquestador_Maestro + Prompt_Maestro + modulo_basedatos + modulo_equipo_semisenioir
```

### App web que debe funcionar en mobile
```
Orquestador_Maestro + Prompt_Maestro + modulo_mobile + modulo_basedatos + modulo_equipo_semisenioir
```

### Script de automatización en Python
```
Orquestador_Maestro + Prompt_Maestro + modulo_automatizaciones + modulo_python + modulo_equipo_semisenioir
```

### Proyecto que necesita bitácora
```
Orquestador_Maestro + Prompt_Maestro + modulo_bitacora + bitacora_plantilla + modulo_equipo_semisenioir
Activar con: /bitacora new
```

### Proyecto Python completo (máximo contexto)
```
Orquestador_Maestro + Prompt_Maestro + modulo_python + modulo_mobile + modulo_basedatos
+ modulo_testing + modulo_bitacora + modulo_equipo_semisenioir
```

---

## Notas de versión

```
v4.0 — 2026
  + Renombrado: todos los agentes a nombres en español
  + Extendido: Arquitecto (antes: Boss_analista / PROJECT ARCHITECT OVERLORD)
  + Extendido: Guardián de Seguridad (antes: Boss_seguridad / SECURITY OVERLORD)
  + Extendido: Centinela de Calidad (antes: Testing_overlord / TESTING OVERLORD)
  + Extendido: Optimizador (antes: Performance / PERFORMANCE OVERLORD)
  + Extendido: Oficial de Despliegue (antes: Deployment_overlord / DEPLOYMENT OVERLORD)
  + Extendido: Ingeniero de Infraestructura (antes: Infraestructura / INFRASTRUCTURE OVERLORD)
  + Reescrito: Orquestador_Maestro con protocolo de handoff, criterios de gate y modos formalizados
  + Nuevo: criterios explícitos de paso entre fases (gates de calidad)
  + Nuevo: protocolo de escalado a decisión humana
  + Nuevo: reporte consolidado del pipeline

v3.0 — 2026
  + modulo_bitacora.md + bitacora_plantilla.md

v2.0 — 2026
  + modulo_mobile.md + modulo_basedatos.md + modulo_testing.md

v1.0 — inicial
  + Prompt_Maestro.md + módulos base + agentes originales
```

---

*ArchSecure AI v4.0 — Sistema completo con pipeline orquestado.*
*Un equipo de agentes que trabaja como un equipo real: con roles, criterios y comunicación estructurada.*
