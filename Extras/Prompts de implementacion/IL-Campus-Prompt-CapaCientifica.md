# PROMPT — IL-CAMPUS: CAPA CIENTÍFICA IUSCA
## Actualización de la app ya funcional con inteligencia basada en evidencia

---

## CONTEXTO Y PROPÓSITO

Este prompt es una actualización sobre la app IL-Campus ya construida.
No reemplaza ningún módulo existente — los extiende con lógica inteligente
basada en dos fuentes científicas de primer nivel:

**Fuente A:** Schoenfeld et al. (2021) — Position Stand IUSCA.
International Journal of Strength and Conditioning, 1(1).
"Resistance Training Recommendations to Maximize Muscle Hypertrophy
in an Athletic Population"

**Fuente B:** Compendio Universal de Entrenamiento de Fuerza y
Programación Personalizada — Evidencia y Praxis de Élite.
Basado en IUSCA + ACSM Guidelines (11th ed., 2021).

El objetivo es que IL-Campus trascienda de ser una plataforma de gestión
a convertirse en el sistema de asesoría más científicamente riguroso
del mercado hispanohablante.

Cada funcionalidad de este prompt tiene su fundamento científico
explícito. El agente desarrollador debe implementarlas respetando
ese fundamento y referenciándolo en los tooltips y textos de la UI.

---

## BASE DE DATOS — CAMBIOS REQUERIDOS

Antes de implementar las funcionalidades, extender el esquema de
Prisma con los siguientes modelos y campos nuevos:

```prisma
// Extender modelo Ejercicio
model Ejercicio {
  // campos existentes...
  posicionCarga      PosicionCarga    @default(NEUTRA)
  // NEUTRA | LONGITUD_LARGA | LONGITUD_CORTA
  // Fundamento: IUSCA — trabajo en longitud muscular larga
  // produce mayor hipertrofia
}

enum PosicionCarga {
  LONGITUD_LARGA
  LONGITUD_CORTA
  NEUTRA
}

// Extender modelo FormularioInscripcion
model FormularioInscripcion {
  // campos existentes...
  condicionesClinicas    String[]
  // valores posibles: HIPERTENSION | DIABETES | ADULTO_MAYOR |
  //                   LESION_ACTIVA | CARDIOPATIA | ASMA | NINGUNA
}

// Extender modelo Semana
model Semana {
  // campos existentes...
  modeloPeriodizacion    ModeloPeriodizacion   @default(LINEAL)
}

enum ModeloPeriodizacion {
  LINEAL
  ONDULANTE
  CONJUGADA
  PERSONALIZADO
}

// Extender modelo EjercicioPlanificado
model EjercicioPlanificado {
  // campos existentes...
  tempoExcentrica    Int?    // segundos fase excéntrica
  tempoPausa         Int?    // segundos pausa
  tempoConcentrica   Int?    // segundos fase concéntrica
  tempoPausaArriba   Int?    // segundos pausa arriba
  esUltimaSerieAlFallo Boolean @default(false)
  // Fundamento: IUSCA — fallo selectivo solo en última serie
  // de ejercicios de aislamiento
}

// Extender modelo SerieRegistrada
model SerieRegistrada {
  // campos existentes...
  velocidadPercibida    VelocidadPercibida?
  // Fundamento: Compendio — velocidad como herramienta de
  // monitoreo de fatiga SNC vs periférica
}

enum VelocidadPercibida {
  NORMAL
  LENTA
  MUY_LENTA
}

// Nuevo modelo: VolumenSemanal (calculado, para caché)
model VolumenSemanal {
  id             String   @id @default(cuid())
  semanaId       String
  grupoMuscular  String
  seriesTotal    Int
  // Calculado: Σ series de todos los ejercicios de esa semana
  // que trabajan ese grupo muscular
  bajoDeLaMinima Boolean  @default(false)
  // true si seriesTotal < 10 (umbral IUSCA)
  semana         Semana   @relation(fields: [semanaId], references: [id])
}

// Nuevo modelo: PerfilRespuesta
model PerfilRespuesta {
  id                String            @id @default(cuid())
  clienteId         String            @unique
  nivelRespuesta    NivelRespuesta?
  // Se evalúa después de 8 semanas (primer mesociclo)
  fechaEvaluacion   DateTime?
  notas             String?
  cliente           Cliente           @relation(fields: [clienteId], references: [id])
}

enum NivelRespuesta {
  ALTA
  NORMAL
  BAJA
}

// Nuevo modelo: AlertaEstancamiento
model AlertaEstancamiento {
  id                    String   @id @default(cuid())
  clienteId             String
  ejercicioId           String
  semanasEstancado      Int
  // Se activa cuando >= 3 semanas sin progreso
  revisada              Boolean  @default(false)
  creadaEn              DateTime @default(now())
  cliente               Cliente  @relation(fields: [clienteId], references: [id])
  ejercicio             Ejercicio @relation(fields: [ejercicioId], references: [id])
}

// Nuevo modelo: RegistroAdherencia
model RegistroAdherencia {
  id                  String   @id @default(cuid())
  clienteId           String
  semanaId            String
  sesionesPlanificadas Int
  sesionesCompletadas  Int
  porcentaje          Float
  // porcentaje = sesionesCompletadas / sesionesPlanificadas * 100
  cliente             Cliente  @relation(fields: [clienteId], references: [id])
}
```

---

## FUNCIONALIDAD 1 — VALIDADOR DE VOLUMEN SEMANAL

**Fundamento científico:**
IUSCA Position Stand: "Dosis mínima de 10 series semanales por grupo
muscular para optimizar la Síntesis de Proteína Muscular (MPS).
La curva de respuesta sigue una U invertida; superar el umbral de
recuperación erosiona el ROI biológico."

