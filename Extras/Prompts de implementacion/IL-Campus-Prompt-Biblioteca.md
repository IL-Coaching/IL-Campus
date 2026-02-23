# PROMPT — IL-CAMPUS: BIBLIOTECA DE EJERCICIOS
## Actualización de la app ya funcional

---

## CONTEXTO Y PROPÓSITO

Este prompt es una actualización sobre la app IL-Campus ya construida.
Requiere como base: `IL-Campus-Prompt-Desarrollador.md`
Se integra con: `IL-Campus-Prompt-CapaCientifica.md` (campo
posicionCarga en cada ejercicio) y `IL-Campus-Prompt-TesteoYZonas.md`
(peso sugerido por 1RM, zona de intensidad por reps).

Este prompt implementa dos cosas interrelacionadas:

**1 — La Biblioteca de Ejercicios:**
Reconversión completa de la sección "Rutinas" en la app.
Renombrar a "Biblioteca". Repositorio central de ejercicios
de IL-Campus con más de 100 ejercicios categorizados,
videos de YouTube embebidos, filtros combinables y
gestión completa por parte del entrenador.

**2 — Campo de ejercicio libre en el constructor:**
El constructor de planificaciones NO limita al entrenador
a usar únicamente ejercicios de la biblioteca. El campo
de nombre de ejercicio es siempre texto libre con la
biblioteca funcionando como autocompletado inteligente
y opcional. Si el entrenador escribe un nombre que no
existe en la biblioteca, queda guardado como ejercicio
libre sin fricción.

---

## CAMBIO DE NOMBRE — PRIORIDAD 1

**Renombrar en toda la app:**
- "Rutinas" → "Biblioteca"
- Menú de navegación
- Breadcrumbs
- Títulos de página
- Textos de botones
- Mensajes del sistema
- Rutas URL: `/rutinas/*` → `/biblioteca/*`
- Cualquier referencia en el código al modelo o sección

---

## BASE DE DATOS — CAMBIOS REQUERIDOS

```prisma
// Modelo principal de ejercicio en la biblioteca
model Ejercicio {
  id                  String           @id @default(cuid())

  // IDENTIDAD
  nombre              String
  // Nombre principal. Ej: "Curl femoral sentado"

  nombresAlternativos String[]
  // Sinónimos para el buscador. Ej: ["Leg curl sentado",
  // "Flexión de rodilla sentada"]
  // El buscador encuentra el ejercicio por cualquiera de estos nombres

  descripcion         String?
  // Puntos clave de ejecución técnica

  erroresComunes      String?
  // Errores frecuentes a evitar

  // CLASIFICACIÓN (ejes de los filtros)
  musculoPrincipal    GrupoMuscular
  musculosSecundarios GrupoMuscular[]
  articulacion        TipoArticulacion
  patron              PatronMovimiento
  equipamiento        TipoEquipamiento[]
  // Array: un ejercicio puede requerir más de un equipamiento
  // Ej: Hip Thrust → [BARRA, BANCO]
  lateralidad         Lateralidad
  posicionCarga       PosicionCarga       @default(NEUTRA)
  // Integrado con IL-Campus-Prompt-CapaCientifica.md
  nivelTecnico        NivelTecnico        @default(BASICO)

  // MEDIA
  urlVideo            String?
  // URL completa de YouTube. Ej: https://youtu.be/abc123
  // o https://www.youtube.com/watch?v=abc123
  thumbnailUrl        String?
  // Generado automáticamente desde urlVideo al guardar.
  // Formato: https://img.youtube.com/vi/[VIDEO_ID]/hqdefault.jpg
  // No requiere upload manual de imagen.

  // GESTIÓN
  origen              OrigenEjercicio     @default(BIBLIOTECA_IL)
  // BIBLIOTECA_IL: ejercicios base de IL-Campus
  // PERSONALIZADO: creados manualmente por el entrenador
  visibleParaClientes Boolean             @default(true)
  archivado           Boolean             @default(false)
  // Archivado = oculto en biblioteca activa pero no eliminado
  // Los ejercicios archivados no aparecen en el constructor

  creadoEn            DateTime            @default(now())
  actualizadoEn       DateTime            @updatedAt

  // RELACIONES
  ejerciciosPlanificados EjercicioPlanificado[]
  resultadosTesteo       ResultadoTesteo[]
  alertasEstancamiento   AlertaEstancamiento[]
  porcentajesCliente     PorcentajesCliente[]
}

// Enums de clasificación

enum GrupoMuscular {
  CUADRICEPS
  ISQUIOTIBIALES
  GLUTEO
  PECHO
  ESPALDA
  HOMBROS
  BICEPS
  TRICEPS
  CORE
  GEMELOS
  ADUCTORES
  ABDOMINALES
  LUMBARES
  TRAPECIO
  ANTEBRAZOS
}

enum TipoArticulacion {
  MONOARTICULAR
  BIARTICULAR
  MULTIARTICULAR
}

enum PatronMovimiento {
  EMPUJE_HORIZONTAL    // Press banca, fondos
  EMPUJE_VERTICAL      // Press militar, fondos en paralelas
  TRACCION_HORIZONTAL  // Remo, face pulls
  TRACCION_VERTICAL    // Dominadas, jalón al pecho
  BISAGRA              // Peso muerto, buenos días
  SENTADILLA           // Sentadilla, prensa
  AISLAMIENTO          // Curl, extensión, elevaciones
  ISOMETRICO           // Plancha, wall sit
  CARGADA_OLIMPICA     // Clean, snatch, push press
  CAMINATA_TRANSPORTE  // Farmer walk, suitcase carry
}

enum TipoEquipamiento {
  MAQUINA
  BARRA
  MANCUERNA
  POLEA
  BANDA_ELASTICA
  PESO_CORPORAL
  TRX
  KETTLEBELL
  MULTIPOWER
  BANCO
  DISCO
  CABLE
}

enum Lateralidad {
  BILATERAL
  UNILATERAL
}

enum PosicionCarga {
  LONGITUD_LARGA
  LONGITUD_CORTA
  NEUTRA
}

enum NivelTecnico {
  BASICO
  INTERMEDIO
  AVANZADO
}

enum OrigenEjercicio {
  BIBLIOTECA_IL    // ejercicios base cargados por importación
  PERSONALIZADO    // creados manualmente por el entrenador
}

// Extender modelo EjercicioPlanificado
// (ya existe en la app — agregar campos nuevos)
model EjercicioPlanificado {
  // campos existentes...

  // CAMPOS NUEVOS:
  ejercicioId         String?
  // NULL si es ejercicio libre (texto escrito a mano)
  // POPULATED si fue seleccionado de la biblioteca
  ejercicio           Ejercicio?  @relation(fields: [ejercicioId], references: [id])

  nombreLibre         String?
  // Usado cuando ejercicioId es NULL
  // El nombre que escribió el entrenador a mano
  // REGLA: siempre debe tener ejercicioId O nombreLibre, nunca ambos nulos

  esBiblioteca        Boolean     @default(false)
  // true: ejercicio vinculado a la biblioteca (tiene ejercicioId)
  // false: ejercicio libre (tiene nombreLibre)
}
```

