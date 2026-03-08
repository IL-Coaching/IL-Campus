# SEGURIDAD DEL SISTEMA — IL-CAMPUS

## Modelo de Amenazas

El sistema IL-Campus maneja datos sensibles de clientes (salud, peso, información de contacto) y rutinas de entrenamiento. El acceso al panel de administración debe estar estrictamente protegido.

### Activos a Proteger

1. **Datos de Clientes**: Emails, teléfonos y notas de progreso.
2. **Lógica de Negocio**: Rutinas y planes de entrenamiento exclusivos.
3. **Credenciales**: Acceso al panel de entrenador.

### Amenazas Identificadas

- **A01:2025 — Control de Acceso**: Acceso no autorizado al panel administrativo o a datos de otros clientes.
- **A03:2025 — Inyección**: Inyección de SQL a través de formularios de alta o búsqueda.
- **A07:2025 — Fallos en Identificación**: Ataques de fuerza bruta al login del administrador.

## Decisiones de Seguridad

### 1. Autenticación JWT con MFA

- Se utiliza **JWT (JSON Web Tokens)** con firma HMAC-SHA256 para gestión de sesiones.
- Tokens almacenados en cookies httpOnly con atributos secure (producción) y sameSite.
- Duración: 7 días para sesiones persistentes.
- **MFA (Multi-Factor Authentication)** implementado con TOTP (Time-based One-Time Password).
- Tokens verificados en middleware y Server Actions mediante la librería `jose`.
- No existe fallback para JWT_SECRET en producción - el sistema falla si no está configurado.

### 2. Validación de Entradas

- Se utiliza el patrón de **Servicios** para centralizar la creación de datos.
- Todo dato proveniente de un `FormData` es validado antes de interactuar con la base de datos (Prisma).

### 3. Seguridad en la Base de Datos

- Las variables de conexión (`DATABASE_URL`, `DIRECT_URL`) se gestionan exclusivamente mediante `.env`.
- Se recomienda el uso de **Row Level Security (RLS)** una vez se integre Supabase Auth.

### 4. Headers de Seguridad

- Se deben configurar headers básicos (HSTS, X-Frame-Options, Content-Type-Options) en `next.config.mjs` o vía middleware.

## Checklist de Seguridad Regular

- [ ] Verificar que no existan `secrets` commiteados.
- [ ] Ejecutar `npm audit` para detectar dependencias vulnerables.
- [ ] Validar que el middleware de sesión proteja todas las rutas de `/entrenador/(dashboard)`.
