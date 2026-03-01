# IL-Campus

Plataforma integral para IL-Coaching - Sistema de gestión de coaching fitness.

## 🚀 Nuevas Funcionalidades

- **Chat en Tiempo Real**: Mensajería instantánea con Supabase Realtime
- **Exportación a PDF**: Descarga rutinas en formato PDF
- **Gamificación**: Sistema de logros, XP y rachas
- **Recordatorios Automáticos**: Emails programados para check-ins y renovaciones

## 📋 Instalación rápida (en menos de 30 minutos)

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar las variables.
3. Instalar dependencias: `npm install`
4. Ejecutar migraciones: `npx prisma db push` o `npx prisma migrate dev`
5. Levantar el entorno local: `npm run dev`

## 🛠️ Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Calidad
npm run lint        # ESLint
npm run typecheck   # TypeScript

# Tests
npm run test        # Todos
npm run test:unit   # Unitarios
npm run test:integracion  # Integración
```

## 📁 Estructura

Ver `/docs/arquitectura.md` para las justificaciones de la arquitectura del proyecto.
El proyecto está completamente en idioma ESPAÑOL.

## 🔧 Configuración de Nuevas Features

### Chat Real-time
1. Ir a Supabase Dashboard → Database → Replication
2. Añadir tabla `mensajes` a `supabase_realtime`

### Recordatorios Automáticos
1. Configurar `CRON_SECRET` en variables de entorno
2. Configurar Vercel Cron en `vercel.json`

## 📊 Estado del Proyecto

- ✅ Lint pasando
- ✅ TypeScript pasando
- ✅ Tests pasando (22 tests)
- ✅ Production-ready

---

Ya hosteada en Vercel conectada al repositorio git
