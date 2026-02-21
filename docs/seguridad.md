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

### 1. Autenticación y Auditoría (Simulada/Fase 1)

- Actualmente se utiliza una capa de sesión simulada en `src/nucleo/seguridad/sesion.ts`.
- **Roadmap**: Migración completa a Supabase Auth para manejo seguro de contraseñas y MFA (Multi-Factor Authentication).

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