**Dónde vive:** VistaMicrociclo + VistaMesociclo (constructor planificación)

**Lógica de cálculo:**

```typescript
// src/nucleo/planificacion/volumenSemanal.servicio.ts

interface VolumenPorMusculo {
  grupoMuscular: string
  seriesTotal: number
  estado: 'BAJO' | 'OPTIMO' | 'ELEVADO'
  // BAJO: < 10 series → alerta amarilla
  // OPTIMO: 10-20 series → verde
  // ELEVADO: > 20 series → alerta naranja (riesgo de sobreentrenamiento)
}

async function calcularVolumenSemanal(semanaId: string): Promise<VolumenPorMusculo[]> {
  // 1. Obtener todos los ejercicios planificados de la semana
  // 2. Por cada ejercicio, obtener su grupo muscular
  // 3. Sumar series por grupo muscular
  // 4. Clasificar según umbrales IUSCA
  // 5. Guardar en VolumenSemanal (caché)
  // 6. Retornar array ordenado por estado (BAJO primero)
}
```

**UI en VistaMicrociclo:**

Panel lateral derecho dentro del microciclo titulado
"Volumen semanal por músculo":

```
VOLUMEN SEMANAL          [? tooltip con fundamento IUSCA]

Cuádriceps   ████████████  12 series  ✓ óptimo
Glúteo       ████████████  11 series  ✓ óptimo
Pecho        ████████░░░░   8 series  ⚠ bajo mínimo
Espalda      ██████████████ 15 series  ✓ óptimo
Isquio       ████░░░░░░░░   4 series  ⚠ bajo mínimo
Hombros      ██████████░░  10 series  ✓ óptimo
Bíceps       ████████░░░░   8 series  ⚠ bajo mínimo
Tríceps      ██████████░░  10 series  ✓ óptimo
```

Colores:
- Verde `--verde`: óptimo (10-20 series)
- Amarillo `--amarillo`: bajo mínimo (< 10 series)
- Naranja `--naranja`: elevado (> 20 series)

Tooltip en el ícono "?":
*"Según el consenso de la IUSCA (Schoenfeld et al., 2021),
el volumen mínimo efectivo es de 10 series semanales por
grupo muscular para optimizar la hipertrofia. Más de 20
series puede superar el umbral de recuperación individual."*

**Recálculo automático:** cada vez que el entrenador agrega,
edita o elimina un ejercicio en cualquier sesión de la semana.

**Endpoint nuevo:**
```
GET /api/planificacion/semana/[id]/volumen
→ retorna VolumenPorMusculo[]
```

---

## FUNCIONALIDAD 2 — PERFIL DE INTENSIDAD RIR POR SESIÓN

**Fundamento científico:**
IUSCA: "Sin proximidad real al Fallo Muscular Momentáneo, el volumen
es ineficaz. Para el atleta avanzado, el uso del Fallo Muscular debe
ser selectivo (preferiblemente en la última serie de ejercicios de
aislamiento) para gestionar el ratio estímulo-fatiga."
Compendio: "Mantener RIR 1-2 en la mayoría de las series previene el
sobreentrenamiento sistémico, reservando el fallo (RIR 0) solo para
bloques específicos."

**Dónde vive:** VistaSesion (editor de sesión del constructor)

**Lógica de clasificación:**

```typescript
interface PerfilIntensidadSesion {
  ejerciciosRIR_0_1: number   // fallo o cerca del fallo
  ejerciciosRIR_2_3: number   // zona productiva
  ejerciciosRIR_4_mas: number // técnica / adaptación
  distribucionCorrecta: boolean
  mensajeValidacion: string
}

function evaluarPerfilIntensidad(ejercicios: EjercicioPlanificado[]): PerfilIntensidadSesion {
  // Distribución correcta según IUSCA:
  // - La mayoría (> 60%) en RIR 2-3
  // - El fallo (RIR 0-1) solo en ejercicios de aislamiento
  //   y máximo en la última serie
  // - Si hay fallo en ejercicios multiarticulares → advertencia
}
```

**UI en VistaSesion:**

Widget compacto debajo de la barra de configuración de sesión:

```
PERFIL DE INTENSIDAD           [? tooltip]

RIR 0-1 (fallo)    ██░░░░░░  1 ejercicio
RIR 2-3 (trabajo)  ██████░░  3 ejercicios  ← zona productiva
RIR 4+  (técnica)  ████░░░░  2 ejercicios

✓ Distribución correcta según IUSCA
```

Si la distribución es incorrecta:

```
⚠ Distribución de intensidad subóptima:
  Sentadilla libre está a RIR 0 (fallo en ejercicio multiarticular).
  El consenso IUSCA recomienda reservar el fallo para ejercicios
  de aislamiento. Considerá subir el RIR a 1-2 en este ejercicio.
```

El entrenador puede ignorar la advertencia. No bloquea el guardado.

---

## FUNCIONALIDAD 3 — DELOAD OBLIGATORIO POR DEFECTO

**Fundamento científico:**
IUSCA: "Las semanas de descarga (deloads) no son opcionales.
Son fases de resíntesis necesarias para la salud del tejido
conectivo y la longevidad competitiva."
Compendio: "Adultos mayores presentan resistencia anabólica y
recuperación más lenta — el deload es aún más crítico en esta población."

**Dónde vive:** VistaMesociclo (al crear un nuevo mesociclo)

**Comportamiento:**