---

## SISTEMA DE AUTOCOMPLETADO — PRINCIPIO FUNDAMENTAL

**El campo de nombre de ejercicio en el constructor es SIEMPRE texto libre.**

La biblioteca actúa como asistente de autocompletado, nunca como
restricción. El flujo exacto es:

```
1. Entrenador empieza a escribir en el campo de nombre
2. A partir de 2 caracteres, el sistema busca coincidencias
   en la biblioteca (nombre principal + nombres alternativos)
3. Si hay coincidencias → se muestra un dropdown de sugerencias
4. Entrenador puede:
   a) Seleccionar una sugerencia → queda vinculado a la biblioteca
      (esBiblioteca = true, ejercicioId = id del ejercicio)
   b) Ignorar las sugerencias y seguir escribiendo → al perder
      el foco el campo queda como texto libre
      (esBiblioteca = false, nombreLibre = lo que escribió)
5. En ambos casos el entrenador completa series, reps, RIR, etc.
   No hay diferencia en el flujo posterior.
```

**Comportamiento del dropdown de sugerencias:**

```
[Curl femoral sen|                        ]
 ↓
┌────────────────────────────────────────┐
│ 🟢 Curl femoral sentado                │
│    Isquio · Máquina · Longitud larga   │
│                                        │
│ ○  Curl femoral acostado               │
│    Isquio · Máquina · Longitud corta   │
│                                        │
│ ○  Curl femoral de pie unilateral      │
│    Isquio · Polea · Longitud larga     │
└────────────────────────────────────────┘
```

El ícono 🟢 indica longitud muscular larga (badge IUSCA).
Debajo de cada sugerencia: músculo principal · equipamiento · posición.

Si no hay coincidencias en la biblioteca:

```
[Curl predicador con cable|              ]
 ↓
┌────────────────────────────────────────┐
│ Sin resultados en la biblioteca.       │
│ Escribí el nombre y guardá como libre. │
│                                        │
│ [+ Guardar en biblioteca después]      │
└────────────────────────────────────────┘
```

**Diferencia visual en la sesión armada:**

En el listado de ejercicios de una sesión, los ejercicios de
biblioteca muestran un ícono de video 🎬 clickeable que abre
el video. Los ejercicios libres muestran solo el nombre sin ícono.

```
🎬 Curl femoral sentado         4 × 10-12  RIR 2
🎬 Hip Thrust con barra         4 × 10-12  RIR 2
   Curl predicador cable        3 × 12-15  RIR 2   [+ Guardar en bib.]
🎬 Press inclinado mancuernas   3 × 10-12  RIR 2
```

---

## OPCIÓN "GUARDAR EN BIBLIOTECA"

Cuando el entrenador usa un ejercicio libre, aparece el link
"[+ Guardar en biblioteca]" junto al nombre en la sesión.

Al hacer clic se abre un modal compacto de alta rápida:

