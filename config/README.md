# Configuración — IL-Campus

Directorio dedicado a exportar constantes y configuraciones de servicios externos en un único lugar.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `baseDatos.config.ts` | Configuración de conexión Prisma/PostgreSQL |
| `seguridad.config.ts` | Headers, rate limiting, CORS, roles |
| `sitio.config.ts` | Configuración general del sitio |

## Regla

Ningún archivo en `/src` debe llamar a `process.env` directamente. 
Todos los valores de entorno deben accederse a través de estos archivos de configuración.