Al crear un nuevo mesociclo de 4+ semanas, la Semana 4 se
pre-marca automáticamente como DELOAD con:
- Badge "Deload" en amarillo
- RIR pre-cargado en 4-5
- Volumen pre-cargado en "Reducido (50-60% del pico)"
- Icono de candado parcial que indica "recomendado no cambiar"

Si el entrenador intenta cambiar el tipo de la Semana 4 a "Trabajo",
aparece una confirmación:

```
⚠ Estás por eliminar la semana de deload

El consenso de la IUSCA establece que las semanas de
descarga son fases de resíntesis necesarias para la salud
del tejido conectivo. Eliminarla puede comprometer la
longevidad del proceso de [Nombre del cliente].

¿Estás seguro de que querés continuar?
[Cancelar]  [Sí, cambiar igual]
```

Si el cliente es adulto mayor (campo condicionesClinicas
contiene ADULTO_MAYOR), el mensaje agrega:
*"Para adultos mayores, la recuperación sistémica es más lenta
debido a la resistencia anabólica. Se recomienda especialmente
mantener el deload en esta población."*

---

## FUNCIONALIDAD 4 — BADGE DE LONGITUD MUSCULAR EN EJERCICIOS

**Fundamento científico:**
IUSCA: "Un programa de élite debe enfatizar el trabajo en longitudes
musculares largas (estiramiento). La evidencia demuestra que el curl
de pierna sentado supera al acostado en hipertrofia de los
isquiotibiales debido a la posición de elongación."

**Dónde vive:**
- Biblioteca de Ejercicios (panel del entrenador)
- BuscadorEjercicios (modal en constructor de planificaciones)
- Editor de ejercicio (formulario de alta/edición)

**Campo nuevo en la biblioteca:**

Al crear o editar un ejercicio, el entrenador ve un selector nuevo:

```
Posición de máximo estrés muscular   [? tooltip]

○ Longitud larga (estiramiento)   ← badge verde en buscador
  El músculo está elongado en el punto de máxima carga.
  Mayor estímulo hipertrófico según IUSCA.
  Ej: curl femoral sentado, aperturas, sentadilla profunda

○ Longitud corta (contracción)
  El músculo está contraído en el punto de máxima carga.
  Ej: curl femoral acostado, extensión de cuádriceps al final

○ Neutra
  Carga distribuida a lo largo del rango.
  Ej: press de banca, remo con barra
```

**UI en el BuscadorEjercicios:**

Cada resultado en la lista muestra un badge junto al nombre:

```
Curl femoral sentado          [LONGITUD LARGA 🟢] [Isquio] [Máquina]
Curl femoral acostado                             [Isquio] [Máquina]
Hip Thrust con barra          [LONGITUD LARGA 🟢] [Glúteo] [Barra]
Extensión de cuádriceps                           [Cuád]   [Máquina]
Sentadilla búlgara            [LONGITUD LARGA 🟢] [Cuád]   [Mancuernas]
```

Filtro adicional en el buscador:
```
[Todos] [Longitud larga ⭐] [Cuádriceps] [Glúteo] ...
```

Tooltip en el badge verde:
*"Este ejercicio trabaja el músculo en posición elongada,
lo que según el consenso IUSCA produce mayor hipertrofia
comparado con ejercicios en longitud corta."*

**Ejemplos de ejercicios pre-cargados con su clasificación:**

| Ejercicio | Músculo | Posición |
|---|---|---|
| Curl femoral sentado | Isquio | LONGITUD_LARGA |
| Curl femoral acostado | Isquio | LONGITUD_CORTA |
| Hip Thrust | Glúteo | LONGITUD_LARGA |
| Patada de glúteo en cable | Glúteo | LONGITUD_CORTA |
| Aperturas con mancuernas | Pecho | LONGITUD_LARGA |
| Press de banca | Pecho | NEUTRA |
| Sentadilla búlgara | Cuád | LONGITUD_LARGA |
| Extensión de cuádriceps | Cuád | LONGITUD_CORTA |
| Pull-over | Espalda | LONGITUD_LARGA |
| Remo con barra | Espalda | NEUTRA |
| Curl con mancuerna inclinado | Bíceps | LONGITUD_LARGA |
| Curl con barra | Bíceps | NEUTRA |

---

## FUNCIONALIDAD 5 — ALERTA DE INTERFERENCIA CARDIO-FUERZA

**Fundamento científico:**
IUSCA: "La hipertrofia no se ve comprometida por el entrenamiento
aeróbico de volumen moderado. Sin embargo, existe un riesgo de
interferencia real en la fuerza explosiva. Para minimizarlo, separar
las sesiones por al menos 6 horas o realizarlas en días distintos."
Compendio: "Las ganancias de fuerza explosiva sí pueden verse
comprometidas si cardio y fuerza se realizan en la misma sesión."

**Dónde vive:** VistaMicrociclo (editor de días de la semana)

**Trigger:** Cuando el entrenador asigna cardio + fuerza al mismo día

**UI:**

```
⚠ Cardio y fuerza en el mismo día (Lunes)

El consenso IUSCA recomienda separar el entrenamiento aeróbico
del entrenamiento de fuerza por al menos 6 horas, o realizarlos
en días distintos, para minimizar la interferencia en las
ganancias de fuerza explosiva.

La hipertrofia NO se compromete con cardio moderado, pero la
potencia y la fuerza explosiva sí pueden verse afectadas.

¿Qué querés hacer?
[Mover cardio a otro día]  [Mantener igual]
```

Si elige "Mantener igual", agrega una nota automática en la sesión:
*"Sesión con cardio combinado. Recordar: separar al menos 6hs del
trabajo de fuerza si se hace en el mismo día."*

---

## FUNCIONALIDAD 6 — BANNER DE ALERTA CLÍNICA

