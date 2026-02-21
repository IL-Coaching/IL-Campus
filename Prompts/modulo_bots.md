# MÓDULO DE EXTENSIÓN: BOTS
# Compatible con: Discord, Telegram, WhatsApp (WhatsApp Business API / Baileys)
# Se usa junto al Prompt Maestro ArchSecure AI

---

## CONTEXTO DE MÓDULO

Cuando el proyecto es un bot, el Prompt Maestro se extiende con este módulo.
La arquitectura event-driven, el manejo de estado conversacional y la seguridad
de plataformas de terceros tienen reglas propias que este módulo define.

---

## ARQUITECTURA ESTÁNDAR PARA BOTS

```
/
├── /src
│   ├── /bot
│   │   ├── /comandos          # Handlers de comandos explícitos (!comando, /comando)
│   │   ├── /eventos           # Listeners de eventos de la plataforma
│   │   ├── /flujos            # Conversaciones multi-paso (wizards / escenas)
│   │   ├── /middlewares       # Rate limiting, autenticación, logging de interacciones
│   │   └── cliente.ts         # Inicialización y configuración del cliente del bot
│   │
│   ├── /nucleo                # Lógica de negocio pura (sin dependencia de la plataforma)
│   ├── /estado                # Manejo de estado conversacional (sesiones, contexto)
│   │   ├── sesion.servicio.ts
│   │   └── contexto.tipos.ts
│   │
│   └── /adaptadores           # Capa de abstracción por plataforma
│       ├── discord.adaptador.ts
│       ├── telegram.adaptador.ts
│       └── whatsapp.adaptador.ts
```

> **Principio clave:** La lógica de negocio en `/nucleo` nunca importa nada de `/bot`.
> Esto permite cambiar de plataforma sin reescribir la lógica principal.

---

## PATRONES OBLIGATORIOS

### Webhook vs Polling — Decisión documentada

Al iniciar cualquier proyecto de bot, documentás en `docs/arquitectura.md`:

```
MODO DE CONEXIÓN: [Webhook / Long Polling]
Justificación: [por qué se eligió este modo]
Implicaciones de seguridad: [validación de payloads, exposición de endpoint, etc.]
```

**Regla general:**
- **Producción** → Webhook (más eficiente, requiere HTTPS y validación de firma)
- **Desarrollo local** → Long Polling (sin infraestructura adicional)

### Manejo de Estado Conversacional

Los bots tienen estado. Nunca usés variables globales para guardarlo.

```typescript
// ❌ MAL — estado global, no escala, no es seguro
let esperandoRespuesta = false;

// ✅ BIEN — estado por sesión de usuario
interface SesionUsuario {
  usuarioId: string;
  flujoActivo: string | null;
  paso: number;
  datos: Record<string, unknown>;
  expiraEn: Date;
}
```

**Almacenamiento de estado según escala:**
- Bot simple / desarrollo → En memoria (Map con TTL)
- Producción / múltiples instancias → Redis con expiración automática

### Estructura de un Comando

```typescript
/**
 * Comando: [nombre]
 * Descripción: [qué hace]
 * Plataformas: [Discord / Telegram / WhatsApp]
 * Permisos requeridos: [ninguno / usuario registrado / administrador]
 */
export const comandoEjemplo = {
  nombre: 'ejemplo',
  descripcion: 'Descripción visible para el usuario',
  async ejecutar(contexto: ContextoComando): Promise<void> {
    // Validar permisos primero
    // Ejecutar lógica de negocio desde /nucleo
    // Responder al usuario
    // Registrar en logs
  }
};
```

---

## SEGURIDAD ESPECÍFICA DE BOTS

### Validación de Payload (Webhooks)

Todo webhook debe verificar que el mensaje viene realmente de la plataforma:

```typescript
// Telegram — verificación de firma HMAC
function verificarWebhookTelegram(cuerpo: string, firma: string): boolean {
  const secreto = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN!)
    .digest();
  const firmaEsperada = crypto
    .createHmac('sha256', secreto)
    .update(cuerpo)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(firma),
    Buffer.from(firmaEsperada)
  );
}

// Discord — verificación con Ed25519
// WhatsApp Business API — verificación con x-hub-signature-256
```

> ⚠️ Sin esta verificación, cualquiera puede enviar requests falsos a tu webhook.

### Protección contra Abuso

Todo bot en producción debe tener:

```typescript
// Rate limiting por usuario
const limitePorUsuario = {
  ventana: 60,        // segundos
  maxMensajes: 20,    // mensajes por ventana
  accion: 'silenciar' // ignorar | advertir | banear temporalmente
};

// Lista de usuarios bloqueados (persistente)
// Sanitización de inputs antes de procesar
// Timeout en flujos conversacionales abiertos (máx 10 minutos de inactividad)
```

### Gestión Segura de Tokens

```
# .env — NUNCA en el código fuente
DISCORD_TOKEN=
TELEGRAM_BOT_TOKEN=
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=

# Rotación: documentar en docs/seguridad.md cuándo rotar tokens
# Principio de mínimo privilegio: el bot solo tiene los permisos que necesita
```

---

## MANEJO DE ERRORES EN BOTS

Los errores en bots son silenciosos por defecto. Eso es peligroso.

```typescript
// ✅ Patrón obligatorio para handlers de eventos
cliente.on('mensaje', async (mensaje) => {
  try {
    await procesarMensaje(mensaje);
  } catch (error) {
    // 1. Log estructurado con contexto completo
    logger.error('Error procesando mensaje', {
      usuarioId: mensaje.autor.id,
      contenido: mensaje.contenido.substring(0, 50), // no loguear contenido completo
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
    // 2. Notificar al usuario (nunca exponer el error interno)
    await mensaje.responder('Ocurrió un error procesando tu solicitud. Por favor intentá de nuevo.');
    // 3. Alertar al canal de monitoreo si es crítico
  }
});
```

---

## LOGGING DE INTERACCIONES

```typescript
// Cada interacción queda registrada (sin datos sensibles)
interface LogInteraccion {
  timestamp: string;
  plataforma: 'discord' | 'telegram' | 'whatsapp';
  usuarioId: string;       // hasheado si la plataforma lo requiere por privacidad
  comando: string;
  exito: boolean;
  duracionMs: number;
}
```

---

## CHECKLIST ESPECÍFICO DE BOTS

Antes de considerar el bot listo para producción:

- [ ] Validación de firma de webhook implementada
- [ ] Rate limiting por usuario configurado
- [ ] Tokens en variables de entorno, nunca en código
- [ ] Estado conversacional con TTL/expiración
- [ ] Manejo de errores en todos los event handlers
- [ ] Logs estructurados de interacciones
- [ ] El bot tiene solo los permisos mínimos necesarios en la plataforma
- [ ] Flujos conversacionales con timeout de inactividad
- [ ] Respuestas de error amigables que no exponen internos
- [ ] Adaptador de plataforma separado de la lógica de negocio
