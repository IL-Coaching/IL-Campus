# MÓDULO DE EXTENSIÓN: AUTOMATIZACIONES Y SCRIPTS
# Compatible con: Node.js, Python, tareas programadas, procesos desatendidos
# Se usa junto al Prompt Maestro ArchSecure AI

---

## CONTEXTO DE MÓDULO

Las automatizaciones y scripts tienen necesidades radicalmente distintas a una app web.
Corren desatendidos, fallan en silencio, y su estado es difícil de inspeccionar.
Este módulo define los patrones para que eso no sea un problema.

---

## ARQUITECTURA ESTÁNDAR PARA AUTOMATIZACIONES

```
/
├── /scripts
│   ├── /trabajos              # Jobs programados (cron, schedulers)
│   │   └── [nombre].trabajo.ts
│   ├── /tareas                # Unidades atómicas de trabajo reutilizables
│   │   └── [nombre].tarea.ts
│   ├── /adaptadores           # Conexión con servicios externos (APIs, DBs, archivos)
│   │   └── [servicio].adaptador.ts
│   ├── /utilidades
│   │   ├── logger.ts          # Logger estructurado obligatorio
│   │   ├── reintentos.ts      # Lógica de retry con backoff exponencial
│   │   └── notificador.ts     # Alertas en caso de fallo crítico
│   └── ejecutor.ts            # Punto de entrada con manejo global de errores
│
├── /logs                      # Logs persistentes (excluir del repo con .gitignore)
├── /estado                    # Estado persistente entre ejecuciones (si aplica)
└── docs/
    └── automatizaciones.md    # Qué hace cada script, cuándo corre, quién lo mantiene
```

---

## PRINCIPIOS CRÍTICOS

### 1. Idempotencia — El principio más importante

Un script bien escrito puede ejecutarse 10 veces seguidas y producir el mismo resultado.

```typescript
// ❌ MAL — no es idempotente, duplica datos si corre dos veces
async function sincronizarUsuarios() {
  const usuarios = await obtenerUsuariosExternos();
  await baseDatos.insertar(usuarios); // falla si ya existen
}

// ✅ BIEN — idempotente, seguro de re-ejecutar
async function sincronizarUsuarios() {
  const usuarios = await obtenerUsuariosExternos();
  await baseDatos.upsert(usuarios, { conflicto: 'usuarioId' }); // inserta o actualiza
}
```

> **Regla:** Siempre preguntarse: "¿qué pasa si este script corre dos veces seguidas?"

### 2. Fallos Ruidosos, no Silenciosos

```typescript
// ❌ MAL — falla en silencio, nadie se entera
try {
  await procesarLote();
} catch (error) {
  console.error(error); // nadie lo ve a las 3am
}

// ✅ BIEN — falla con ruido, alerta al equipo
try {
  await procesarLote();
} catch (error) {
  logger.error('Fallo crítico en procesarLote', { error, timestamp: new Date() });
  await notificador.alertar({
    canal: 'slack' | 'email' | 'telegram',
    mensaje: `🚨 Script falló: procesarLote — ${error.message}`,
    urgencia: 'alta'
  });
  process.exit(1); // salir con código de error para que el scheduler lo detecte
}
```

### 3. Logging Estructurado Obligatorio

```typescript
// Nunca usar console.log en scripts de producción
// ✅ Logger estructurado (compatible con herramientas de monitoreo)
logger.info('Inicio de sincronización', {
  script: 'sincronizarUsuarios',
  timestamp: new Date().toISOString(),
  entorno: process.env.NODE_ENV
});

logger.info('Lote procesado', {
  procesados: 150,
  fallidos: 2,
  duracionMs: 1240
});

logger.error('Error en registro', {
  registroId: '123',
  motivo: error.message,
  reintento: 2
});
```

---

## PATRONES OBLIGATORIOS

### Reintentos con Backoff Exponencial

```typescript
/**
 * Ejecuta una función con reintentos automáticos.
 * Espera aumenta exponencialmente para no saturar el servicio externo.
 */
async function conReintentos<T>(
  fn: () => Promise<T>,
  opciones = { maxIntentos: 3, baseMs: 1000 }
): Promise<T> {
  for (let intento = 1; intento <= opciones.maxIntentos; intento++) {
    try {
      return await fn();
    } catch (error) {
      if (intento === opciones.maxIntentos) throw error;
      const espera = opciones.baseMs * Math.pow(2, intento - 1);
      logger.warn(`Intento ${intento} fallido, reintentando en ${espera}ms`);
      await new Promise(r => setTimeout(r, espera));
    }
  }
  throw new Error('No debería llegar aquí');
}

// Uso
const datos = await conReintentos(() => api.obtenerDatos());
```