**Fundamento científico:**
Compendio / ACSM: Prescripción específica por condición clínica.
Cada patología tiene variables de control y precauciones distintas.

**Dónde vive:** VistaSesion (editor de sesión) + SidebarPerfil

**Trigger:** Cliente tiene alguna condición clínica en su formulario

**Lógica:**

```typescript
interface AlertaClinica {
  condicion: string
  precauciones: string[]
  variableDeControl: string
  referenciaEvidencia: string
}

const ALERTAS_CLINICAS: Record<string, AlertaClinica> = {
  HIPERTENSION: {
    condicion: 'Hipertensión arterial',
    precauciones: [
      'Prohibir la maniobra de Valsalva en ejercicios compuestos',
      'Priorizar entrenamiento dinámico controlado',
      'Evitar isometrías prolongadas de alta intensidad',
      'Monitorear signos: cefalea, mareos, visión borrosa'
    ],
    variableDeControl: 'Escala RPE + patrón respiratorio',
    referenciaEvidencia: 'ACSM Guidelines 11th ed. (2021)'
  },
  DIABETES: {
    condicion: 'Diabetes',
    precauciones: [
      'Registrar glucosa antes y después de cada sesión',
      'Verificar integridad del pie antes de entrenar',
      'Tener fuente de glucosa de rápida absorción disponible',
      'Suspender si glucosa < 100 mg/dL o > 300 mg/dL pre-ejercicio'
    ],
    variableDeControl: 'Glucosa pre/post sesión',
    referenciaEvidencia: 'ACSM Guidelines 11th ed. (2021)'
  },
  ADULTO_MAYOR: {
    condicion: 'Adulto mayor (+60 años)',
    precauciones: [
      'Evitar el fallo muscular sistémico — recuperación más lenta',
      'RIR mínimo recomendado: 2 en todos los ejercicios',
      'Priorizar funcionalidad y autonomía sobre estética',
      'Monitorear equilibrio y riesgo de caída en ejercicios de pie'
    ],
    variableDeControl: 'Densidad de carga + calidad técnica',
    referenciaEvidencia: 'Compendio IUSCA — Resistencia anabólica en adultos mayores'
  },
  CARDIOPATIA: {
    condicion: 'Patología cardíaca',
    precauciones: [
      'Requerir apto médico cardiológico actualizado',
      'Mantener FC por debajo del umbral indicado por el médico',
      'Evitar esfuerzos máximos sin supervisión médica',
      'Suspender ante dolor torácico, disnea inusual o palpitaciones'
    ],
    variableDeControl: 'Frecuencia cardíaca + escala RPE',
    referenciaEvidencia: 'ACSM Guidelines 11th ed. (2021)'
  },
  ASMA: {
    condicion: 'Asma',
    precauciones: [
      'Verificar disponibilidad del broncodilatador antes de la sesión',
      'Evitar entrenar en ambientes fríos o con alta contaminación',
      'Calentamiento gradual de al menos 10 minutos',
      'Reducir intensidad si hay síntomas respiratorios previos'
    ],
    variableDeControl: 'Escala de disnea + saturación O2',
    referenciaEvidencia: 'ACSM Guidelines 11th ed. (2021)'
  }
}
```

**UI del banner en VistaSesion:**

```
🏥 PRECAUCIONES CLÍNICAS ACTIVAS — Juan Rodríguez

  Hipertensión arterial
  → Prohibir maniobra de Valsalva
  → Monitorear RPE y patrón respiratorio
  → Evitar isometrías prolongadas

  Variable de control: Escala RPE + respiración
  Ref: ACSM Guidelines 11th ed. (2021)

  [Ver protocolo completo ↓]
```

El banner es colapsable. Al hacer clic en "Ver protocolo completo"
se expande mostrando todas las precauciones.

**En el SidebarPerfil (Tab Salud):**
Si el cliente tiene condiciones clínicas, el tab Salud muestra
un punto rojo en su ícono como indicador visual permanente.

---

## FUNCIONALIDAD 7 — VELOCÍMETRO DE SESIÓN (FATIGA SNC vs PERIFÉRICA)

**Fundamento científico:**
Compendio: "El monitoreo de la velocidad de ejecución es una
herramienta de élite para discernir entre fatiga del SNC
(incapacidad de reclutar unidades motoras de alto umbral)
y fatiga periférica (acumulación de metabolitos)."

**Dónde vive:** App del entrenado (pantalla Sesión de Hoy)
Al registrar cada serie, campo opcional:

```
Serie 3 completada: 80 kg × 8 reps  ✓

¿Cómo sentiste la velocidad del movimiento?
🟢 Normal — moví bien el peso
🟡 Lenta — costó más de lo esperado
🔴 Muy lenta — casi no pude completarla

[Omitir]
```

**Lógica de interpretación (visible para el entrenador):**

```typescript
function interpretarVelocidad(series: SerieRegistrada[]): string | null {
  const primerasSeries = series.filter(s => s.orden <= 2)
  const tieneRojoEnPrimeras = primerasSeries.some(
    s => s.velocidadPercibida === 'MUY_LENTA'
  )

  if (tieneRojoEnPrimeras) {
    return `⚠ Posible fatiga del SNC detectada en ${cliente.nombre}.
            Series iniciales con velocidad muy baja antes de la fatiga
            periférica. Considerá reducir volumen o agregar día de
            recuperación activa.`
  }
  return null
}
```

**Dónde ve el entrenador esta información:**

En la bandeja de Check-ins y en el Perfil del Cliente,
sección "Últimas sesiones", se muestra un indicador visual
por sesión:

```
Sesión del Viernes 14/06:
  Series completadas: 18/20
  Velocidad percibida:
  Ejercicio 1 (Sentadilla): 🟢🟢🟡🔴
  Ejercicio 2 (Prensa):     🟢🟢🟢🟡
  Ejercicio 3 (Hip Thrust):  🟡🟡🔴

  ⚠ Fatiga del SNC posible — revisá la carga de la semana
```

---

## FUNCIONALIDAD 8 — SELECTOR DE MODELO DE PERIODIZACIÓN

**Fundamento científico:**
Compendio: "La variación de rangos de repeticiones dentro de la
semana (periodización ondulante) es superior para estimular
diferentes tipos de fibras y evitar el estancamiento."
IUSCA: "Potenciación de bloques: un bloque de fuerza previa permite
manejar cargas absolutas más pesadas en el bloque de hipertrofia
posterior."

**Dónde vive:** VistaMacrociclo (al crear o editar un macrociclo)

**UI — Modal de creación de macrociclo:**

```
¿Qué modelo de periodización querés aplicar?

○ LINEAL
  Progresión gradual semana a semana en la misma zona de carga.
  Ideal para: principiantes e intermedios con poco tiempo
  de entrenamiento estructurado.
  Ej: Semana 1 = 12 reps / Semana 2 = 10 reps / Semana 3 = 8 reps

○ ONDULANTE ⭐ (recomendada por IUSCA para intermedios/avanzados)
  Variación de rangos de carga dentro de la misma semana.
  Estimula diferentes tipos de fibras musculares.
  Ej: Lunes = 5 reps (fuerza) / Miércoles = 10 reps (hipertrofia)
      / Viernes = 15 reps (resistencia)

○ CONJUGADA
  Trabajo simultáneo de múltiples cualidades (fuerza, hipertrofia,
  potencia) en la misma semana con ejercicios diferenciados.
  Ideal para: atletas avanzados con alta capacidad de recuperación.

○ PERSONALIZADO
  Definir manualmente la estructura sin sugerencias del sistema.
```

**Si elige ONDULANTE, el sistema pre-configura las sesiones:**

Al crear el microciclo de cada semana, los días activos
se pre-configuran automáticamente con zonas de carga distintas:

```
Sesión A (ej: Lunes):    zona FUERZA     → reps 4-6, RIR 1-2
Sesión B (ej: Miércoles): zona HIPERTROFIA → reps 8-12, RIR 2-3
Sesión C (ej: Viernes):  zona RESISTENCIA → reps 15-20, RIR 3-4
```

El entrenador puede editar individualmente cada sesión.
Los rangos son sugerencias, no restricciones.

**Si elige BLOQUES (sugerencia adicional en macrociclo de 3+ meses):**

```
¿Querés aplicar potenciación de bloques?
(recomendado para planes de 3 meses o más)

Mes 1: FUERZA BASE
  Objetivo: elevar el 1RM para potenciar el bloque de hipertrofia.
  Reps: 3-6 / Intensidad: 80-90% 1RM

Mes 2: HIPERTROFIA
  Objetivo: maximizar la síntesis proteica con mayor carga absoluta.
  Reps: 8-12 / RIR: 2-3

Mes 3: ESPECIALIZACIÓN + DELOAD
  Objetivo: consolidar ganancias y recuperar tejido conectivo.

[Usar esta estructura] [Personalizar manualmente]
```

---

## FUNCIONALIDAD 9 — MÓDULO DE POBLACIONES ESPECIALES

**Fundamento científico:**
Compendio Praxis de Élite — Sección 6: Prescripción Clínica.
Tabla de prescripción por población.

**Dónde vive:**
- SidebarPerfil (Tab Salud — expandido)
- Constructor de planificaciones (lógica de restricciones)
- App del entrenado (campos adicionales en check-in)

### 9A — Mujeres con ciclo menstrual activo

(Amplía y formaliza lo ya especificado en el prompt del constructor)

**Tabla de prescripción por fase (mostrada en el sidebar):**

| Fase | Volumen | Intensidad | RIR sugerido | Estrategia |
|---|---|---|---|---|
| Menstrual | Bajo | Bajo | 4-5 | Autoregulación total |
| Folicular | Alto | Alto | 2-3 | Progresar — mayor tolerancia |
| Ovulación | Medio | Muy alto | 1-2 | Pico de fuerza |
| Lútea | Medio | Medio | 3-4 | Sostener — temperatura elevada |

En la fase lútea el sistema sugiere automáticamente subir el RIR
de las sesiones +1 respecto al valor del mesociclo:
*"Fase lútea detectada. El aumento de temperatura corporal y la
fatiga pueden exigir mayor recuperación. Se sugiere aumentar el
RIR en 1 unidad esta semana."*

### 9B — Adultos mayores (+60 años)

Restricciones automáticas cuando condicionesClinicas
incluye ADULTO_MAYOR:

1. **RIR mínimo forzado:** Al crear sesiones, el sistema no permite
   valores de RIR menores a 2 sin confirmación explícita.
   Mensaje: *"Para adultos mayores, la recuperación sistémica es
   más lenta. El consenso recomienda RIR ≥ 2 para preservar la
   longevidad del proceso."*

2. **Periodización sugerida:** El sistema recomienda LINEAL como
   modelo de periodización por defecto para esta población.

3. **Enfoque comunicado al cliente en la app:**
   En la pantalla "Mi Plan" del entrenado mayor de 60 años,
   el objetivo del plan se muestra con lenguaje orientado a
   funcionalidad y autonomía, no a estética.

### 9C — Diabetes

Campo adicional en el check-in semanal del cliente:

```
REGISTRO GLUCÉMICO

Glucosa antes de la última sesión:  [___] mg/dL
Glucosa después de la última sesión: [___] mg/dL

¿Tuviste algún episodio de hipoglucemia esta semana? ○ Sí  ○ No
```

Si el cliente reporta un episodio de hipoglucemia, el entrenador
recibe una notificación inmediata marcada como urgente.

### 9D — Hipertensión

Campo adicional en el check-in semanal del cliente:

```
¿Tomaste tu medicación antes de entrenar esta semana? ○ Sí  ○ No  ○ No aplica
¿Tuviste síntomas durante el entrenamiento (cefalea, mareos, visión borrosa)? ○ Sí  ○ No
```

Si reporta síntomas, el entrenador recibe notificación urgente
y el sistema sugiere reducir la intensidad la semana siguiente.

---

## FUNCIONALIDAD 10 — PERFIL DE RESPUESTA AL ENTRENAMIENTO

**Fundamento científico:**
Compendio: "Variantes genéticas como el polimorfismo en el gen GLI3
diferencian la capacidad de hipertrofia entre individuos. Esto explica
por qué algunos atletas responden de forma masiva y otros mínimamente
ante el mismo estímulo."

**Dónde vive:**
- Perfil del cliente (panel entrenador)
- Dashboard (card por cliente)

**Trigger:** Se activa automáticamente a las 8 semanas del inicio
del plan (después del primer mesociclo completo).

**Notificación al entrenador:**

```
📊 Evaluación de respuesta disponible — Juan Rodríguez

Han transcurrido 8 semanas del primer mesociclo.
Es el momento óptimo para evaluar la respuesta individual
al entrenamiento y ajustar la programación si es necesario.

¿Cómo calificarías la respuesta de Juan al programa?

○ Alta respuesta
  Supera las ganancias proyectadas en fuerza y/o composición.

○ Respuesta normal
  Progresión dentro de lo esperado para su perfil y nivel.

○ Baja respuesta
  Por debajo de lo proyectado sin causa aparente externa.

Nota: La variabilidad genética individual explica hasta el 50%
de las diferencias en respuesta. Una baja respuesta NO implica
error en la programación antes de ajustar el volumen o frecuencia.
(Compendio IUSCA — Responders vs Non-Responders)

[Evaluar ahora]  [Recordar en 1 semana]
```

**En el perfil del cliente:**

```
Perfil de respuesta al entrenamiento
Evaluado el: 15/06/2025 · Semana 8

● Respuesta normal
  "Progresión estable en todos los grupos musculares principales.
  Fuerza relativa en sentadilla +12% respecto a testeo inicial."

[Actualizar evaluación]
```

**En el Dashboard del entrenador:**

Badge de color en la card del cliente:
- Verde: alta respuesta
- Gris: respuesta normal
- Amarillo: baja respuesta (requiere revisión)

---

## FUNCIONALIDAD 11 — RECOMENDADOR DE CARGA POR 1RM ESTIMADO

**Fundamento científico:**
IUSCA: "El umbral inferior crítico es del 20% 1RM.
Cargas del 20% 1RM resultan subóptimas comparadas con cargas
≥40% 1RM. La hipertrofia es notable en un espectro de 1 a 30+
repeticiones siempre que el esfuerzo sea alto."

**Fórmula utilizada:** Epley (1985)
`1RM = peso × (1 + reps/30)`

**Dónde vive:**
- Semana de testeo (VistaSesion)
- Editor de ejercicios en el constructor (campo peso sugerido)

**Flujo de la semana de testeo:**

La Semana 5 (testeo) ya existe en el constructor. Ahora al
registrar los resultados del 1×1, el sistema calcula y guarda
el 1RM estimado por ejercicio:

```
TESTEO — Sentadilla libre

Serie de testeo: [95] kg × [3] reps
→ 1RM estimado: 104,5 kg

[Confirmar y guardar]
```

**Uso del 1RM en el siguiente mesociclo:**

Al crear las sesiones del Mes 2, el campo "Peso sugerido"
de cada ejercicio se pre-carga automáticamente según el rango
de reps objetivo:

```
Sentadilla libre — Mes 2 (Hipertrofia)
1RM registrado: 104,5 kg (testeo semana 5)

Rango de reps programado: 8-10
Peso sugerido: 73-78 kg (70-75% 1RM)  ← calculado automáticamente

[Usar sugerencia: 75 kg]  [Ingresar manualmente]
```

**Actualización dinámica del 1RM:**

Si el cliente registra en su sesión un peso superior al peso
sugerido completando todas las reps con RIR ≥ 1, el sistema
recalcula el 1RM estimado y notifica al entrenador:

```
📈 Nuevo récord detectado — Juan Rodríguez

Sentadilla libre: 82 kg × 10 reps (era 75 kg sugerido)
→ 1RM estimado actualizado: 109,3 kg (era 104,5 kg)

¿Querés actualizar el peso sugerido para las próximas sesiones?
[Sí, actualizar]  [Mantener actual]
```

---

## FUNCIONALIDAD 12 — DETECTOR DE ESTANCAMIENTO

**Fundamento científico:**
IUSCA: "La rotación de ejercicios es una necesidad fisiológica
para un desarrollo axial completo. La variedad aborda la
heterogeneidad de la activación muscular."
Compendio: "La variación de rangos de repeticiones es superior
para estimular diferentes tipos de fibras y evitar el estancamiento."

**Lógica de detección:**

