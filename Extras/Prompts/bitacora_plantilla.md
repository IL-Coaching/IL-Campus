# BITÁCORA TÉCNICA — [NOMBRE DEL PROYECTO]
# Fuente de Verdad del Proyecto
# Versión: 1.0 | Estado: [En Desarrollo / Producción / Mantenimiento]
# Última actualización: [YYYY-MM-DD] | Responsable: [NOMBRE / EQUIPO]

> **REGLA DE ORO:** Este documento es la fuente de verdad del proyecto.
> Cualquier decisión técnica que no esté aquí no existe como decisión formal.
> Actualizar esta bitácora es parte del trabajo, no un extra.

---

## ÍNDICE

1. [Identidad del Proyecto](#1-identidad-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Convenciones de Trabajo](#4-convenciones-de-trabajo)
5. [Seguridad](#5-seguridad)
6. [Registro de Decisiones Arquitectónicas (ADR)](#6-registro-de-decisiones-arquitectónicas-adr)
7. [Guía de Incorporación (Onboarding)](#7-guía-de-incorporación-onboarding)
8. [Deuda Técnica y Roadmap](#8-deuda-técnica-y-roadmap)
9. [Equipo y Contactos](#9-equipo-y-contactos)

---

## 1. Identidad del Proyecto

### 1.1 Descripción

[Una o dos oraciones que expliquen QUÉ es el proyecto y PARA QUÉ existe.
Sin jerga técnica. Como si se lo explicaras a alguien que no es desarrollador.]

### 1.2 Problema que resuelve

[Qué problema concreto existía antes de este proyecto.
Cuál es el dolor que justifica su existencia.]

### 1.3 Usuarios del sistema

| Tipo de usuario | Qué puede hacer | Qué NO puede hacer |
|---|---|---|
| [Ej: Administrador] | [Ej: Validar nodos, gestionar roles] | [Ej: Eliminar registros históricos] |
| [Ej: Gestor] | [...] | [...] |
| [Ej: Visitante] | [...] | [...] |

### 1.4 Principios innegociables

> Estos principios no se debaten en cada tarea. Son la base sobre la que se
> toman TODAS las decisiones técnicas del proyecto. Deben ser específicos
> de este proyecto — no frases genéricas.

- **[Principio 1]** — [por qué importa en este proyecto específico]
- **[Principio 2]** — [por qué importa en este proyecto específico]
- **[Principio 3]** — [por qué importa en este proyecto específico]

### 1.5 Glosario del dominio

El idioma del negocio de este proyecto. Estos términos se usan de forma
consistente en el código, la documentación y las conversaciones del equipo.
Son la fuente de verdad terminológica — si un término no está aquí, no existe.

| Término | Definición en el contexto de este proyecto |
|---|---|
| [Ej: Nodo] | [Ej: Una organización validada y activa en el sistema. No es sinónimo de "institución" ni de "usuario".] |
| [Ej: Prospecto] | [Ej: Una solicitud de adhesión que aún no fue validada. Vive en la Cancillería.] |
| [Término 3] | [...] |
| [Término 4] | [...] |

---

## 2. Stack Tecnológico

### 2.1 Tecnologías adoptadas

| Capa | Tecnología | Versión | Justificación (por qué esta y no otra) |
|---|---|---|---|
| Frontend | [Ej: React + Vite] | [Ej: 18.x] | [Ej: Ecosistema maduro, equipo ya familiarizado] |
| Styling | [...] | [...] | [...] |
| Backend | [...] | [...] | [...] |
| Base de datos | [...] | [...] | [...] |
| Despliegue | [...] | [...] | [...] |
| [Otra capa] | [...] | [...] | [...] |

### 2.2 Dependencias críticas

> Una dependencia crítica es aquella cuyo fallo o eliminación impacta en
> el funcionamiento core del sistema. Documentarlas previene sorpresas.

| Dependencia | Propósito | Riesgo si desaparece o cambia de API |
|---|---|---|
| [Ej: Supabase Auth] | [Ej: Autenticación] | [Ej: Requeriría reescribir todo el sistema de sesiones] |
| [...] | [...] | [...] |

### 2.3 Variables de entorno requeridas

> NUNCA documentar valores reales. Solo nombres y propósito.
> Los valores viven en el gestor de secretos del equipo.

| Variable | Propósito | Requerida en |
|---|---|---|
| [Ej: VITE_SUPABASE_URL] | [Ej: URL del proyecto en Supabase] | [Ej: Todos los entornos] |
| [Ej: VITE_SUPABASE_ANON_KEY] | [...] | [...] |
| [...] | [...] | [...] |

---

## 3. Arquitectura del Sistema

### 3.1 Estructura de carpetas

> Cada carpeta tiene un propósito único y documentado. Si no se puede
> explicar en una oración para qué existe un directorio, no debería existir.

```
/
├── [/src/nucleo]          # [Lógica de negocio pura. Sin dependencias de UI ni de infraestructura.]
├── [/src/vistas]          # [...]
├── [/src/hooks]           # [...]
├── [/src/servicios]       # [...]
├── [/src/utils]           # [...]
└── [Agregar según proyecto]
```

### 3.2 Flujos críticos del negocio

> Los flujos que, si fallan, detienen el funcionamiento del sistema.
> Documentar el camino feliz y los puntos de fallo conocidos.

**Flujo 1: [Nombre del flujo, ej: "Alta de Organización"]**

1. [Actor] — [acción] — [resultado esperado]
2. [...]
3. [...]

> ⚠️ Punto de fallo conocido: [qué puede salir mal y dónde]

---

**Flujo 2: [Nombre del flujo]**

1. [...]
2. [...]

---

### 3.3 Modelo de roles y permisos

| Acción | [Rol 1] | [Rol 2] | [Rol 3] |
|---|---|---|---|
| [Ej: Ver dashboard] | Sí | Sí | No |
| [Ej: Validar nodos] | Sí | No | No |
| [Ej: Editar perfil propio] | Sí | Solo el propio | No |
| [Agregar acciones] | [...] | [...] | [...] |

---

## 4. Convenciones de Trabajo

> Las convenciones no son sugerencias. Son el contrato del equipo.
> Violarlas genera deuda técnica inmediata.

### 4.1 Idioma del proyecto

| Elemento | Idioma |
|---|---|
| Variables, funciones, clases | [Español / Inglés — uno solo, sin mezclar] |
| Nombres de archivos y carpetas | [...] |
| Comentarios en el código | [...] |
| Mensajes de error y logs | [...] |
| Documentación técnica | [...] |
| Mensajes de commit | [...] |

### 4.2 Nomenclatura de archivos y código

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes UI | PascalCase | [Ej: TarjetaUsuario.tsx] |
| Hooks personalizados | camelCase con prefijo "use" | [Ej: useInstituciones.ts] |
| Servicios | nombre.servicio.ts | [Ej: nodo.servicio.ts] |
| Tipos / Interfaces | nombre.tipos.ts | [Ej: organizacion.tipos.ts] |
| Utilidades | nombre.util.ts | [Ej: geo.util.ts] |
| Tests | nombre.test.ts | [Ej: nodo.servicio.test.ts] |
| Variables de entorno | UPPER_SNAKE_CASE | [Ej: VITE_SUPABASE_URL] |

### 4.3 Convenciones de git

**Formato de commits (Conventional Commits):**
```
[tipo](scope): descripción corta en [idioma del proyecto]
```

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin impacto en funcionalidad |
| `docs` | Cambios en documentación |
| `security` | Parche de seguridad |
| `chore` | Tareas de mantenimiento (deps, config) |

**Estrategia de ramas:**
- `main` → Siempre desplegable. Solo merge desde develop.
- `develop` → Integración. Aquí llegan los PRs del equipo.
- `feature/nombre-descripcion` → Una rama por funcionalidad. Se elimina al mergear.
- `hotfix/nombre` → Para fixes urgentes en producción. Merge a main + develop.

---

## 5. Seguridad

### 5.1 Modelo de amenazas

| Amenaza identificada | Severidad | Contramedida implementada |
|---|---|---|
| [Ej: IDOR en endpoints de organización] | CRÍTICA | [Ej: Validación de uid() en RPC, RLS habilitado] |
| [Ej: Spam en registro público] | ALTA | [Ej: Registro por invitación únicamente] |
| [Amenaza 3] | [...] | [...] |

### 5.2 Reglas de seguridad absolutas

> Estas reglas nunca se negocian, ni por velocidad de desarrollo,
> ni por conveniencia.

- Ninguna credencial real vive en el repositorio. Sin excepciones.
- Toda operación de escritura valida la identidad del usuario server-side, no en el cliente.
- Los errores internos nunca se exponen al usuario final. Los logs sí los registran.
- [Regla específica del proyecto 1]
- [Regla específica del proyecto 2]

### 5.3 Datos sensibles y su tratamiento

| Campo / Dato | Tratamiento | Dónde se aplica |
|---|---|---|
| [Ej: Contraseñas] | Hash bcrypt | [Ej: Supabase Auth automático] |
| [Ej: Tokens de sesión] | JWT + expiración corta | [...] |
| [Dato sensible 3] | [...] | [...] |

---

## 6. Registro de Decisiones Arquitectónicas (ADR)

> Cada decisión técnica significativa queda registrada aquí con su contexto,
> la decisión tomada y las consecuencias. Esto evita reabrir debates ya
> resueltos y da contexto a futuros desarrolladores.
>
> Una decisión no registrada aquí no es una decisión formal.

---

### ADR-001: [Título corto de la decisión]

| Campo | Valor |
|---|---|
| Estado | [Aceptada / Propuesta / Deprecada / Supersedida por ADR-XXX] |
| Fecha | [YYYY-MM-DD] |
| Responsable | [Nombre o equipo que tomó la decisión] |

**Contexto:**
[Qué situación, problema o necesidad motivó esta decisión.
Por qué no podía seguir como estaba.]

**Decisión:**
[Qué se decidió exactamente. Sin ambigüedad.]

**Alternativas consideradas:**
- [Alternativa A] — descartada porque [razón concreta]
- [Alternativa B] — descartada porque [razón concreta]

**Consecuencias:**
- [Consecuencia positiva]
- [Trade-off asumido — lo que se sacrificó]
- [Impacto en otros módulos o en el equipo]

---

### ADR-002: [Duplicar este bloque para cada nueva decisión]

| Campo | Valor |
|---|---|
| Estado | [Aceptada / Propuesta / Deprecada] |
| Fecha | [YYYY-MM-DD] |
| Responsable | [...] |

**Contexto:** [...]

**Decisión:** [...]

**Alternativas consideradas:**
- [...]

**Consecuencias:**
- [...]

---

## 7. Guía de Incorporación (Onboarding)

> Un desarrollador nuevo debe poder levantar el entorno en menos de 30 minutos
> siguiendo esta guía. Si no puede, la guía está incompleta.

### 7.1 Prerequisitos

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| [Ej: Node.js] | [Ej: 20.x] | `node --version` |
| [Ej: Git] | [Ej: 2.x] | `git --version` |
| [Herramienta 3] | [...] | [...] |

### 7.2 Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone [URL del repositorio]
cd [nombre-del-proyecto]

# 2. Instalar dependencias
[npm install / pip install / etc.]

# 3. Configurar variables de entorno
cp .env.example .env
# Completar con los valores del gestor de secretos del equipo ([herramienta])

# 4. [Paso específico del proyecto, ej: ejecutar migraciones]
[comando]

# 5. Levantar el entorno de desarrollo
[npm run dev / etc.]

# 6. Verificar que funciona
# Abrir [URL local] y confirmar que [qué debería verse]
```

### 7.3 Accesos necesarios

> Solicitarlos a [nombre o cargo del responsable] antes de comenzar.

| Acceso | Para qué se usa |
|---|---|
| [Ej: Organización GitHub] | [Ej: Acceso al repositorio y CI/CD] |
| [Ej: Proyecto Supabase] | [Ej: Dashboard de base de datos y auth] |
| [Ej: Vercel] | [...] |
| [Gestor de secretos] | [Ej: Variables de entorno reales] |

### 7.4 Comandos frecuentes

| Comando | Qué hace |
|---|---|
| `[npm run dev]` | Levanta el servidor de desarrollo local |
| `[npm run build]` | Genera el bundle de producción |
| `[npm run test]` | Ejecuta la suite de tests |
| `[npm run lint]` | Verifica el estilo de código |
| `[Comando específico del proyecto]` | [...] |

---

## 8. Deuda Técnica y Roadmap

### 8.1 Deuda técnica activa

> Problemas conocidos que no se resolvieron en el momento. No son bugs —
> son decisiones conscientes de aceptar una solución subóptima ahora para avanzar.
> Deben tener justificación y dueño.

| Descripción del problema | Impacto | Por qué no se resolvió aún | Dueño / Fecha límite |
|---|---|---|---|
| [Ej: Falta de tests en módulo de geo] | Medio | [Ej: Prioridad de negocio] | [Nombre / Q2 2026] |
| [Deuda 2] | [...] | [...] | [...] |

### 8.2 Roadmap técnico

> Solo incluir tareas confirmadas, no deseos.
> Las completadas se mueven al historial (8.3) — no se eliminan.

| Tarea | Prioridad | Estado |
|---|---|---|
| [Ej: Implementar tests unitarios en NodeService] | Alta | Pendiente |
| [Tarea 2] | [...] | [...] |

### 8.3 Historial de mejoras completadas

> Las tareas completadas se registran aquí para mantener trazabilidad
> sin contaminar el roadmap activo.

| Mejora completada | Fecha | Responsable |
|---|---|---|
| [Ej: CI/CD reconectado con Vercel] | [YYYY-MM-DD] | [Nombre] |
| [Mejora 2] | [...] | [...] |

---

## 9. Equipo y Contactos

### 9.1 Mapa de responsabilidades

| Nombre | Rol en el proyecto | Área de dominio | Contacto |
|---|---|---|---|
| [Nombre] | [Ej: Tech Lead] | [Ej: Arquitectura, DB] | [email / Slack] |
| [Nombre] | [Ej: Dev Frontend] | [Ej: UI, Componentes] | [...] |
| [Nombre] | [...] | [...] | [...] |

### 9.2 Accesos y herramientas del equipo

| Herramienta | Propósito | Cómo acceder |
|---|---|---|
| [Ej: GitHub] | [Ej: Repositorio + CI/CD] | [URL o instrucción] |
| [Ej: Vercel] | [Ej: Deploys y previews] | [...] |
| [Ej: Supabase Dashboard] | [Ej: DB + Auth + Storage] | [...] |
| [Ej: Gestor de secretos] | [Ej: Variables de entorno] | [...] |
| [Canal de comunicación] | [Ej: Slack / Discord] | [...] |

---

*Bitácora generada con el sistema ArchSecure AI — Módulo Bitácora.*
*Versión del documento: [1.0] — Próxima revisión programada: [YYYY-MM-DD]*