### Procesamiento en Lotes con Control de Concurrencia

```typescript
/**
 * Procesa un array en lotes para no saturar la memoria ni los servicios externos.
 * @param items - Lista completa a procesar
 * @param tamanioLote - Cuántos procesar a la vez (default: 50)
 * @param concurrencia - Cuántos lotes en paralelo (default: 3)
 */
async function procesarEnLotes<T>(
  items: T[],
  procesador: (item: T) => Promise<void>,
  tamanioLote = 50,
  concurrencia = 3
): Promise<void> {
  const lotes = chunk(items, tamanioLote);
  for (const grupoDeLotes of chunk(lotes, concurrencia)) {
    await Promise.all(grupoDeLotes.map(lote =>
      Promise.all(lote.map(procesador))
    ));
    logger.info(`Lote completado`, { progreso: `${lotes.indexOf(grupoDeLotes[0]) + 1}/${lotes.length}` });
  }
}
```

### Jobs Programados (Cron)

```typescript
/**
 * Trabajo programado: [descripción]
 * Frecuencia: [expresión cron — ej: "0 2 * * *" = todos los días a las 2am]
 * Duración estimada: [X minutos]
 * Dependencias: [servicios externos que necesita]
 * Responsable: [quién mantiene este job]
 */
export const trabajoSincronizacion = {
  nombre: 'sincronizacion-diaria',
  cron: '0 2 * * *',
  async ejecutar(): Promise<void> {
    const inicio = Date.now();
    logger.info('Job iniciado', { job: this.nombre });
    try {
      await procesarLote();
      logger.info('Job completado', {
        job: this.nombre,
        duracionMs: Date.now() - inicio
      });
    } catch (error) {
      // Notificar + registrar + salir con error
    }
  }
};
```

---

## SEGURIDAD EN AUTOMATIZACIONES

### Credenciales y Secretos

```bash
# ✅ Siempre desde variables de entorno
DATABASE_URL=
API_KEY_SERVICIO_EXTERNO=
SLACK_WEBHOOK_URL=

# ✅ Validar que existen antes de ejecutar
function validarEntorno(): void {
  const requeridas = ['DATABASE_URL', 'API_KEY_SERVICIO_EXTERNO'];
  const faltantes = requeridas.filter(k => !process.env[k]);
  if (faltantes.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${faltantes.join(', ')}`);
  }
}
```

### Principio de Mínimo Privilegio

El script de base de datos tiene acceso de solo lectura si solo lee. El script de sincronización solo accede al endpoint que necesita. Nunca usar credenciales de administrador en scripts automatizados.

### Sanitización de Inputs Externos

```typescript
// Todo dato que viene de fuera (archivos, APIs externas, argumentos CLI)
// se valida antes de usarse

import { z } from 'zod';

const esquemaRegistroExterno = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string().max(100)
});

const registroValidado = esquemaRegistroExterno.parse(datoCrudo);
```

---

## DOCUMENTACIÓN OBLIGATORIA EN `docs/automatizaciones.md`

Para cada script o job en el proyecto:

```markdown
## [Nombre del Script]

| Campo | Valor |
|---|---|
| Archivo | `/scripts/trabajos/nombre.trabajo.ts` |
| Frecuencia | Diario a las 2am / Manual / Trigger por evento |
| Duración estimada | ~5 minutos |
| Dependencias externas | API de pagos, base de datos principal |
| Responsable | [nombre o equipo] |
| Última revisión | [fecha] |

**Qué hace:** [descripción en 2-3 líneas]
**Cómo ejecutar manualmente:** `npm run script:nombre`
**Cómo monitorear:** [link al dashboard / canal de alertas]
**Qué hacer si falla:** [pasos concretos]
```

---

## CHECKLIST ESPECÍFICO DE AUTOMATIZACIONES

- [ ] Cada script es idempotente (seguro de re-ejecutar)
- [ ] Fallos críticos notifican al equipo (no solo loguean)
- [ ] Logger estructurado implementado (sin console.log sueltos)
- [ ] Reintentos con backoff en llamadas a servicios externos
- [ ] Credenciales en variables de entorno con validación al inicio
- [ ] Procesamiento en lotes para datasets grandes
- [ ] Jobs documentados en `docs/automatizaciones.md`
- [ ] El proceso sale con código de error (exit 1) cuando falla
- [ ] Timeout configurado para operaciones externas
- [ ] Principio de mínimo privilegio aplicado a credenciales
