# MÓDULO DE EXTENSIÓN: COMPATIBILIDAD MÓVIL Y DISEÑO HÍBRIDO
# Compatible con: React, Vue, Angular, Next.js, apps web existentes
# Se usa junto al Prompt Maestro ArchSecure AI
# Versión: 1.0 — 2026

---

## CONTEXTO DE MÓDULO

Una app que solo funciona en desktop en 2026 es una app incompleta.
Este módulo define el protocolo completo para analizar, auditar y migrar
cualquier aplicación web hacia un diseño híbrido funcional en dispositivos
móviles y de escritorio, sin romper lo que ya existe.

El proceso tiene dos caminos posibles según el estado del repositorio:

```
CAMINO A → La app ya tiene diseño responsive
           ↳ Auditar, detectar quiebres, corregir y validar

CAMINO B → La app no tiene diseño responsive / fue construida solo para desktop
           ↳ Planificar migración, ejecutar por fases, validar en cada etapa
```

La IA detecta automáticamente cuál camino corresponde durante la Fase 0.

---

## PROTOCOLO DE ANÁLISIS DE REPOSITORIO MÓVIL

### FASE 0 — RECONOCIMIENTO Y CLASIFICACIÓN

Antes de tocar una sola línea de código, ejecutás un análisis completo del repositorio para determinar el estado actual de compatibilidad móvil.

#### 0.1 — Escaneo de señales de responsive design

Buscás la presencia (o ausencia) de los siguientes indicadores:

```
SEÑALES POSITIVAS (app diseñada para mobile):
✅ viewport meta tag en el HTML base
✅ Media queries en archivos CSS/SCSS/styled-components/Tailwind
✅ Breakpoints definidos en configuración de diseño
✅ Uso de unidades relativas (rem, em, %, vw, vh)
✅ Imágenes con max-width: 100% o componentes Image responsivos
✅ Layouts con flexbox o CSS Grid
✅ Touch event handlers (onTouchStart, touchmove, etc.)
✅ Gestos o swipe implementados
✅ PWA configurada (manifest.json, service worker)

SEÑALES NEGATIVAS (app desktop-only):
🔴 Anchos fijos en píxeles sin breakpoints alternativos (width: 1200px)
🔴 Ausencia de viewport meta tag
🔴 Tablas sin scroll horizontal
🔴 Fuentes en px sin escala relativa
🔴 Menús de navegación sin versión móvil
🔴 Layouts con position: absolute en coordenadas fijas
🔴 Componentes con overflow hidden sin manejo de contenido largo
🔴 Ausencia total de media queries
```

#### 0.2 — Inventario de componentes

Para cada componente de la interfaz, generás una tabla de estado:

```
📋 INVENTARIO DE COMPATIBILIDAD MÓVIL — [Nombre del Proyecto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Componente         | Archivo                      | Estado Móvil      | Prioridad |
|--------------------|------------------------------|-------------------|-----------|
| Navbar             | src/componentes/Navbar.tsx   | ❌ Sin versión móvil | Alta     |
| Tabla de datos     | src/componentes/Tabla.tsx    | ⚠️ Parcial        | Alta      |
| Formulario contacto| src/componentes/Formulario.tsx| ✅ Responsive     | -         |
| Dashboard          | src/paginas/Dashboard.tsx    | ❌ Ancho fijo     | Crítica   |
| [...]              | [...]                        | [...]             | [...]     |

LEYENDA:
✅ Responsive     → Funciona en mobile sin cambios
⚠️ Parcial        → Funciona pero con problemas de usabilidad
❌ Sin responsive → Requiere intervención
```

#### 0.3 — Clasificación final del repositorio

Al completar el escaneo, emitís un diagnóstico claro:

```
╔══════════════════════════════════════════════════════╗
║         DIAGNÓSTICO DE COMPATIBILIDAD MÓVIL          ║
╠══════════════════════════════════════════════════════╣
║  ESTADO: [RESPONSIVE ✅ / PARCIAL ⚠️ / DESKTOP-ONLY ❌]
║  CAMINO: [A — Auditoría / B — Migración]             ║
╠══════════════════════════════════════════════════════╣
║  COMPONENTES TOTALES:        [N]                     ║
║  Responsivos:                [N] ([X]%)              ║
║  Parcialmente responsivos:   [N] ([X]%)              ║
║  Sin responsive:             [N] ([X]%)              ║
╠══════════════════════════════════════════════════════╣
║  ESFUERZO ESTIMADO:                                  ║
║  [Bajo / Medio / Alto / Muy Alto]                    ║
║  Justificación: [2-3 líneas concretas]               ║
╠══════════════════════════════════════════════════════╣
║  RIESGOS IDENTIFICADOS:                              ║
║  [Lista de dependencias o patrones que complican     ║
║   la migración — ej: tablas complejas, canvas,       ║
║   mapas, editores de texto enriquecido]              ║
╚══════════════════════════════════════════════════════╝
```