```
GUARDAR EN BIBLIOTECA

Nombre: Curl predicador cable        [editable]

Músculo principal:  [Bíceps          ▼]
Articulación:       [Monoarticular   ▼]
Patrón:             [Aislamiento     ▼]
Equipamiento:       [Polea ×] [Cable ×] [+ agregar]
Lateralidad:        [Bilateral       ▼]
Posición de carga:  [Neutra          ▼]
Nivel técnico:      [Intermedio      ▼]

URL del video (opcional):
[https://youtu.be/...                  ]

[Guardar en biblioteca]   [Cancelar]
```

Al guardar:
- Se crea el registro en Ejercicio con origen PERSONALIZADO
- El EjercicioPlanificado se actualiza: esBiblioteca = true,
  ejercicioId = nuevo id, nombreLibre = null
- El ejercicio queda disponible en la biblioteca y en el
  autocompletado de futuras sesiones
- En la sesión el ícono 🎬 aparece si se agregó video

---

## BIBLIOTECA — PANEL DEL ENTRENADOR

### Acceso y navegación

Ruta: `/biblioteca`
Ítem en el menú principal de navegación: "Biblioteca"
(reemplaza "Rutinas")

Header de la página:

```
Biblioteca de ejercicios                [+ Nuevo ejercicio]

[🔍 Buscar ejercicio...]

Filtros activos: (ninguno)              [Limpiar todo]

[Grilla ▦] [Lista ☰] [Por músculo ⊞]   108 ejercicios
```

### Sistema de filtros

**Comportamiento:** filtros combinables en modo AND acumulativo.
Cada filtro activo suma a la selección previa.
Cada filtro activo aparece como chip removible encima de los resultados.

```
GRUPO MUSCULAR
[Todos] [Cuádriceps] [Isquiotibiales] [Glúteo] [Pecho]
[Espalda] [Hombros] [Bíceps] [Tríceps] [Core]
[Gemelos] [Aductores] [Abdominales]

EQUIPAMIENTO
[Todos] [Máquina] [Barra] [Mancuerna] [Polea]
[Banda elástica] [Peso corporal] [TRX] [Kettlebell]

ARTICULACIÓN
[Todos] [Monoarticular] [Biarticular] [Multiarticular]

LATERALIDAD
[Todos] [Bilateral] [Unilateral]

POSICIÓN DE CARGA
[Todos] [Longitud larga ⭐] [Longitud corta] [Neutra]

PATRÓN DE MOVIMIENTO
[Todos] [Empuje] [Tracción] [Bisagra] [Sentadilla]
[Aislamiento] [Isométrico]

NIVEL TÉCNICO
[Todos] [Básico] [Intermedio] [Avanzado]

ORIGEN
[Todos] [Biblioteca IL] [Mis ejercicios]
```

Ejemplo con filtros activos:

```
Filtros activos:
[Glúteo ×] [Unilateral ×] [Longitud larga ×]    [Limpiar todo]

3 ejercicios encontrados
```

### Vista 1 — Grilla de tarjetas (por defecto)

Cada tarjeta muestra:
- Thumbnail del video (generado automáticamente de YouTube)
  Si no tiene video: placeholder con ícono de ejercicio
- Nombre del ejercicio
- Badge de grupo muscular (color por grupo)
- Badges de equipamiento (máx 2 visibles, "+N" si hay más)
- Badge "LONGITUD LARGA 🟢" si posicionCarga = LONGITUD_LARGA
- Badge "Mi ejercicio" si origen = PERSONALIZADO
- Ícono de menú (⋮) con opciones: Editar / Duplicar / Archivar

Al hacer clic en la tarjeta → abre modal de detalle.

### Vista 2 — Lista compacta

Una fila por ejercicio con columnas:
Nombre | Músculo | Articulación | Equipamiento | Lateralidad | Posición | Video

Clic en fila → abre modal de detalle.
Ícono de lápiz al final de la fila → edición directa.

### Vista 3 — Agrupada por músculo

```
CUÁDRICEPS  (18 ejercicios)
────────────────────────────────────────────────────
🎬 Sentadilla libre           Multi · Barra     [LONGITUD LARGA 🟢]
🎬 Sentadilla búlgara         Multi · Mancuerna [LONGITUD LARGA 🟢]
🎬 Prensa 45°                 Multi · Máquina
🎬 Extensión de cuádriceps    Mono  · Máquina
...

ISQUIOTIBIALES  (11 ejercicios)
────────────────────────────────────────────────────
🎬 Curl femoral sentado       Mono  · Máquina   [LONGITUD LARGA 🟢]
🎬 Curl femoral acostado      Mono  · Máquina
🎬 Peso muerto rumano         Multi · Barra
...
```

### Modal de detalle del ejercicio

Se abre sin salir de la biblioteca. Diseño en dos columnas:

```
┌────────────────────────────────────────────────────────────────┐
│  Curl femoral sentado                    [✏ Editar]  [✕ Cerrar]│
├───────────────────────┬────────────────────────────────────────┤
│                       │  Músculo principal:  Isquiotibiales    │
│  [VIDEO EMBEBIDO]     │  Secundarios:        Glúteo, Gemelos   │
│  reproducible         │                                        │
│  directamente         │  Articulación:   Monoarticular         │
│  sin salir del modal  │  Patrón:         Aislamiento           │
│                       │  Equipamiento:   Máquina               │
│                       │  Lateralidad:    Bilateral             │
│                       │  Nivel técnico:  Básico                │
│                       │                                        │
│                       │  ┌──────────────────────────────────┐  │
│                       │  │ 🟢 LONGITUD LARGA               │  │
│                       │  │ Mayor estímulo hipertrófico      │  │
│                       │  │ (IUSCA Position Stand 2021)      │  │
│                       │  └──────────────────────────────────┘  │
├───────────────────────┴────────────────────────────────────────┤
│  Ejecución técnica:                                            │
│  Ajustá el asiento para que la rodilla quede alineada con el  │
│  eje de rotación de la máquina. Controlá la fase excéntrica   │
│  en 3 segundos. Mantené la cadera apoyada en todo momento.    │
│                                                               │
│  Errores comunes:                                             │
│  Elevar la cadera en el punto de máxima contracción.          │
│  Usar impulso (momentum) en la fase concéntrica.              │
│  Rango de movimiento parcial.                                 │
└────────────────────────────────────────────────────────────────┘
```

Si el modal se abre desde el constructor de planificaciones,
aparece al pie: `[← Agregar a la sesión]`

### Formulario de nuevo ejercicio / edición

Accesible desde el botón "+ Nuevo ejercicio" y desde el ícono
de edición en cualquier ejercicio.

```
NUEVO EJERCICIO

Nombre principal *
[Curl femoral sentado                              ]

Nombres alternativos (sinónimos para el buscador)
[Leg curl sentado    ×] [Flexión rodilla ×] [+ Agregar]

─────────────────────────────────────────────────
CLASIFICACIÓN

Músculo principal *        [Isquiotibiales        ▼]
Músculos secundarios       [Glúteo ×] [Gemelos ×] [+ Agregar]
Articulación *             [Monoarticular         ▼]
Patrón de movimiento *     [Aislamiento           ▼]
Equipamiento *             [Máquina ×]            [+ Agregar]
Lateralidad *              [Bilateral             ▼]
Posición de carga *        [Longitud larga        ▼]
Nivel técnico              [Básico                ▼]

─────────────────────────────────────────────────
MEDIA

URL del video de YouTube
[https://youtu.be/...                              ]
                        → thumbnail se genera automáticamente

Vista previa:
[THUMBNAIL]  Curl femoral sentado — IG: @il.coaching

─────────────────────────────────────────────────
CONTENIDO

Ejecución técnica
[Ajustá el asiento para que la rodilla...          ]
[                                                  ]

Errores comunes
[Elevar la cadera en el punto de máxima...         ]

─────────────────────────────────────────────────
CONFIGURACIÓN

Visible para clientes    [✓ Sí]
(los clientes pueden ver este ejercicio en su app)

─────────────────────────────────────────────────

[Cancelar]                              [Guardar ejercicio]
```

Campos marcados con * son obligatorios.

### Funciones de gestión

**Duplicar ejercicio:**
Ícono (⋮) → Duplicar → Se crea una copia con nombre
"[Nombre original] — copia" lista para editar.
Útil para crear variantes: duplicar "Press banca" →
editar a "Press banca agarre cerrado".

**Archivar ejercicio:**
Ícono (⋮) → Archivar → Confirmación:
"Este ejercicio dejará de aparecer en la biblioteca y en
el constructor. No se elimina — podés restaurarlo cuando quieras."
[Cancelar] [Archivar]

Los ejercicios archivados NO aparecen en el buscador del
constructor ni en la biblioteca activa.

Sección "Archivados" accesible desde "Gestionar → Ver archivados"
con opción de restaurar cada uno.

**Toggle de visibilidad para clientes:**
Disponible en el formulario de edición y en el ícono (⋮).
Si visibleParaClientes = false, el ejercicio funciona
normalmente para el entrenador pero no aparece en la app
del entrenado.

---

## IMPORTACIÓN MASIVA — PANEL DE ADMINISTRACIÓN

### Acceso

Menú de la Biblioteca → "Gestionar" → "Importar ejercicios"

### Flujo completo

**Paso 1 — Descargar template:**

```
IMPORTAR EJERCICIOS

1. Descargá el template CSV
[⬇ Descargar template.csv]

El template contiene todas las columnas requeridas con
ejemplos en la primera fila para guiarte.
```

**Estructura del template CSV:**

```
nombre | nombres_alternativos | musculo_principal | musculos_secundarios |
articulacion | patron | equipamiento | lateralidad | posicion_carga |
nivel_tecnico | url_video | descripcion | errores_comunes | visible_clientes
```