```typescript
// src/nucleo/planificacion/estancamiento.servicio.ts

async function detectarEstancamiento(clienteId: string): Promise<AlertaEstancamiento[]> {
  // Para cada ejercicio clave del cliente (compuestos principales):
  // 1. Obtener las últimas 3 sesiones registradas
  // 2. Comparar: peso × reps (tonelaje) en cada sesión
  // 3. Si tonelaje no aumentó en 3 sesiones consecutivas → alerta
  // 4. Si RIR declarado fue ≤ 2 en esas sesiones (esfuerzo genuino) → alerta real
  //    Si RIR fue ≥ 3 (bajo esfuerzo) → no es estancamiento real

  // Guardar en AlertaEstancamiento
  // Notificar al entrenador
}
```

**Job automático:** Ejecutar esta función cada vez que
se registra una sesión completada.

**Notificación al entrenador:**

```
⚠ Posible estancamiento detectado

Cliente: Juan Rodríguez
Ejercicio: Sentadilla libre
Situación: Sin progreso en 3 semanas consecutivas
  Semana 4: 80 kg × 8 reps (RIR 2)
  Semana 5: 80 kg × 8 reps (RIR 2)
  Semana 6: 80 kg × 8 reps (RIR 2)

Causas posibles según evidencia:
→ Adaptación al estímulo — considerá rotar la variante del ejercicio
→ Verificar volumen semanal de cuádriceps (actualmente: 9 series ⚠)
→ Revisar check-ins de las últimas 3 semanas (sueño, adherencia)
→ Posible responder individual con curva lenta de adaptación

[Ver historial completo]  [Ajustar programa]  [Marcar como revisada]
```

---

## FUNCIONALIDAD 13 — DASHBOARD DE ADHERENCIA PSICOLÓGICA

**Fundamento científico:**
Compendio: "La estructura del éxito profesional del entrenador
tiene como pilar dominante (50%) las habilidades psicológicas y
la gestión de la adherencia. Sin un marco que garantice la
adherencia, el rigor fisiológico pierde su aplicabilidad."

**Dónde vive:** Dashboard del entrenador (sección nueva)

**Cálculo de adherencia:**

```typescript
function calcularAdherencia(clienteId: string, semanas: number = 4): number {
  // sesionesPlanificadas: suma de días activos en las últimas N semanas
  // sesionesCompletadas: sesiones marcadas como completadas por el cliente
  // adherencia = sesionesCompletadas / sesionesPlanificadas * 100
}
```

**UI en el Dashboard:**

```
ADHERENCIA — Últimas 4 semanas        [Ver detalle]

Juan Rodríguez     ████████████  94%  ✓ excelente
María López        ████████░░░░  67%  ⚠ en riesgo
Carlos Sosa        ██████████░░  83%  ✓ buena
Ana Martínez       ████░░░░░░░░  40%  🚨 abandono inminente

```

Umbrales:
- ≥ 85%: verde, "Excelente"
- 70-84%: amarillo suave, "Buena"
- 50-69%: amarillo, "En riesgo" → alerta al entrenador
- < 50%: rojo, "Abandono inminente" → alerta urgente

**Alerta automática:**

Si la adherencia de un cliente cae por debajo del 70%
durante 2 semanas consecutivas, el entrenador recibe
una notificación push (o email si no tiene push activo):

```
🚨 Riesgo de abandono — María López

Adherencia de las últimas 2 semanas: 58% y 61%
Solo completó 4 de 6 sesiones planificadas.

Acción sugerida: contactar al cliente esta semana
para identificar la causa y ajustar si es necesario.

[Enviar mensaje]  [Ver perfil]
```

---

## FUNCIONALIDAD 14 — GLOSARIO CIENTÍFICO PARA EL ENTRENADO

**Fundamento científico:**
Compendio: "La comunicación de alta consultoría implica traducir
conceptos como la miofibrillogenesis en estrategias de ROI para
el cliente, evitando jerga innecesaria pero manteniendo la
precisión técnica."

**Dónde vive:** App del entrenado — cualquier pantalla

**Implementación:**

Cualquier término técnico en la app del entrenado está
subrayado con un punto de color. Al tocarlo se abre un
tooltip o modal con la explicación:

```typescript
const GLOSARIO: Record<string, { simple: string; tecnico: string }> = {
  RIR: {
    simple: "Repeticiones que te quedan en el tanque antes de no poder más.",
    tecnico: "Repeticiones en Reserva. RIR 2 = podrías hacer 2 reps más. La escala va de RIR 0 (fallo total) a RIR 4+ (esfuerzo moderado). Según la IUSCA, entrenar en RIR 2-3 es la zona más productiva para ganar músculo."
  },
  DELOAD: {
    simple: "Semana de recuperación programada. No es flojera — es parte del plan.",
    tecnico: "Fase de descarga donde se reduce el volumen y la intensidad al 40-60% del pico. El consenso IUSCA establece que son fases de resíntesis necesarias para la salud del tejido conectivo."
  },
  MESOCICLO: {
    simple: "Un bloque de 4-5 semanas con un objetivo específico (ganar fuerza, ganar músculo, etc.).",
    tecnico: "Unidad de programación de mediano plazo. Se compone de microciclos semanales y termina típicamente con una semana de deload o testeo."
  },
  TONELAJE: {
    simple: "El total de peso levantado en la sesión. Series × Reps × Peso.",
    tecnico: "Indicador de volumen de carga. Permite comparar el trabajo total entre sesiones independientemente del rango de repeticiones utilizado."
  },
  PERIODIZACION_ONDULANTE: {
    simple: "Cada día de entrenamiento tiene un objetivo diferente: fuerza, músculo o resistencia.",
    tecnico: "Modelo de periodización donde los rangos de carga varían dentro de la misma semana. Según el Compendio IUSCA, es superior a la periodización lineal para estimular diferentes tipos de fibras musculares."
  },
  RPE: {
    simple: "Escala del 1 al 10 de qué tan duro se siente el ejercicio. 10 = máximo esfuerzo.",
    tecnico: "Rating of Perceived Exertion. Escala de Borg modificada. Complementaria al RIR para monitorear la intensidad del entrenamiento."
  },
  HIPERTROFIA: {
    simple: "El proceso de hacer crecer el músculo.",
    tecnico: "Incremento en el área de sección transversal de la fibra muscular. Resulta principalmente de la miofibrilogénesis: creación de nuevas miofibrillas que se añaden en paralelo, aumentando la capacidad de generar tensión mecánica (IUSCA)."
  },
  FUERZA_RELATIVA: {
    simple: "Qué tan fuerte sos en relación a tu peso corporal.",
    tecnico: "Cociente entre la fuerza máxima (1RM) y el peso corporal. Se utiliza en la semana de testeo para medir el progreso independientemente de cambios en la composición corporal."
  }
}
```