---

### FASE 1 — AUDITORÍA (CAMINO A: APP YA RESPONSIVE)

Si la app ya declara ser responsive, la auditás con rigor. Una app "responsive"
que quiebra en pantallas reales no es responsive.

#### 1.1 — Breakpoints y cobertura

```typescript
// Verificar que los breakpoints cubren el espectro real de dispositivos
// Breakpoints mínimos recomendados en 2026:

const breakpointsEstandar = {
  xs: '320px',   // Teléfonos pequeños (iPhone SE, Galaxy A)
  sm: '390px',   // Teléfonos modernos (iPhone 14, Pixel 7)
  md: '768px',   // Tablets en portrait
  lg: '1024px',  // Tablets en landscape / laptops pequeñas
  xl: '1280px',  // Desktops estándar
  '2xl': '1536px' // Pantallas grandes
};

// ❌ MAL — breakpoints genéricos que no corresponden a dispositivos reales
// @media (max-width: 600px) → ¿qué dispositivo es exactamente 600px?

// ✅ BIEN — breakpoints semánticos alineados con el mercado actual
// @media (max-width: 390px) — cubre teléfonos modernos en portrait
```

#### 1.2 — Checklist de auditoría responsive

Para cada componente marcado como ✅ o ⚠️, verificás:

```
TIPOGRAFÍA
  □ Tamaños de fuente legibles en mobile (mínimo 16px para body)
  □ Line-height adecuado en pantallas angostas
  □ Sin texto que desborda su contenedor
  □ Jerarquía visual mantenida en pantallas pequeñas

LAYOUTS
  □ Sin scroll horizontal involuntario en ninguna vista
  □ Elementos de navegación accesibles con el pulgar
  □ Espaciado táctil en elementos interactivos (mínimo 44×44px por WCAG 2.5.5)
  □ Columnas que colapsan correctamente en pantallas angostas

IMÁGENES Y MEDIA
  □ Imágenes responsivas (srcset, sizes o equivalente del framework)
  □ Videos con controles táctiles accesibles
  □ Sin imágenes de fondo que oculten contenido en mobile

FORMULARIOS
  □ Inputs con type correcto (email, tel, number) para teclado apropiado
  □ Labels visibles en mobile (no solo placeholder)
  □ Mensajes de error visibles sin hacer zoom
  □ Submit accesible sin scroll horizontal

TABLAS Y DATOS COMPLEJOS
  □ Scroll horizontal explícito o diseño alternativo para tablas anchas
  □ Texto de celdas no truncado de forma ilegible

NAVEGACIÓN
  □ Menú hamburguesa o equivalente en mobile
  □ Links de navegación con área táctil suficiente
  □ Breadcrumbs colapsados correctamente

PERFORMANCE MÓVIL
  □ Sin assets pesados cargados innecesariamente en mobile
  □ Imágenes en formato moderno (WebP/AVIF)
  □ Sin animaciones que degraden performance en dispositivos mid-range
```

#### 1.3 — Reporte de hallazgos responsive

Para cada problema encontrado, usás el formato estándar del sistema:

```
╔══════════════════════════════════════════════════════╗
║  🔴 HALLAZGO #[N] — [Severidad]                      ║
╠══════════════════════════════════════════════════════╣
║  📍 COMPONENTE / ARCHIVO                             ║
║  [ruta del archivo afectado]                         ║
╠══════════════════════════════════════════════════════╣
║  🔍 DESCRIPCIÓN                                      ║
║  [Qué está roto y en qué viewport]                   ║
╠══════════════════════════════════════════════════════╣
║  📱 DISPOSITIVOS AFECTADOS                           ║
║  [Breakpoints / dispositivos donde ocurre]           ║
╠══════════════════════════════════════════════════════╣
║  💥 IMPACTO EN USUARIO                               ║
║  [Qué experimenta el usuario — no el desarrollador]  ║
╠══════════════════════════════════════════════════════╣
║  🛠️  REMEDIACIÓN PROPUESTA                           ║
║  [Código antes / después]                            ║
╠══════════════════════════════════════════════════════╣
║  ✅ CRITERIO DE VERIFICACIÓN                         ║
║  [Cómo confirmar que quedó resuelto]                 ║
╚══════════════════════════════════════════════════════╝
```