Valores válidos por columna (documentados en el template):
- musculo_principal: CUADRICEPS, ISQUIOTIBIALES, GLUTEO, PECHO,
  ESPALDA, HOMBROS, BICEPS, TRICEPS, CORE, GEMELOS, ADUCTORES,
  ABDOMINALES, LUMBARES, TRAPECIO, ANTEBRAZOS
- articulacion: MONOARTICULAR, BIARTICULAR, MULTIARTICULAR
- patron: EMPUJE_HORIZONTAL, EMPUJE_VERTICAL, TRACCION_HORIZONTAL,
  TRACCION_VERTICAL, BISAGRA, SENTADILLA, AISLAMIENTO, ISOMETRICO,
  CARGADA_OLIMPICA, CAMINATA_TRANSPORTE
- equipamiento: MAQUINA, BARRA, MANCUERNA, POLEA, BANDA_ELASTICA,
  PESO_CORPORAL, TRX, KETTLEBELL, MULTIPOWER, BANCO, DISCO, CABLE
  (separar múltiples con |, ej: BARRA|BANCO)
- musculos_secundarios: mismos valores que musculo_principal
  (separar múltiples con |)
- lateralidad: BILATERAL, UNILATERAL
- posicion_carga: LONGITUD_LARGA, LONGITUD_CORTA, NEUTRA
- nivel_tecnico: BASICO, INTERMEDIO, AVANZADO
- visible_clientes: SI, NO

**Paso 2 — Completar y subir:**

```
2. Completá el archivo con tus ejercicios

3. Subí el archivo completado
[📎 Seleccionar archivo CSV]

[Importar ejercicios]
```

**Paso 3 — Reporte de importación:**

El sistema valida cada fila antes de guardar.
Si hay errores, los muestra por fila sin cancelar la importación
de las filas válidas:

```
RESULTADO DE IMPORTACIÓN

✓ 94 ejercicios importados correctamente

⚠ 6 filas con errores (no importadas):

  Fila 12 — "Sentadilla hack"
  Error: musculo_principal "PIERNA" no es válido.
  Válido: CUADRICEPS, ISQUIOTIBIALES, GLUTEO...

  Fila 23 — "Press Arnold"
  Error: articulacion vacía. Campo requerido.

  Fila 31 — "Pull over"
  Error: url_video no es una URL de YouTube válida.
  Valor recibido: "pullover ejercicio"

  [Descargar filas con errores.csv]
```

El CSV de errores tiene las filas problemáticas listas para
corregir y volver a importar solo esas.

**Paso 4 — Generación automática de thumbnails:**

Tras la importación, el sistema procesa en background todas
las URLs de YouTube para extraer el VIDEO_ID y construir
la URL del thumbnail:

```
https://img.youtube.com/vi/[VIDEO_ID]/hqdefault.jpg
```

El entrenador ve un indicador de progreso:
"Generando thumbnails... 67/94"

Los ejercicios son usables inmediatamente aunque el thumbnail
no esté listo todavía.

### Exportación

Menú Gestionar → "Exportar biblioteca"
Descarga un CSV con todos los ejercicios activos en el
mismo formato del template. Útil como respaldo o para
edición masiva.

---

## INTEGRACIÓN CON EL CONSTRUCTOR DE PLANIFICACIONES

### Campo de nombre de ejercicio

En el editor de sesión, el campo de nombre de cada ejercicio
funciona así:

```
[Nombre del ejercicio...                          ]
```

**Al escribir (a partir de 2 caracteres):**

El sistema busca en tiempo real en:
1. nombre (match parcial, insensible a mayúsculas/tildes)
2. nombresAlternativos (mismo criterio)

```
[curl fem|                                        ]
 ↓ dropdown aparece automáticamente
┌──────────────────────────────────────────────────┐
│  🎬 🟢 Curl femoral sentado                      │
│       Isquio · Máquina · Longitud larga          │
│                                                  │
│  🎬    Curl femoral acostado                     │
│       Isquio · Máquina · Longitud corta          │
│                                                  │
│  🎬    Curl femoral de pie unilateral            │
│       Isquio · Polea · Unilateral                │
└──────────────────────────────────────────────────┘
```

Leyenda de íconos en el dropdown:
- 🎬: tiene video disponible
- 🟢: posición de longitud larga (badge IUSCA)

**Si el entrenador selecciona del dropdown:**
- Campo queda con el nombre del ejercicio seleccionado
- esBiblioteca = true
- ejercicioId = id del ejercicio
- El ícono 🎬 aparece junto al nombre en la sesión
- Si hay 1RM registrado para ese ejercicio → se pre-carga
  el peso sugerido según las reps definidas
- La posición de carga del ejercicio queda disponible para
  el sistema IUSCA

**Si el entrenador ignora el dropdown y sigue escribiendo:**
- Al presionar Tab, Enter o hacer clic fuera del campo
  el dropdown se cierra
- El nombre queda como fue escrito
- esBiblioteca = false
- nombreLibre = texto ingresado
- No aparece ícono 🎬
- Aparece link "[+ Guardar en biblioteca]"