---

## ENDPOINTS NUEVOS REQUERIDOS

```
// Volumen
GET  /api/planificacion/semana/[id]/volumen
     → VolumenPorMusculo[]

// Perfil intensidad
GET  /api/planificacion/sesion/[id]/perfil-intensidad
     → PerfilIntensidadSesion

// 1RM
POST /api/planificacion/ejercicio/[id]/1rm
     → guarda 1RM estimado
GET  /api/planificacion/cliente/[id]/1rm
     → todos los 1RM del cliente por ejercicio

// Estancamiento
GET  /api/alertas/estancamiento/[clienteId]
     → AlertaEstancamiento[]
PUT  /api/alertas/estancamiento/[id]/revisada
     → marca como revisada

// Adherencia
GET  /api/clientes/[id]/adherencia?semanas=4
     → RegistroAdherencia[]
GET  /api/entrenador/adherencia-general
     → adherencia de todos los clientes

// Perfil respuesta
PUT  /api/clientes/[id]/perfil-respuesta
     → guarda NivelRespuesta
```

---

## JOBS AUTOMÁTICOS (CRON)

```typescript
// src/nucleo/jobs/

// Cada vez que se completa una sesión:
→ recalcularVolumenSemanal(semanaId)
→ detectarEstancamiento(clienteId)
→ actualizarAdherencia(clienteId, semanaId)
→ detectarVelocidadSNC(sesionId)

// Diariamente a las 08:00:
→ alertasVencimientoPlanes()
→ alertasInactividad()    // ya existente
→ alertasAdherenciaBaja()  // nueva

// Semanalmente (lunes):
→ evaluacionRespuesta8Semanas()
→ actualizarFaseCicloMenstrual()
```

---

## CRITERIOS DE COMPLETITUD

Esta capa científica está implementada correctamente cuando:

- [ ] El validador de volumen se recalcula en tiempo real al
      editar ejercicios y muestra el semáforo por grupo muscular
- [ ] El perfil de intensidad RIR aparece en el editor de sesión
      y genera advertencias cuando el fallo está en multiarticulares
- [ ] La Semana 4 de cada mesociclo se crea como DELOAD por defecto
      con confirmación para cambiarla
- [ ] Los badges de longitud muscular están en la biblioteca y
      en el buscador, con el filtro "Longitud larga ⭐" operativo
- [ ] La alerta de interferencia cardio-fuerza se dispara al
      combinar ambos en el mismo día del microciclo
- [ ] El banner clínico aparece en VistaSesion para cada condición
      con sus precauciones específicas y referencia ACSM/IUSCA
- [ ] El velocímetro de sesión está en la app del entrenado
      y el entrenador ve el reporte en el perfil del cliente
- [ ] El selector de periodización está al crear el macrociclo
      y la estructura ONDULANTE pre-configura zonas por sesión
- [ ] El módulo de poblaciones especiales agrega campos al check-in
      según la condición clínica del cliente
- [ ] La evaluación de perfil de respuesta se dispara a las 8 semanas
- [ ] El recomendador de 1RM usa la fórmula de Epley y pre-carga
      el peso sugerido en las sesiones del siguiente mesociclo
- [ ] El detector de estancamiento corre automáticamente al
      completar una sesión y notifica al entrenador
- [ ] El dashboard de adherencia muestra el % de los últimos
      30 días y dispara alertas al caer bajo 70% por 2 semanas
- [ ] El glosario está disponible en toda la app del entrenado
      con términos diferenciados por nivel (simple / técnico)
- [ ] Todos los tooltips en la UI del entrenador referencian
      correctamente la fuente científica (IUSCA / ACSM)
- [ ] Los jobs automáticos corren sin afectar el rendimiento
      de la interfaz principal

---

## REFERENCIA BIBLIOGRÁFICA PARA TOOLTIPS

Usar estas referencias en los tooltips de la UI del entrenador:

**IUSCA Position Stand:**
Schoenfeld, B. J., Fisher, J. P., Grgic, J., Haun, C. T., Helms, E. R.,
Phillips, S. M., Steele, J., & Vigotsky, A. D. (2021).
Resistance Training Recommendations to Maximize Muscle Hypertrophy
in an Athletic Population. International Journal of Strength and
Conditioning, 1(1).

**ACSM Guidelines:**
American College of Sports Medicine (2021).
ACSM's Guidelines for Exercise Testing and Prescription (11th ed.).
Wolters Kluwer.

**Fórmula 1RM:**
Epley, B. (1985). Poundage Chart. Boyd Epley Workout.
University of Nebraska.

---

*Capa Científica IL-Campus v1.0*
*Fuentes: IUSCA Position Stand 2021 + Compendio Praxis de Élite*
*16 funcionalidades basadas en evidencia científica de primera calidad*