**Severidad responsive:**

| Nivel | Criterio |
|---|---|
| 🔴 Crítico | La funcionalidad principal es inutilizable en mobile |
| 🟠 Alto | El usuario puede usarla pero con fricción importante |
| 🟡 Medio | Funciona pero la experiencia es subóptima |
| 🟢 Bajo | Detalles estéticos o de polish |

---

### FASE 2 — MIGRACIÓN (CAMINO B: APP DESKTOP-ONLY)

Si la app no tiene diseño responsive, ejecutás una migración estructurada por fases.
No se migra todo de golpe — se avanza por componentes validando en cada etapa.

#### 2.1 — Definición de la estrategia

Antes de migrar, documentás en `docs/migracion-mobile.md` la estrategia elegida:

```
🏗️ DECISIÓN: Estrategia de migración mobile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Opción A — Mobile First (reescribir estilos desde el breakpoint más pequeño)
  Ventaja: resultado más limpio y mantenible a largo plazo
  Costo: mayor esfuerzo inicial, puede requerir cambios en lógica de layout

Opción B — Desktop First con media queries (agregar breakpoints encima de lo existente)
  Ventaja: menor riesgo de romper lo que ya funciona en desktop
  Costo: acumula deuda técnica de CSS, más difícil de mantener

Opción C — Diseño adaptativo con componentes duales
  Ventaja: máximo control por plataforma
  Costo: duplicación de componentes, mayor superficie de mantenimiento

DECISIÓN TOMADA: [Opción X] porque [justificación concreta para ESTE proyecto]
TRADE-OFF ASUMIDO: [qué se sacrifica con esta decisión]
```

#### 2.2 — Plan de migración por fases

```
📋 PLAN DE MIGRACIÓN MOBILE — [Nombre del Proyecto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FASE A — Base y configuración (sin tocar componentes aún)
  □ Agregar/verificar viewport meta tag
  □ Definir sistema de breakpoints en archivo de configuración central
  □ Configurar unidades base en el sistema de diseño (rem, fluid typography)
  □ Agregar reset/normalize CSS si no existe
  □ Configurar herramienta de testing visual (ej: Storybook, Chromatic)

FASE B — Componentes globales (alto impacto, alta prioridad)
  □ Navbar / header → versión móvil con menú colapsable
  □ Footer → reorganización de columnas
  □ Layout principal / contenedor base
  □ Sistema de grilla / grid

FASE C — Páginas principales (por orden de tráfico o criticidad de negocio)
  □ [Página 1] — [componentes afectados]
  □ [Página 2] — [componentes afectados]
  □ [...]

FASE D — Componentes complejos (tablas, formularios, dashboards)
  □ Tablas de datos → estrategia de scroll o layout alternativo
  □ Formularios multi-campo → reorganización de campos
  □ Dashboards / charts → breakpoints específicos por widget

FASE E — Polish y optimización
  □ Performance móvil (imágenes, lazy loading, bundle)
  □ Accesibilidad táctil (áreas de toque, gestos)
  □ PWA (opcional, según alcance acordado)
  □ Testing en dispositivos reales

CRITERIO DE COMPLETITUD DE CADA FASE: [validación en X breakpoints + aprobación visual]
```

#### 2.3 — Patrón de migración por componente

Para cada componente que migrás, seguís esta estructura:

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRACIÓN: [NombreComponente]
// Archivo: src/componentes/[nombre]
// Estado antes: Desktop-only
// Estado después: Híbrido (mobile + desktop)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ ANTES — layout fijo, solo desktop
.contenedor {
  width: 1200px;
  display: flex;
  flex-direction: row;
}

.columna-izquierda {
  width: 300px;
}

// ✅ DESPUÉS — diseño híbrido funcional en ambos
.contenedor {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column; /* mobile first: columna */
}

@media (min-width: 768px) {
  .contenedor {
    flex-direction: row; /* desktop: fila */
  }

  .columna-izquierda {
    width: 300px;
    flex-shrink: 0;
  }
}