**Si no hay coincidencias:**
```
[Split squat en smith|                            ]
 ↓
┌──────────────────────────────────────────────────┐
│  Sin resultados en la biblioteca                 │
│  Escribí el nombre y continuá normalmente.       │
└──────────────────────────────────────────────────┘
```
El dropdown desaparece al hacer clic fuera.
El ejercicio queda como libre.

### Al agregar un ejercicio desde la biblioteca al constructor

Cuando el entrenador selecciona un ejercicio de la biblioteca,
el sistema pre-carga automáticamente:

1. **Posición de carga** → disponible para el validador IUSCA
   (longitud larga/corta/neutra del prompt CapaCientifica)

2. **Peso sugerido** → si existe ResultadoTesteo para este
   cliente y ejercicio, calcula el peso según el rango de reps
   y la tabla de porcentajes (prompt TesteoYZonas)

3. **Zona de intensidad** → si el ejercicio tiene reps definidas,
   detecta automáticamente la zona (prompt TesteoYZonas)

### Acceso a la biblioteca completa desde el constructor

Si el entrenador quiere explorar la biblioteca con filtros
(en lugar de buscar por nombre), hay un botón junto al campo:

```
[Nombre del ejercicio...              ] [📚 Explorar biblioteca]
```

"Explorar biblioteca" abre un drawer lateral con la biblioteca
completa con filtros, las tres vistas y el buscador.
Al hacer clic en un ejercicio en el drawer → se agrega a la sesión
y el drawer se cierra.

---

## BIBLIOTECA EN LA APP DEL ENTRENADO

Los clientes pueden ver la biblioteca de ejercicios desde su app
pero con capacidades limitadas:

**Lo que VEN:**
- Lista de ejercicios con visibleParaClientes = true
- Nombre, video embebido, descripción técnica
- Filtros: grupo muscular, equipamiento (simplificados)

**Lo que NO VEN:**
- Campos técnicos de clasificación (articulación, patrón, etc.)
- Ejercicios con visibleParaClientes = false
- Opciones de edición o gestión

**Para qué sirve:**
El entrenado puede buscar el ejercicio de su rutina y ver el video
de ejecución correcta antes o durante la sesión.

---

## ENDPOINTS NUEVOS REQUERIDOS

```
// Biblioteca
GET    /api/biblioteca
       query params: musculo, equipamiento, articulacion,
                     lateralidad, posicionCarga, patron,
                     nivelTecnico, origen, busqueda, archivado
       → Ejercicio[] filtrados

GET    /api/biblioteca/[id]
       → Ejercicio completo con todos los campos

POST   /api/biblioteca
       body: datos del ejercicio
       → Ejercicio creado

PUT    /api/biblioteca/[id]
       body: campos a actualizar
       → Ejercicio actualizado

POST   /api/biblioteca/[id]/archivar
       → Ejercicio archivado (archivado = true)

POST   /api/biblioteca/[id]/restaurar
       → Ejercicio restaurado (archivado = false)

POST   /api/biblioteca/[id]/duplicar
       → Nuevo Ejercicio con nombre "[nombre] — copia"

// Importación masiva
POST   /api/biblioteca/importar
       body: FormData con archivo CSV
       → { importados: number, errores: ErrorImportacion[] }

GET    /api/biblioteca/exportar
       → descarga de CSV con biblioteca completa

// Autocompletado (para el constructor)
GET    /api/biblioteca/buscar?q=curl+fem&limit=5
       → Ejercicio[] (máx 5 resultados, búsqueda rápida)
       Busca en nombre + nombresAlternativos
       Solo ejercicios no archivados

// App del entrenado
GET    /api/biblioteca/cliente
       → Ejercicio[] con visibleParaClientes = true
       Campos limitados (sin clasificación técnica)
```

---

## LÓGICA DE GENERACIÓN DE THUMBNAILS

```typescript
// src/nucleo/biblioteca/thumbnail.util.ts

function extraerVideoId(url: string): string | null {
  // Soportar múltiples formatos de URL de YouTube:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://youtube.com/shorts/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID

  const patrones = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]

  for (const patron of patrones) {
    const match = url.match(patron)
    if (match) return match[1]
  }
  return null
}

function generarThumbnailUrl(urlVideo: string): string | null {
  const videoId = extraerVideoId(urlVideo)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function generarUrlEmbed(urlVideo: string): string | null {
  const videoId = extraerVideoId(urlVideo)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
}

// Al guardar un ejercicio con urlVideo:
// 1. Extraer videoId
// 2. Generar thumbnailUrl y guardarlo en el campo thumbnailUrl
// 3. Usar generarUrlEmbed() para el embed en el modal de detalle
// 4. Si urlVideo no es YouTube válido → mostrar error de validación
```

---

## CRITERIOS DE COMPLETITUD

Este sistema está implementado correctamente cuando:

- [ ] La sección "Rutinas" se llama "Biblioteca" en toda la app
      incluyendo menú, URLs, títulos y mensajes del sistema
- [ ] El modelo Ejercicio existe en la base de datos con todos
      los enums y campos especificados
- [ ] EjercicioPlanificado tiene los campos ejercicioId,
      nombreLibre y esBiblioteca