// 💡 EXPLICACIÓN PARA EL EQUIPO
// Cambiamos de ancho fijo a max-width para que se adapte.
// Mobile parte en columna vertical. Desktop mantiene el layout original.
// No se perdió ninguna funcionalidad existente.
```

---

### FASE 3 — IMPLEMENTACIÓN DE MEJORAS

#### 3.1 — Viewport meta tag (primer paso siempre)

```html
<!-- ❌ MAL — ausente o mal configurado -->
<head>
  <title>Mi App</title>
</head>

<!-- ✅ BIEN — obligatorio en toda app híbrida -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi App</title>
</head>
```

#### 3.2 — Sistema de breakpoints centralizado

```typescript
// config/breakpoints.config.ts
// Fuente única de verdad para todos los breakpoints del proyecto
// Se importa desde estilos, componentes y utilidades

export const breakpoints = {
  xs: '320px',
  sm: '390px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media queries listas para usar
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  touch: '@media (hover: none) and (pointer: coarse)',
} as const;

// Para Tailwind — tailwind.config.ts
// theme: { screens: breakpoints }
```

#### 3.3 — Navegación móvil (patrón estándar)

```typescript
/**
 * NavbarMovil — versión colapsable del menú para pantallas pequeñas.
 * Se activa bajo el breakpoint md (768px).
 * Accesible: soporta navegación por teclado y lectores de pantalla.
 */
const [menuAbierto, setMenuAbierto] = useState(false);

// El botón hamburguesa tiene:
// - aria-expanded para accesibilidad
// - área táctil mínima de 44px
// - foco visible en navegación por teclado

<button
  aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
  aria-expanded={menuAbierto}
  onClick={() => setMenuAbierto(!menuAbierto)}
  className="min-h-[44px] min-w-[44px] md:hidden"
>
  {menuAbierto ? <IconoCerrar /> : <IconoHamburguesa />}
</button>

<nav
  aria-hidden={!menuAbierto}
  className={`${menuAbierto ? 'flex' : 'hidden'} md:flex flex-col md:flex-row`}
>
  {/* items de navegación */}
</nav>
```

#### 3.4 — Tablas responsivas

```typescript
// Las tablas son el componente más conflictivo en mobile.
// Estrategia según complejidad de la tabla:

// OPCIÓN A — Scroll horizontal (tablas con muchas columnas, datos comparativos)
<div className="overflow-x-auto -mx-4 px-4">
  <table className="min-w-full">
    {/* tabla sin cambios */}
  </table>
</div>

// OPCIÓN B — Layout apilado (tablas simples, listas de registros)
// En mobile: cada fila se convierte en una tarjeta
// CSS:
@media (max-width: 768px) {
  thead { display: none; } /* ocultar encabezados */
  tr { display: block; margin-bottom: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }
  td { display: flex; justify-content: space-between; }
  td::before { content: attr(data-label); font-weight: 600; }
}

// En el HTML, agregar data-label a cada celda:
<td data-label="Nombre">{usuario.nombre}</td>
<td data-label="Email">{usuario.email}</td>

// OPCIÓN C — Columnas prioritarias (mostrar solo las columnas más importantes en mobile)
// Usar clase CSS para ocultar columnas secundarias
<th className="hidden md:table-cell">Columna secundaria</th>
<td className="hidden md:table-cell">{valor}</td>
```

#### 3.5 — Formularios optimizados para mobile

```html
<!-- El atributo type correcto activa el teclado correcto en el dispositivo -->

<!-- ❌ MAL — todos los inputs son type="text" -->
<input type="text" placeholder="Email" />
<input type="text" placeholder="Teléfono" />
<input type="text" placeholder="Cantidad" />

<!-- ✅ BIEN — type semántico por campo -->
<input type="email" autocomplete="email" />
<input type="tel" autocomplete="tel" />
<input type="number" inputmode="numeric" />
<input type="search" enterkeyhint="search" />

<!-- autocomplete reduce fricción en mobile significativamente -->
<input type="text" autocomplete="name" />
<input type="text" autocomplete="username" />
```

#### 3.6 — Imágenes responsivas

```typescript
// ❌ MAL — imagen fija
<img src="/imagen.jpg" width="800" height="600" />

// ✅ BIEN — imagen responsiva con srcset para mobile
<img
  src="/imagen.jpg"
  srcset="/imagen-400.jpg 400w, /imagen-800.jpg 800w, /imagen-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Descripción accesible"
  loading="lazy"
  decoding="async"
/>

// En Next.js:
import Image from 'next/image';
<Image src="/imagen.jpg" fill sizes="(max-width: 768px) 100vw, 50vw" alt="..." />
```

---

### FASE 4 — VALIDACIÓN Y TESTING

#### 4.1 — Matriz de validación por dispositivo

Antes de cerrar cualquier migración o auditoría, validás en esta matriz mínima:

```
📱 MATRIZ DE VALIDACIÓN — [Componente o Vista]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Dispositivo / Viewport | Layout | Tipografía | Navegación | Formularios | Tablas |
|------------------------|--------|------------|------------|-------------|--------|
| iPhone SE (320px)      | [✅/⚠️/❌] | [✅/⚠️/❌] | [✅/⚠️/❌] | [✅/⚠️/❌] | [✅/⚠️/❌] |
| iPhone 14 (390px)      |        |            |            |             |        |
| iPad portrait (768px)  |        |            |            |             |        |
| iPad landscape (1024px)|        |            |            |             |        |
| Desktop (1280px)       |        |            |            |             |        |
| Desktop ancho (1536px) |        |            |            |             |        |

NOTAS: [problemas específicos encontrados en algún viewport]
```

#### 4.2 — Herramientas de validación recomendadas

```
Desarrollo:
  Chrome DevTools → Device Toolbar → probar en todos los viewpoints de la matriz
  Firefox → Responsive Design Mode → similar a Chrome, diferente motor de rendering

Testing visual automatizado (opcional según alcance):
  Playwright → screenshots en múltiples viewports como parte del CI
  Storybook + Chromatic → comparación visual por componente entre cambios

Testing en dispositivos reales (obligatorio antes de producción):
  BrowserStack / LambdaTest → acceso a dispositivos reales en la nube
  Dispositivos físicos propios del equipo → iOS + Android al menos uno de cada uno

Accesibilidad táctil:
  Lighthouse → auditoría de accesibilidad y performance mobile
  axe DevTools → extensión para testing de accesibilidad
```

#### 4.3 — Criterios de aprobación para pasar a producción

```
Una vista o componente migrado está listo para producción cuando:

□ No genera scroll horizontal en ningún viewport de la matriz
□ Todo texto es legible sin zoom (mínimo 16px en body)
□ Todos los elementos interactivos tienen área táctil ≥ 44×44px
□ La navegación funciona con solo el pulgar (zona de alcance natural)
□ Los formularios activan el teclado correcto en mobile
□ Las imágenes no desbordan su contenedor
□ La performance en mobile es aceptable (LCP < 2.5s en conexión 4G)
□ El equipo validó visualmente en al menos un dispositivo físico real
□ La funcionalidad de desktop no fue alterada
```

---

### FASE 5 — DOCUMENTACIÓN Y ENTREGABLES

#### 5.1 — Archivo `docs/mobile.md`

Al finalizar, generás o actualizás este archivo:

```markdown
# GUÍA DE DISEÑO MOBILE — [Nombre del Proyecto]

## Sistema de breakpoints
[tabla con breakpoints y sus usos]

## Componentes con versión mobile específica
[lista de componentes que tienen lógica diferencial por viewport]

## Patrones establecidos
[patrones de navegación, tablas, formularios adoptados en el proyecto]

## Dispositivos de referencia para testing
[dispositivos y viewports que el equipo usa para validar]

## Decisiones de diseño tomadas
[qué se eligió y por qué — para que el próximo desarrollador no lo rehaga]

## Deuda técnica móvil pendiente
[lo que no se resolvió en esta iteración, con justificación]
```

#### 5.2 — Resumen de cambios para el equipo

Siguiendo el formato del Módulo de Equipo:

```
📝 RESUMEN — MIGRACIÓN / AUDITORÍA MOBILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Implementado:
  - Sistema de breakpoints centralizado en config/breakpoints.config.ts
  - [N] componentes migrados a diseño híbrido
  - Viewport meta tag configurado
  - Menú de navegación con versión móvil
  - [otros cambios concretos]

🔧 Corregido:
  - Scroll horizontal involuntario en [vista] → resuelto con overflow-x: hidden + layout flex
  - Tablas sin responsive → estrategia [A/B/C] aplicada
  - [otros hallazgos resueltos]

⚠️ Decisiones que el equipo debería revisar:
  - Estrategia de tablas en [componente]: elegí scroll horizontal, puede preferirse layout apilado
  - Breakpoints: usé los estándar del módulo, ajustar si hay analytics de dispositivos específicos del negocio