- [ ] El campo de nombre en el constructor es texto libre
      con autocompletado opcional — nunca bloquea el guardado
- [ ] El autocompletado busca en nombre Y nombresAlternativos
      con match insensible a mayúsculas y tildes
- [ ] Los ejercicios de biblioteca muestran ícono 🎬
      y los libres muestran el link "[+ Guardar en biblioteca]"
- [ ] El modal de detalle abre el video embebido reproducible
      directamente sin salir de la biblioteca
- [ ] El formulario de alta genera el thumbnail automáticamente
      desde la URL de YouTube sin upload manual de imagen
- [ ] Los filtros son combinables en modo AND acumulativo
      y muestran chips removibles con el conteo de resultados
- [ ] Las tres vistas (grilla, lista, por músculo) están
      implementadas y el sistema recuerda la preferencia
- [ ] La importación masiva por CSV funciona con validación
      por fila y reporte descargable de errores
- [ ] La exportación genera un CSV con la biblioteca completa
- [ ] Duplicar ejercicio crea una copia editable
- [ ] Archivar oculta el ejercicio del constructor y la
      biblioteca activa sin eliminarlo de la base de datos
- [ ] El modal "Guardar en biblioteca" convierte un ejercicio
      libre en ejercicio de biblioteca actualizando el registro
- [ ] La app del entrenado muestra solo ejercicios con
      visibleParaClientes = true con campos simplificados
- [ ] El drawer "Explorar biblioteca" en el constructor tiene
      filtros completos y agrega el ejercicio al hacer clic
- [ ] Al seleccionar ejercicio de biblioteca en el constructor
      se pre-cargan posición de carga, peso sugerido y zona
      (integración con CapaCientifica y TesteoYZonas)

---

*Biblioteca de Ejercicios IL-Campus v1.0*
*Sistema de autocompletado libre — la biblioteca es asistente, no restricción*

---

## SCRIPT DE MIGRACIÓN DESDE PDF — CARGA INICIAL DE LA BIBLIOTECA

### Contexto

Los ejercicios de la biblioteca inicial de IL-Campus están en uno
o más archivos PDF estructurados que contienen: nombre del ejercicio,
categorización (grupo muscular, equipamiento, etc.) y URL del video
de YouTube correspondiente.

El desarrollador debe crear un script de migración que lea estos PDFs,
extraiga los datos estructurados y los importe directamente a la base
de datos, evitando la carga manual ejercicio por ejercicio.

### Instrucciones para el desarrollador

**Paso 1 — Leer y analizar el PDF**

Antes de escribir el script, analizar el PDF de la biblioteca
para entender su estructura exacta. Los PDFs pueden estar
organizados de distintas formas:

Posibilidad A — Por secciones de grupo muscular:
```
GLÚTEO
Nombre del ejercicio
https://youtu.be/abc123

Nombre del ejercicio 2
https://youtu.be/def456
```

Posibilidad B — En tabla:
```
Ejercicio          | Músculo  | Equipamiento | Video
Curl femoral sent. | Isquio   | Máquina      | https://youtu.be/abc
```

Posibilidad C — Como lista numerada con metadatos inline:
```
1. Curl femoral sentado (Máquina · Isquio · Monoarticular)
   Video: https://youtu.be/abc123
```

El desarrollador debe leer el PDF con la librería que prefiera
(pdf-parse, pdfjs-dist, pypdf, pdfplumber, etc.) y determinar
cuál es el patrón real antes de escribir el parser.

**Paso 2 — Escribir el parser específico al formato encontrado**

El script debe:

1. Leer cada PDF de la biblioteca
2. Detectar los bloques de ejercicio (nombre + metadatos + URL)
3. Mapear cada campo detectado a los enums del modelo Ejercicio:
   - Grupo muscular → GrupoMuscular enum
   - Equipamiento → TipoEquipamiento enum
   - Articulación → TipoArticulacion enum
   - etc.
4. Extraer el VIDEO_ID de cada URL de YouTube usando la función
   extraerVideoId() ya especificada en este prompt
5. Generar el thumbnailUrl automáticamente
6. Para los campos que no estén explícitos en el PDF
   (ej: posicionCarga, nivelTecnico), usar valores default
   razonables y marcarlos para revisión posterior

**Paso 3 — Generar reporte antes de insertar**

El script NO debe insertar directamente en producción sin
validación previa. El flujo correcto es:

```
npx tsx scripts/importar-biblioteca-pdf.ts \
  --pdf ./archivos/biblioteca-1.pdf \
  --dry-run
```

El flag `--dry-run` genera un reporte JSON/CSV con lo que
se importaría sin tocar la base de datos:

```json
[
  {
    "nombre": "Curl femoral sentado",
    "musculoPrincipal": "ISQUIOTIBIALES",
    "articulacion": "MONOARTICULAR",
    "equipamiento": ["MAQUINA"],
    "urlVideo": "https://youtu.be/abc123",
    "videoId": "abc123",
    "thumbnailUrl": "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    "camposInferidos": ["posicionCarga", "nivelTecnico"],
    "confianza": "ALTA"
  },
  {
    "nombre": "Ejercicio con datos incompletos",
    "musculoPrincipal": null,
    "urlVideo": null,
    "confianza": "BAJA",
    "error": "No se pudo detectar el grupo muscular"
  }
]
```