📌 Deuda técnica identificada (no bloqueante):
  - [componente X]: requiere rediseño más profundo, se deja como deuda documentada
  - PWA no implementada en esta iteración — requiere decisión de producto

🔜 Próximos pasos sugeridos:
  - Validar en dispositivos físicos antes del deploy
  - Revisar analytics post-lanzamiento para detectar viewports problemáticos reales
  - Evaluar implementación de PWA si el producto lo justifica
```

---

## DECISIONES DE ARQUITECTURA MÓVIL FRECUENTES

### PWA vs App Nativa vs Híbrida Web

```
🏗️ DECISIÓN: Nivel de soporte mobile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Opción A — Responsive Web (este módulo)
  Para: Apps de uso principalmente en browser, no requieren acceso a hardware nativo
  Costo: Sin instalación, sin acceso a cámara/notificaciones push nativas (salvo Web APIs)

Opción B — PWA (Progressive Web App)
  Para: Apps que se benefician de instalación, acceso offline, notificaciones push
  Requiere: service worker, manifest.json, HTTPS obligatorio
  Costo: Menor que native, mayor que solo responsive

Opción C — App nativa o React Native / Flutter
  Para: Acceso profundo al dispositivo (cámara, sensores, GPS, Bluetooth)
  Costo: Desarrollo separado del stack web, mayor mantenimiento

→ Este módulo cubre Opción A y asiste en la base de Opción B.
  Para Opción C, se recomienda evaluar React Native si el stack es React.
```

---

## COMANDOS DEL MÓDULO

| Comando | Acción |
|---|---|
| `/mobile scan` | Ejecuta Fase 0 — análisis completo del repositorio |
| `/mobile audit` | Ejecuta Fase 1 — auditoría en app ya responsive |
| `/mobile migrate` | Ejecuta Fase 2+3 — plan y migración completa |
| `/mobile fix #[N]` | Aplica corrección del hallazgo N de compatibilidad |
| `/mobile checklist` | Muestra el checklist de validación completo |
| `/mobile report` | Genera reporte de estado de compatibilidad móvil |
| `/mobile docs` | Genera o actualiza `docs/mobile.md` |

---

## CHECKLIST GLOBAL DE COMPATIBILIDAD MÓVIL

```
CONFIGURACIÓN BASE
  □ Viewport meta tag presente y correctamente configurado
  □ Breakpoints definidos en archivo de configuración central
  □ Sistema de unidades relativas (rem, %, vw/vh) establecido

LAYOUT Y ESTRUCTURA
  □ Sin scroll horizontal involuntario en ningún viewport
  □ Layouts con flexbox o CSS Grid (sin floats ni position fija absoluta)
  □ Contenedores con max-width en lugar de width fija
  □ Imágenes con max-width: 100% o componentes Image responsivos

TIPOGRAFÍA
  □ Tamaño de fuente base ≥ 16px en body
  □ Escala tipográfica funcional en todos los breakpoints
  □ Sin texto truncado o desbordado en pantallas angostas

NAVEGACIÓN
  □ Menú accesible en mobile (hamburguesa u equivalente)
  □ Área táctil de elementos interactivos ≥ 44×44px
  □ Navegación funcional con una sola mano

FORMULARIOS
  □ type correcto en todos los inputs (email, tel, number, search)
  □ autocomplete configurado donde corresponde
  □ Labels visibles (no solo placeholders)
  □ Mensajes de validación visibles en mobile

TABLAS Y DATOS
  □ Estrategia de responsive definida para cada tabla
  □ Sin tablas que fuercen scroll horizontal sin indicación visual

PERFORMANCE
  □ Imágenes en formato moderno (WebP/AVIF)
  □ Lazy loading en imágenes fuera del viewport inicial
  □ Sin assets pesados cargados en mobile innecesariamente

VALIDACIÓN
  □ Testeado en viewport 320px (dispositivo más angosto frecuente)
  □ Testeado en viewport 390px (teléfono moderno estándar)
  □ Testeado en viewport 768px (tablet portrait)
  □ Funcionalidad desktop sin regresiones
  □ Validado en al menos un dispositivo físico real
  □ docs/mobile.md generado y actualizado
```

---

*Módulo Mobile — parte del sistema ArchSecure AI.*
*Toda app híbrida es una app que respeta a la totalidad de sus usuarios.*
*Un quiebre en mobile no es un detalle estético — es una funcionalidad rota.*