El campo `confianza` clasifica cada ejercicio extraído:
- ALTA: todos los campos obligatorios detectados correctamente
- MEDIA: campos obligatorios presentes pero algunos inferidos
- BAJA: datos incompletos o ambiguos — requieren revisión manual

**Paso 4 — Revisión humana del reporte**

Iñaki revisa el output del dry-run, corrige los ejercicios
con confianza BAJA editando el JSON o el CSV generado, y
confirma que el mapeo es correcto.

**Paso 5 — Inserción real**

```
npx tsx scripts/importar-biblioteca-pdf.ts \
  --pdf ./archivos/biblioteca-1.pdf \
  --insertar
```

O si se corrigió el JSON del dry-run:

```
npx tsx scripts/importar-biblioteca-pdf.ts \
  --desde-json ./output/biblioteca-revisada.json \
  --insertar
```

El script reporta al final:
```
✓ 94 ejercicios insertados correctamente
⚠  6 ejercicios omitidos (confianza BAJA — revisar manualmente)
   Ver: output/omitidos.csv
```

**Paso 6 — Carga de múltiples PDFs**

Si hay más de un PDF de biblioteca, el script debe soportar
procesar varios archivos en secuencia sin duplicar ejercicios:

```
npx tsx scripts/importar-biblioteca-pdf.ts \
  --pdf ./archivos/biblioteca-1.pdf \
  --pdf ./archivos/biblioteca-2.pdf \
  --insertar
```

El script detecta duplicados por nombre (insensible a
mayúsculas/tildes) y pregunta antes de sobreescribir:
```
⚠ "Curl femoral sentado" ya existe en la base de datos.
  ¿Sobreescribir? [s/N]
```

### Campos que el script debe mapear

El desarrollador debe construir un diccionario de mapeo
para normalizar los textos del PDF a los enums del sistema.
Los PDFs pueden usar nombres informales que hay que mapear:

```typescript
// Ejemplos de mapeo — el desarrollador debe completarlo
// según los términos reales que encuentre en los PDFs

const MAPEO_MUSCULO: Record<string, GrupoMuscular> = {
  'glúteo': 'GLUTEO',
  'gluteo': 'GLUTEO',
  'glute': 'GLUTEO',
  'isquiotibiales': 'ISQUIOTIBIALES',
  'isquio': 'ISQUIOTIBIALES',
  'femoral': 'ISQUIOTIBIALES',
  'cuádriceps': 'CUADRICEPS',
  'cuadriceps': 'CUADRICEPS',
  'quad': 'CUADRICEPS',
  'pecho': 'PECHO',
  'pectoral': 'PECHO',
  'espalda': 'ESPALDA',
  'dorsal': 'ESPALDA',
  'hombro': 'HOMBROS',
  'deltoides': 'HOMBROS',
  'bíceps': 'BICEPS',
  'tríceps': 'TRICEPS',
  'core': 'CORE',
  'abdomen': 'ABDOMINALES',
  'gemelo': 'GEMELOS',
  'pantorrilla': 'GEMELOS',
  // ... completar según el PDF real
}

const MAPEO_EQUIPAMIENTO: Record<string, TipoEquipamiento> = {
  'máquina': 'MAQUINA',
  'maquina': 'MAQUINA',
  'barra': 'BARRA',
  'mancuerna': 'MANCUERNA',
  'mancuernas': 'MANCUERNA',
  'polea': 'POLEA',
  'cable': 'CABLE',
  'banda': 'BANDA_ELASTICA',
  'banda elástica': 'BANDA_ELASTICA',
  'peso corporal': 'PESO_CORPORAL',
  'sin material': 'PESO_CORPORAL',
  'trx': 'TRX',
  'kettlebell': 'KETTLEBELL',
  'pesa rusa': 'KETTLEBELL',
  'multipower': 'MULTIPOWER',
  'smith': 'MULTIPOWER',
  // ... completar según el PDF real
}
```

### Origen de los ejercicios importados por script

Todos los ejercicios cargados por este script deben tener:
```
origen = BIBLIOTECA_IL
visibleParaClientes = true
archivado = false
```

Los ejercicios que el entrenador agregue manualmente después
tendrán `origen = PERSONALIZADO`.

### Ubicación del script en el proyecto

```
/scripts/
  importar-biblioteca-pdf.ts    ← script principal
  /lib/
    pdf-parser.ts               ← extracción de texto del PDF
    ejercicio-mapper.ts         ← mapeo de texto a enums
    youtube-utils.ts            ← extracción de VIDEO_ID y thumbnail
    db-inserter.ts              ← inserción en base de datos
  /output/                      ← generado automáticamente
    [fecha]-dry-run.json
    [fecha]-omitidos.csv
    [fecha]-resultado.json
```

